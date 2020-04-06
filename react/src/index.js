import "@babel/polyfill";
import cors from "cors";
import bodyParser from "body-parser";
import user from "./routes/user";
import deck from "../deck.js";
const _ = require("lodash");
const redis = require("redis");
const client = redis.createClient();
const bcrypt = require("bcrypt");
const axios = require("axios");
const app = require("express")();
const port = 8080;
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
const corsOptions = {
  origin: "localhost:3000"
};
const DECK = {
  black: _.shuffle(deck.black),
  white: _.shuffle(deck.white)
}
app.use(cors(corsOptions));
app.use("/api/user", user);
const server = require("http").createServer(app);
const io = require("socket.io")(server);
server.listen(port, "0.0.0.0", () => {
  console.log(`listening on *:${port}`);
});
const MAX_PLAYERS = 10; // TODO: put in redis
client.flushall();
client.on("error", e => console.error(e));
var SOCKETS = new Map(); // TODO: put in redis

io.on("connection", socket => {
  socket.on("newGame", (id, player, callback) => {
    client.exists(`${id}:game`, exists => {
      if (exists) {
        callback(false);
      } else {
        client.hmset(
          `${id}:game`,
          "turnCursor", // TODO: deprecated
          0,
          "isPrivate",
          0,
          "blackCursor",
          0,
          "whiteCursor",
          0,
          "numberOfcardsPlayed",
          0,
          "numberOfPlayersReady",
          0,
          "pick",
          7,
          "started",
          0,
          OK => {
            addPlayer(id, player, false, socket, callback);
          }
        );
      }
    });

    socket.on("makePrivate", (id, password, callback) => {
      console.log("makePrivate", id, password, callback);
      if (!client.exists(`${id}:game`)) {
        callback(false);
      } else {
        console.log("exists");
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) console.error(err);
          client.hmset(`${id}:game`, "password", hash, "isPrivate", 1);
          callback(true);
        });
      }
    });
  });

  socket.on("joinGame", (id, player, callback) => {
    if (client.exists(id)) {
      client.hmget(
        `${id}:game`,
        "isPrivate",
        "started",
        "password",
        (err, [isPrivate, started, hash]) => {
          if (parseInt(isPrivate)) {
            socket.emit("requestPassword", password => {
              bcrypt.compare(password, hash, (err, result) => {
                if (err) {
                  console.error(err);
                  socket.emit("failure", {
                    message: "internal error"
                  });
                  return;
                }
                if (result) {
                  addPlayer(id, player, !!parseInt(started), socket, callback);
                  return;
                }
                callback(false);
              });
            });
          } else {
            addPlayer(id, player, !!parseInt(started), socket, callback);
          }
        }
      );
    } else {
      callback(false);
    }
  });

  socket.on("startGame", (id, callback) => {
    nextRound(id);
    callback(true);
  });

  socket.on("chooseWinner", card => {
    io.to(socket.rooms[0]).emit("winnerSelected", card);
    nextRound(socket.rooms[0]);
  });

  socket.on("playWhiteCard", (card, player, callback) => {
    const room = Object.keys(socket.rooms)[1];
    client.hincrby(`${room}:${player}`, "numberOfCards", -1, handleRedisError);
    client.hincrby(
      `${room}:game`,
      "numberOfCardsPlayed",
      1,
      (err, numberOfCardsPlayed) => {
        if (err) console.error(err);
        client.hget(`${room}:game`, "pick", (err, pick) => {
          if (err) console.error(err);
          client.hget(
            `${room}:${player}`,
            "playedCards",
            (err, playedCardsString) => {
              if (err) console.error(err);
              let playedCardsJson = JSON.parse(playedCardsString);
              let playedCards = playedCardsJson.length
                ? playedCardsJson.map(string => JSON.parse(string)).push(card)
                : [card];
              if (pick == playedCards.length) {
                io.to(room).emit(
                  "whiteCardPlayed",
                  playedCards.map(_card => ({
                    card: _card,
                    user: player
                  }))
                );
                client.hset(
                  `${room}:${player}`,
                  "playedCards",
                  "[]",
                  handleRedisError
                );
              } else {
                client.hset(
                  `${room}:${player}`,
                  "playedCards",
                  JSON.stringify([playedCards]),
                  handleRedisError
                );
              }
            }
          );
          client.llen(`${room}:players`, (err, numPlayers) => {
            if (err) console.error(err);
            if (numberOfCardsPlayed == (numPlayers - 1) * parseInt(pick)) {
              io.to(room).emit("allCardsPlayed");
              client.hset(`${room}:game`, "numberOfCardsPlayed", 0, err =>
                console.error(err)
              );
            }
            callback(true);
          });
        });
      }
    );
  });

  socket.on("ready", ready => {
    const room = Object.keys(socket.rooms)[1];
    client.hincrby(
      `${room}:game`,
      "numberOfPlayersReady",
      1,
      (err, numberOfPlayersReady) => {
        if (err) console.error(err);
        client.hget(`${room}:game`, "pick", (err, pick) => {
          if (err) console.error(err);
          client.llen(`${room}:players`, (err, numPlayers) => {
            if (err) console.error(err);
            if (numberOfPlayersReady == numPlayers) {
              nextRound(room);
              client.hset(
                `${room}:game`,
                "numberOfPlayersReady",
                0,
                handleRedisError
              );
            }
          });
        });
      }
    );
  });

  socket.on("chooseWhiteCard", (data, callback) => {
    const room = Object.keys(socket.rooms)[1];
    client.lpush(
      `${room}:winningCards`,
      JSON.stringify(data.card),
      (err, numberOfChoseCards) => {
        handleRedisError(err);
        client.hget(`${room}:game`, "pick", (err, pick) => {
          if (numberOfChoseCards == parseInt(pick)) {
            client.lrange(
              `${room}:winningCards`,
              0,
              -1,
              (err, chosenCardsStrings) => {
                let chosenCards = chosenCardsStrings.map(string =>
                  JSON.parse(string)
                );
                io.to(room).emit("winnerSelected", data.user, chosenCards);
              }
            );
            client.del(`${room}:winningCards`);
          }
        });
      }
    );
  });
});

