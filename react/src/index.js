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


const MAX_PLAYERS = 10
const DECK = deck
client.flushall()
client.on("error", e => console.log(e))
var PLAYED = []
var SOCKETS = new Map()

io.on('connection', (socket) => {
  socket.on('newGame', (id, player, callback) => {
    console.log("makePrivate",id, player, callback)
    client.exists(`${id}:game`, (exists) => {
      if(exists) {
        callback(false)
      } else {
        client.hmset(
          `${id}:game`,
          'turnCursor', 0,
          'isPrivate', 0,
          'blackCursor', 0,
          'whiteCursor', 0,
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
    console.log("card played",card)
    io.emit("whiteCardPlayed", [{card:card, user: player}])
    callback(true)
  })

  socket.on("chooseWhiteCard", (data, callback) => {
    console.log("card chosen",data.card)
    PLAYED.push(data.card)
    console.log("id",Object.keys(socket.rooms))
    console.log(client.hget(`${socket.rooms[0]}:game`, "pick"))
    client.hget(`${Object.keys(socket.rooms)[1]}:game`, "pick", (err, pick) => {
      console.log("pick", pick)
      console.log("number of played cards:",PLAYED.length)
      if (PLAYED.length === parseInt(pick)) {
        console.log("I should be sending 'winnerSelected'")
        io.to(Object.keys(socket.rooms)[1]).emit("winnerSelected", data.user, PLAYED)
      }
    })
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
  client.hincrby(`${id}:game`, "turnCursor", 1, (err, cursor) => {
    client.lindex(`${id}:players`, cursor - 1, (err, player) => callback(player))
  })
}

const nextRound = (id) => {
  console.log("nexRound:", id)
  console.log("returned:",client.lrange(`${id}:players`, 0, -1, console.log))
  client.hget(`${id}:game`, "pick", (err, whiteCount) => {
    console.log("whiteCount:", whiteCount)
    client.lrange(`${id}:players`, 0, -1, (err, players) => {
      console.log("players:", players)
      nextCzar(id, (czar) => {
        console.log("czar:", czar)
        io.to(id).emit('newCzar', czar)
        drawCards(id, "black", 1, (_black) => {
          console.log("_black", _black)
          const black = _black[0]
          client.hset(`${id}:game`, 'pick', black.pick)
          io.to(id).emit('dealBlack', black)
          players.forEach(player => {
            drawCards(id, "white", parseInt(whiteCount), (cards) => {
              console.log(player, cards)
              let isCzar = (player === czar)
              console.log(isCzar)
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
