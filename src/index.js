import "@babel/polyfill";
import cors from "cors";
import bodyParser from "body-parser";
import user from "./routes/user";
import deck from "../deck.js";
const _ = require("lodash");
const asyncRedis = require("async-redis");
const client = asyncRedis.createClient();
const app = require("express")();
const port = 8090;
require('dotenv').config();

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', req.header('origin')
|| req.header('x-forwarded-host') || req.header('referer') || req.header('host'));
  next();
 });
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
const DECK = {
  black: _.shuffle(deck.black),
  white: _.shuffle(deck.white)
}
app.use(cors());
//app.use("/api/user", user);
console.log(process.env.NODE_ENV)
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
const server = require("http").createServer(app);
const io = require("socket.io")(server);
//if (process.env.NODE_ENV == "development") { io.set('origins', 'http://localhost:3000'); };
server.listen(port, "0.0.0.0", () => {
  console.log(`listening on *:${port}`);
});
const MAX_PLAYERS = 10; // TODO: put in redis
client.flushall();
client.on("error", e => console.error(e));
var SOCKETS = new Map(); // TODO: put in redis

// TODO: make it so that you can press enter to 'create' in new-game popup
// TODO: when someone joins, do a popup that introduces the player to everyone
// TODO: PARTIAL FIX - old game continues to display after player joins a new game
// TODO: after changing game rooms, player is czar twice before it switches czars
// TODO: number of players not changing in games list
// TODO: unstable flush: https://lazaretto.slack.com/archives/D010RBXBL75/p1589509841001400

 /*********************************************************************************
  * ** REDIS SCHEMA **
  * //TODO: this schema likely requires some re-working. It isn't ideal. It was improvised without forthought
  * <room>:game             hash
  *   blackCursor           int       keeps track of which black card the game is on
  *   whiteCursor           int       keeps track of which white card the game is on
  *   numberOfCardsPlayed   int       self explanatory
  *   numberOfPlayersReady  int       self explanatory //TODO: rather than keeping a counter, give <game>:player a 'ready' field and count them
  *   pick                  int       how many white cards each player must submit
  *   started               bool      whether the game has started or not //TODO: actually utilize this. we dont touch it.
  *   owner                 string    the name of the player who started the game
  *
  * <room>:players          list      a list of the names of the players in the game
  *
  * <room>:player           hash
  *   cards                 list      a list of the players cards, JSON.stringified
  *   playedCards           list      a list of the cards the player has submitted, JSON.stringified
  */


io.on("connection", socket => {

  socket.on("newGame", async (room, player, callback) => {
    console.log(`new game ${room}, started by ${player}`)
    if (await client.exists(`${room}:game`)) {
      callback(false);
    } else {
      await client.hmset(
        `${room}:game`,
        "blackCursor", 0,
        "whiteCursor", 0,
        "numberOfcardsPlayed", 0,
        "numberOfPlayersReady", 0,
        "pick", 7,
        "started", 0,
        "owner", player
      )
      addPlayer(room, player, false, socket, async (data) => {
        if (data) {
          client.rpush('openGames', room)
          console.log("new game:", room)
          callback(data)
          return
        }
        callback(false)
      })
    }
  })

  socket.on("getOpenGames", getOpenGames)

  socket.on("joinGame", async (room, player, callback) => {
    console.log(`${player} joined ${room}`)
    if (await client.exists(`${room}:game`)) {
      let started = await client.hget(`${room}:game`,'started')
      addPlayer(room, player, !!parseInt(started), socket, callback);
    } else {
      callback(false);
    }
  });

  socket.on("startGame", async (room, callback) => {
    console.log(`starting ${room}`)
    await client.hset(`${room}:game`, 'started', true)
    nextRound(room);
    callback(true);
    io.to(room).emit('gameStarted', true)
  });

  socket.on("chooseWinner", card => {
    console.log(`winner: ${card}`)
    io.to(socket.rooms[0]).emit("winnerSelected", card);
    nextRound(socket.rooms[0]);
  });

  socket.on("playWhiteCard", async (card, player, callback) => {
    console.log(`${player} chose "${card.text}"`)
    const room = Object.keys(socket.rooms)[1];
    let cards = await getPlayerCards(room, player)
    console.log("preFiltrer", cards)
    setPlayerCards(room, player, cards.filter(c => c.text != card.text))
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

  socket.on("chooseWhiteCard", async (data) => {
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
  console.log(`adding ${player} to ${room}`);
  let len = await client.llen(`${room}:players`)
  let owner = await client.hget(`${room}:game`, 'owner')
  if (len > MAX_PLAYERS) {
    client.rpop(`${room}:players`)
    callback(false);
  }
  else {
    client.rpush(`${room}:players`, player)
    client.hmset(`${room}:${player}`, "playedCards", "[]", "cards", "[]");
    client.hmset(`${socket.id}`, 'name', player, 'room', room)
    SOCKETS.set(player, socket);
    console.log('started', started)
    socket.emit('gameStarted', started)
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
    callback({id: room, owner: owner, started: started});
  }
};

const nextCzar = async (room) => {
  let czar = await client.lpop(`${room}:players`)
  client.rpush(`${room}:players`, czar);
  console.log("next czar", czar)
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

const setPlayerCards = (room, player, cards) => {
  client.hset(`${room}:${player}`, "cards", JSON.stringify(cards))
}

const getPlayerCards = async (room, player) => {
  let r = await client.hget(`${room}:${player}`, "cards")
  return JSON.parse(r)
}

const dealWhiteCards = async (room, player, callback) => {
  console.log(`dealing white cards to ${player} in ${room}`)
  let cards = await getPlayerCards(room, player)
  console.log(`${player} has ${cards.length} cards`)
  let newCards = await drawCards(wfilter, room, "white", 7 - cards.length)
  console.log(`${player} will get ${newCards.length} new cards`)
  let cardsDealt = [...cards, ...newCards]
  setPlayerCards(room, player, cardsDealt)
  SOCKETS.get(player).emit("dealWhite", cardsDealt)
  callback ? callback(cards) : null
}

const dealBlackCard = async (room, callback) => {
  console.log(`dealing black card to ${room}`)
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
