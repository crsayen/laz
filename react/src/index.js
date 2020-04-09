import "@babel/polyfill";
import cors from "cors";
import bodyParser from "body-parser";
import user from "./routes/user";
import deck from "../deck.js";
const _ = require("lodash");
const asyncRedis = require("async-redis");
const client = asyncRedis.createClient();
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

  socket.on("newGame", async (room, player, callback) => {
    console.log("newGame event")
    let exists = await client.exists(`${room}:game`)
    if (exists) {
      callback(false);
    } else {
      await client.hmset(
        `${room}:game`,
        "isPrivate", 0,
        "blackCursor", 0,
        "whiteCursor", 0,
        "numberOfcardsPlayed", 0,
        "numberOfPlayersReady", 0,
        "pick", 7,
        "started", 0
      )
      addPlayer(room, player, false, socket, async (success) => {
        let len = await client.rpush('openGames', room)
        console.log("new game:", room)
        callback(true)
      })
    }
  })

  socket.on("makePrivate", async (room, password, callback) => {
    console.log("makePrivate", room, password, callback);
    if (! await client.exists(`${room}:game`)) {
      callback(false);
    } else {
      console.log("exists");
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) console.error(err);
        client.hmset(`${room}:game`, "password", hash, "isPrivate", 1);
        callback(true);
      });
    }
  });

  socket.on("getOpenGames", getOpenGames)

  socket.on("joinGame", async (room, player, callback) => {
    if (await client.exists(room)) {
      let [isPrivate, started, hash] = await client.hmget(
        `${room}:game`,
        "isPrivate",
        "started",
        "password",
      )
      addPlayer(room, player, !!parseInt(started), socket, callback);
    } else {
      callback(false);
    }
  });

  socket.on("startGame", (room, callback) => {
    nextRound(room);
    callback(true);
  });

  socket.on("chooseWinner", card => {
    io.to(socket.rooms[0]).emit("winnerSelected", card);
    nextRound(socket.rooms[0]);
  });

  socket.on("playWhiteCard", async (card, player, callback) => {
    const room = Object.keys(socket.rooms)[1];
    getPlayerCards(room, player, cards => {
      console.log("preFiltrer", cards)
      setPlayerCards(room, player, cards.filter(c => c.text != card.text), (cards) => {
        console.log("postFilter", cards)
      })
      let numberOfCardsPlayed = await client.hincrby(`${room}:game`, "numberOfCardsPlayed", 1)
      let pick = await client.hget(`${room}:game`, "pick")
      let playedCardsString = await client.hget(`${room}:${player}`, "playedCards")
      let playedCardsJson = JSON.parse(playedCardsString)
      let playedCards = playedCardsJson.length
        ? playedCardsJson.map(string => JSON.parse(string)).push(card)
        : [card]
      if (pick == playedCards.length) {
        io.to(room).emit(
          "whiteCardPlayed",
          playedCards.map(_card => ({
            card: _card,
            user: player
          }))
        )
        client.hset(`${room}:${player}`, "playedCards", "[]")
      } else {
        client.hset(
          `${room}:${player}`,
          "playedCards",
          JSON.stringify([playedCards]),
          handleRedisError
        )
      }
      let numPlayers = await client.llen(`${room}:players`)
      if (err) console.error(err);
      if (numberOfCardsPlayed == (numPlayers - 1) * parseInt(pick)) {
        io.to(room).emit("allCardsPlayed");
        client.hset(`${room}:game`, "numberOfCardsPlayed", 0)
      }
      callback(true);
    }
    );
  });

  socket.on("ready", async ready => {
    const room = Object.keys(socket.rooms)[1]
    let numberOfPlayersReady =
      await client.hincrby(`${room}:game`, "numberOfPlayersReady", 1)
    let numPlayers = await client.llen(`${room}:players`)
    if (numberOfPlayersReady == numPlayers) {
      nextRound(room)
      client.hset(`${room}:game`, "numberOfPlayersReady", 0)
    }
  })

  socket.on("chooseWhiteCard", async (data, callback) => {
    const room = Object.keys(socket.rooms)[1]
    let numberOfChoseCards =
      await client.lpush(`${room}:winningCards`, JSON.stringify(data.card))
    let pick = await client.hget(`${room}:game`, "pick")
    if (numberOfChoseCards == parseInt(pick)) {
      let chosenCardsStrings = client.lrange(`${room}:winningCards`, 0, -1)
      let chosenCards = chosenCardsStrings.map(s => JSON.parse(s))
      io.to(room).emit("winnerSelected", data.user, chosenCards)
      client.del(`${room}:winningCards`)
    }
  })

  socket.on("disconnect", async () => {
    let nameRoom = await client.hmget(`${socket.id}`, 'name', 'room')
    let [name, room] = nameRoom
    await client.lrem(`${room}:players`, 1, name)
    await client.del(`${room}:${name}`)
    console.log("removing player:", name)
    SOCKETS.delete(name)
    let players = await client.lrange(`${room}:players`, 0, -1)
    if (players.length) {
      io.to(room).emit("updatePlayers",
        Array.from(
          new Set(
            players.map(p => ({ name: p, score: "TODO" }))
          )
        )
      )
    } else {
      client.del(`${room}:game`)
      client.del(`${room}:players`)
    }
  })
})

