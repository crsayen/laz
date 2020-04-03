import "@babel/polyfill";
import cors from "cors";
import bodyParser from "body-parser";
import user from "./routes/user";
import deck from "../deck.js"
const _ = require('lodash');
const redis = require("redis");
const client = redis.createClient();
const bcrypt = require('bcrypt');
const axios = require('axios');
const app = require('express')();
const port = 8080;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
const corsOptions = {
    origin: 'localhost:3000'
  }
app.use(cors(corsOptions));
app.use('/api/user', user);
const server = require('http').createServer(app);
const io = require('socket.io')(server);
server.listen(port, "0.0.0.0", () => {
    console.log(`listening on *:${port}`);
});


const MAX_PLAYERS = 10 // TODO: put in redis
const DECK = deck // TODO: put in redis
client.flushall()
client.on("error", e => console.log(e))
var SOCKETS = new Map() // TODO: put in redis

io.on('connection', (socket) => {
  socket.on('newGame', (id, player, callback) => {
    console.log("makePrivate",id, player, callback)
    client.exists(`${id}:game`, (exists) => {
      if(exists) {
        callback(false)
      } else {
        client.hmset(
          `${id}:game`,
          'turnCursor', 0, // TODO: deprecated
          'isPrivate', 0,
          'blackCursor', 0,
          'whiteCursor', 0,
          'numberOfcardsPlayed', 0,
          'numberOfPlayersReady', 0,
          'pick', 7,
          'started', 0, (OK) => {
            addPlayer(id, player, false, socket, callback)
        })
      }
    })

    socket.on('makePrivate', (id, password, callback) => {
      console.log("id",id)
      console.log("makePrivate",id, password, callback)
      if (!client.exists(`${id}:game`)){
        callback(false)
      } else {
        console.log("exists")
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) console.error(err)
          client.hmset(`${id}:game`, 'password', hash, 'isPrivate', 1)
          callback(true)
        })
      }
    })
  });

  socket.on('joinGame', (id, player, callback) => {
    console.log("makePrivate",id, player, callback)
      if (client.exists(id)){
        client.hmget(
          `${id}:game`,
          "isPrivate",
          "started",
          "password",
          (err, [isPrivate, started,  hash]) => {
            if (parseInt(isPrivate)){
              console.log("isPrivate")
              socket.emit("requestPassword", (password) => {
                bcrypt.compare(password, hash, (err, result) => {
                  if( err ) {
                    console.error(err)
                    socket.emit("failure", {message: "internal error"})
                    return
                  }
                  if (result){
                    addPlayer(id, player, !!parseInt(started), socket, callback)
                    return
                  }
                  callback(false)
                })
              })
            } else {
              addPlayer(id, player, !!parseInt(started), socket, callback)
            }
          }
        )
      } else {
        callback(false)
      }
  })

  socket.on('startGame', (id, callback) => {
    console.log(id, callback)
    nextRound(id)
    callback(true)
  })

  socket.on('chooseWinner', (card) => {
    io.to(socket.rooms[0]).emit("winnerSelected", card)
    nextRound(socket.rooms[0])
  })

  socket.on("playWhiteCard", (card, player, callback) => {
    const room = Object.keys(socket.rooms)[1]
    client.hincrby(`${room}:game`, 'numberOfCardsPlayed', 1, (err, numberOfCardsPlayed) => {
      if (err) console.error(err)
      console.log("numberOfCardsPlayed",numberOfCardsPlayed)
      client.hget(`${room}:game`, "pick", (err, pick) => {
        if (err) console.error(err)
        client.hget(`${room}:${player}`, "playedCards", (err, playedCardsString) => {
          if (err) console.error(err)
          let playedCardsJson = JSON.parse(playedCardsString)
          console.log("playedCardsJson", playedCardsJson)
          let playedCards = (
            (playedCardsJson.length) 
            ? playedCardsJson.map((string) => JSON.parse(string)).push(card)
            : [card]
          )
          console.log("card", card)
          console.log("playedCards", playedCards)
          if (pick == playedCards.length) {
            io.to(room).emit(
              "whiteCardPlayed",
              playedCards.map(_card => (
                {card: _card, user: player}
              ))
            )
            client.hset(`${room}:${player}`, "playedCards", "[]")
          } else {
            client.hset(`${room}:${player}`, "playedCards", JSON.stringify([playedCards]))
          }
        })
        console.log("pick", pick)
        client.llen(`${room}:players`, (err, numPlayers) => {
          if (err) console.error(err)
          console.log("numPlayers", numPlayers)
          if (numberOfCardsPlayed == (numPlayers - 1) * parseInt(pick)){
            console.log("allCardsPlayed")
            io.to(room).emit("allCardsPlayed")
            client.hset(`${room}:game`, 'numberOfCardsPlayed', 0, (err) => console.error(err))
          }
          callback(true)
        })
      })
    })
  })

  socket.on("ready", (ready) => {
    console.log(ready)
    const room = Object.keys(socket.rooms)[1]
    console.log("room", room)
    client.hincrby(`${room}:game`, 'numberOfPlayersReady', 1, (err, numberOfPlayersReady) => {
      if (err) console.error(err)
      client.hget(`${room}:game`, "pick", (err, pick) => {
        if (err) console.error(err)
        client.llen(`${room}:players`, (err, numPlayers) => {
          if (err) console.error(err)
          if (numberOfPlayersReady == numPlayers){
            nextRound(room)
            client.hset(`${room}:game`, 'numberOfPlayersReady', 0, (err) => console.error(err))
          }
        })
      })
    })
  })

  socket.on("chooseWhiteCard", (data, callback) => {
    const room = Object.keys(socket.rooms)[1]
    console.log("id",Object.keys(socket.rooms))
    console.log("card chosen",data.card)
    client.lpush(`${room}:winningCards`,
      JSON.stringify(data.card),
      (err, numberOfChoseCards) => {
        if (err) console.error(err)
        client.hget(`${room}:game`, "pick", (err, pick) => {
          if (numberOfChoseCards == parseInt(pick)) {
            client.lrange(`${room}:winningCards`, 0, -1, (err, chosenCardsStrings) => {
              let chosenCards = chosenCardsStrings.map((string) => JSON.parse(string))
              console.log(chosenCardsStrings)
              io.to(room).emit("winnerSelected",
                data.user,
                chosenCards
              )
            })
            client.del(`${room}:winningCards`)
          }
        })
      }
    )
  })
})