const addPlayer = (id, player, started, socket, callback) => {
  console.log("adding:", player);
  client.rpush(`${id}:players`, player, (err, len) => {
    if (len > MAX_PLAYERS) {
      client.rpop(`${id}:players`, (err, popped) => {
        if (popped !== player) {
          console.error(Error("popped the wrong player"));
        }
      });
      socket.emit("failure", {
        message: "Game full"
      });
      callback(false);
    } else {
      client.hset(`${id}:${player}`, "playedCards", "[]", handleRedisError);
      client.hset(`${id}:${player}`, "cards", "[]", handleRedisError);
      SOCKETS.set(player, socket);
      socket.join(id, err => {
        if (err) {
          console.error(err);
        } else {
          callback(true);
        }
      });
    }
  });
};

const nextCzar = (id, callback) => {
  client.lpop(`${id}:players`, (err, czar) => {
    handleRedisError(err);
    client.rpush(`${id}:players`, czar, handleRedisError);
    callback(czar);
  });
};

const _drawCards = (room, color, n, callback) => {
  client.hincrby(`${room}:game`, `${color}Cursor`, n, (err, cursor) => {
    handleRedisError(err);
    callback(DECK[color].slice(cursor - n, cursor));
  })
};

const drawCards = (filterfn, room, color, n, callback) => {
  let f = (newN, oldCards) => {
    _drawCards(room, color, newN, newCards => {
      let filtered = oldCards.concat(newCards.filter(filterfn));
      if (filtered.length < newN) return f(newN - filtered.length, filtered)
      callback(filtered);
    });
  };
  f(n, []);
};

const wfilter = (card) => !card.text.includes('*')
const bfilter = (card) => card.pick < 2

const setPlayerCards = (room, player, cards, callback) => {
  client.hset(`${room}:${player}`, "cards", JSON.stringify(
      cards
    ), (e,r) => {
      handleRedisError(e)
      callback ? callback(cards) : null
    }
  );
}

const getPlayerCards = (room, player, callback) => {
  client.hget(`${room}:${player}`, "cards", (e,r) => {
    handleRedisError(e)
    callback
      ? r 
        ? callback(JSON.parse(r)) 
        : callback(false)
      : null
  })
}

const dealWhiteCards = (room, player, callback) => {
  getPlayerCards(room, player, (cards) => {
    drawCards(wfilter, room, "white", 7 - cards.length, (newCards) => {
      let cardsDealt = [...cards, ...newCards]
      setPlayerCards(room, player, cardsDealt)
      SOCKETS.get(player).emit("dealWhite", cardsDealt)
      callback ? callback(cards) : null
    })
  })
}

const dealBlackCard = (room, callback) => {
  drawCards(bfilter, room, "black", 1, (_black) => {
    const black = _black[0]
    client.hset(`${room}:game`, 'pick', black.pick)
    io.to(room).emit('dealBlack', black)
    callback ? callback(black) : null
  })
}

const nextRound = (room) => {
  client.lrange(`${room}:players`, 0, -1, (err, players) => {
    handleRedisError(err)
    nextCzar(room, (czar) => {
      io.to(room).emit('newCzar', czar)
      dealBlackCard(room)
      players.forEach(player => {
        SOCKETS.get(player).emit("myTurn", (player == czar))
        dealWhiteCards(room, player)
      })
    })
  })
}

const handleRedisError = (err) => {
  if (err instanceof Error) {
    console.error(err)
  }
}