const getOpenGames = async (callback) => {
  var GAMES = []
  const compileGames = (game, numPlayers, numGames, callback) => {
    GAMES.push({ name: game, players: numPlayers, leader: 'TODO' })
    if (GAMES.length == numGames) {
      callback(GAMES)
    }
  }
  let games = await client.lrange("openGames", 0, -1)
  games.forEach(game => {
  let players = await client.lrange(`${game}:players`, 0, -1)
    compileGames(game, players.length, games.length, callback)
  })
}

const addPlayer = async (room, player, started, socket, callback) => {
  console.log("adding:", player, "room:", room);
  let len = await client.llen(`${room}:players`)
  if (len > MAX_PLAYERS) {
    client.rpop(`${room}:players`)
    callback(false);
  } else {
    client.rpush(`${room}:players`, player)
    client.hset(`${room}:${player}`, "playedCards", "[]");
    client.hset(`${room}:${player}`, "cards", "[]");
    client.hmset(`${socket.id}`, 'name', player, 'room', room)
    SOCKETS.set(player, socket);
    socket.join(room, err => {
      dealWhiteCards(room, player)
      let players = await client.lrange(`${room}:players`, 0, -1)
      io.to(room).emit(
        "updatePlayers", Array.from(
          new Set(
            players.map(p => ({ name: p, score: "TODO" }))
          )
        )
      )
    })
    callback(true);
  }
};

const nextCzar = async (room, callback) => {
  let czar = await client.lpop(`${room}:players`)
  handleRedisError(err);
  client.rpush(`${room}:players`, czar, handleRedisError);
  callback(czar);
};

const _drawCards = async (room, color, n, callback) => {
  let cursor = await client.hincrby(`${room}:game`, `${color}Cursor`, n)
  handleRedisError(err);
  callback(DECK[color].slice(cursor - n + 1, cursor + 1));
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
  client.hset(`${room}:${player}`, "cards", JSON.stringify(cards))
}

const getPlayerCards = async (room, player, callback) => {
  let r = await client.hget(`${room}:${player}`, "cards")
  callback
    ? callback(JSON.parse(r))
    : null
}

const dealWhiteCards = (room, player, callback) => {
  getPlayerCards(room, player, (cards) => {
    console.log("player cards", cards)
    drawCards(wfilter, room, "white", 7 - cards.length, (newCards) => {
      console.log("newCards", newCards)
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

const nextRound = async (room) => {
  let players = await client.lrange(`${room}:players`, 0, -1)
  nextCzar(room, (czar) => {
    io.to(room).emit('newCzar', czar)
    dealBlackCard(room)
    players.forEach(player => {
      SOCKETS.get(player).emit("myTurn", (player == czar))
      dealWhiteCards(room, player)
    })
  })
}

const handleRedisError = (err) => {
  if (err instanceof Error) {
    console.error(err)
  }
}