const addPlayer = (id, player, started, socket, callback) => {
  console.log("adding:", player)
  client.rpush(`${id}:players`, player, (err, len) => {
    if (len > MAX_PLAYERS) {
      client.rpop(`${id}:players`, (err, popped) => {
          if (popped !== player) {
              console.error(Error("popped the wrong player"))
          }
      })
      console.log("too many players")
      socket.emit("failure", {message: "Game full"})
      callback(false)
    } else {
      client.hset(`${id}:${player}`, "playedCards", "[]", (err) => console.error(err))
      client.hset(`${id}:${player}`, 'numberOfCards', 0, (err) => console.error(err))
      SOCKETS.set(player,socket)
      socket.join(id, (err) => {
        if (err) {
          console.error(err)
        } else {
          callback(true)
        }
      })
    }
  })
}

const drawCards = (id, color, n, callback) => {
  var cards
  client.hincrby(`${id}:game`, `${color}Cursor`, n, (err, cursor) => {
    if (err) console.error(err)
    if (cursor + n > DECK[color].length) {
      callback(false)
    }
    callback(DECK[color].slice(cursor - n, cursor))
  })
}

const nextCzar = (id, callback) => {
  client.lpop(`${id}:players`, (err, czar) => {
    client.rpush(`${id}:players`, czar, (err) => (err) ? console.log(err) : null)
    callback(czar)
  })
}

const nextRound = (id) => {
  client.lrange(`${id}:players`, 0, -1, (err, players) => {
    nextCzar(id, (czar) => {
      io.to(id).emit('newCzar', czar)
      drawCards(id, "black", 1, (_black) => {
        const black = _black[0]
        client.hset(`${id}:game`, 'pick', black.pick)
        io.to(id).emit('dealBlack', black)
        players.forEach(player => {
          client.hget(`${id}:${player}`, 'numberOfCards', (numberOfCards) => {
            drawCards(id, "white", 7 - numberOfCards, (cards) => {
              let isCzar = (player === czar)
              SOCKETS.get(player).emit("myTurn", isCzar)
              if (!isCzar){
                if (cards) {
                  SOCKETS.get(player).emit("dealWhite", cards)
                  return
                }
                io.to(id).emit("failure", {message: "Ran out of cards"})
              }
            })
          })
        })
      })
    })
  })
}
