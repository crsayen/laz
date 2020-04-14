import "@babel/polyfill";
import cors from "cors";
import bodyParser from "body-parser";
import user from "./routes/user";
import deck from "../deck.js";
const _ = require("lodash");
const asyncRedis = require("async-redis");
const client = asyncRedis.createClient(6379, '10.128.0.9');
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
  origin: "35.223.229.47:3000"
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
const MAX_PLAYERS = 15
const MIN_PLAYERS = 3
client.flushall()
client.on("error", e => console.error(e))
var SOCKETS = new Map()

io.on("connection", socket => {

  socket.on("newGame", async (room, player, callback) => {
    console.log("newGame", room, player)
    if (await client.exists(`${room}:game`)) {
      callback(false);
    }
    else {
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
        if (success) {
          client.rpush('openGames', room)
          console.log("new game:", room)
          callback(true)
          return
        }
        callback(false)
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
    console.log("joinGame", room, player)
    if (await client.exists(`${room}:game`)) {
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

  socket.on("startGame", async (room, callback) => {
    let numPlayers = await client.llen(`${room}:players`)
    if (numPlayers > MIN_PLAYERS) {
      console.log("startGame", room)
      nextRound(room);
      callback(true);
    }
    else {
      console.log("not enough players to start:", room)
      callback(false)
    }
  });

  socket.on("chooseWinner", card => {
    console.log("chooseWinner", card)
    io.to(socket.rooms[0]).emit("winnerSelected", card);
    nextRound(socket.rooms[0]);
  });

  socket.on("playWhiteCard", async (card, player, callback) => {
    console.log("chooseWhiteCard", card, player)
    const room = Object.keys(socket.rooms)[1];
    let cards = await getPlayerCards(room, player)
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
        JSON.stringify([playedCards])
      )
    }
    let numPlayers = await client.llen(`${room}:players`)
    if (numberOfCardsPlayed == (numPlayers - 1) * parseInt(pick)) {
      io.to(room).emit("allCardsPlayed");
      client.hset(`${room}:game`, "numberOfCardsPlayed", 0)
    }
    callback(true);
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
    let numberOfChosenCards =
      await client.lpush(`${room}:winningCards`, JSON.stringify(data.card))
    let pick = await client.hget(`${room}:game`, "pick")
    if (numberOfChosenCards == parseInt(pick)) {
      let chosenCardsStrings = await client.lrange(`${room}:winningCards`, 0, -1)
      let chosenCards = chosenCardsStrings.map(s => JSON.parse(s))
      io.to(room).emit("winnerSelected", data.user, chosenCards)
      client.del(`${room}:winningCards`)
    }
  })

  socket.on("disconnect", async () => {
    let [name, room] = await client.hmget(`${socket.id}`, 'name', 'room')

    if (await client.llen(`${room}:players`)) {
      client.lrem(`${room}:players`, 1, name)
      console.log("removing player:", name)
    }

    await client.del(`${room}:${name}`)
    SOCKETS.delete(name)
    let players = await client.lrange(`${room}:players`, 0, -1)
    // If any players remain, update the room with the new list
    if (players.length) {
      // Array.from(new Set(...)) is used to remove duplicates
      io.to(room).emit("updatePlayers",
        Array.from(
          new Set(
            players.map(p => ({ name: p, score: "TODO" }))
          )
        )
      )
    }
    else {
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
  games.forEach(async game => {
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
  }
  else {
    client.rpush(`${room}:players`, player)
    client.hmset(`${room}:${player}`, "playedCards", "[]", "cards", "[]");
    client.hmset(`${socket.id}`, 'name', player, 'room', room)
    SOCKETS.set(player, socket);
    socket.join(room, async () => {
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

const nextCzar = async (room) => {
  let czar = await client.lpop(`${room}:players`)
  client.rpush(`${room}:players`, czar);
  return czar
};

const _drawCards = async (room, color, n) => {
  let cursor = await client.hincrby(`${room}:game`, `${color}Cursor`, n)
  return DECK[color].slice(cursor - n + 1, cursor + 1)
}

const drawCards = async (filterfn, room, color, n) => {
  let f = async (newN, oldCards) => {
    let newCards = await _drawCards(room, color, newN)
    let filtered = oldCards.concat(newCards.filter(filterfn));
    if (filtered.length < newN) return f(newN - filtered.length, filtered)
    return filtered
  };
  return f(n, []);
};

const wfilter = (card) => !card.text.includes('*')
const bfilter = (card) => card.pick < 2

const setPlayerCards = (room, player, cards, callback) => {
  client.hset(`${room}:${player}`, "cards", JSON.stringify(cards))
}

const getPlayerCards = async (room, player) => {
  let r = await client.hget(`${room}:${player}`, "cards")
  return JSON.parse(r)
}

const dealWhiteCards = async (room, player, callback) => {
  console.log("dealWhiteCards", room, player)
  let cards = await getPlayerCards(room, player)
  console.log("player cards", cards)
  let newCards = await drawCards(wfilter, room, "white", 7 - cards.length)
  console.log("newCards", newCards)
  let cardsDealt = [...cards, ...newCards]
  setPlayerCards(room, player, cardsDealt)
  SOCKETS.get(player).emit("dealWhite", cardsDealt)
  callback ? callback(cards) : null
}

const dealBlackCard = async (room, callback) => {
  console.log("dealBlackCard", room)
  let _black = await drawCards(bfilter, room, "black", 1)
  const black = _black[0]
  client.hset(`${room}:game`, 'pick', black.pick)
  io.to(room).emit('dealBlack', black)
  callback ? callback(black) : null
}

const nextRound = async (room) => {
  let players = await client.lrange(`${room}:players`, 0, -1)
  let czar = await nextCzar(room)
  io.to(room).emit('newCzar', czar)
  dealBlackCard(room)
  players.forEach(player => {
    SOCKETS.get(player).emit("myTurn", (player == czar))
    dealWhiteCards(room, player)
  })
}
