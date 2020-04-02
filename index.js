// https://raw.githubusercontent.com/crhallberg/json-against-humanity/master/full.md.json
const _ = require('lodash');
const redis = require("redis");
const client = redis.createClient();
const bcrypt = require('bcrypt');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const axios = require('axios');

const MAX_PLAYERS = 10

client.on("error", e => console.log(e))

var SOCKETS = new Map()

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

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
          'started', 0, (OK) => {
            addPlayer(id, player, false, socket, () => {
              socket.join(id, (err) => {
                if (err) {
                  console.error(err)
                } else {
                  callback(true)
                }
              }
            )
          })
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
                    addPlayer(id, player, !!parseInt(started), callback)
                    return
                  }
                  callback(false)
                })
              })
            } else {
              addPlayer(id, player, !!parseInt(started), callback)
            }
          }
        )
      } else {
        callback(false)
      }
  })

  socket.on('chooseWinner', (card) => {
    io.to(socket.rooms[0]).emit("winnerSelected", card)
    nextRound(socket.rooms[0])
  })

  socket.on("playWhiteCard", (card, callback) => {
    console.log(card)
    callback(true)
  })

  socket.on("chooseWhiteCard", (card, callback) => {
    console.log(card)
    callback(true)
  })

})

const addPlayer = (id, player, started, socket, callback) => {
  console.log("adding:", player)
  var result
  client.rpush(`${id}:players`, player, (len) => {
    if (len > MAX_PLAYERS) {
      client.rpop(`${id}:players`)
      console.log("too many players")
      socket.emit("failure", {message: "Game full"})
      callback(false)
    } else {
      SOCKETS.set(player,socket)
      callback(true)
    }
  })
  return result
}

http.listen(3000, () => {
  console.log('listening on *:3000');
});

const drawCards = (id, color, n, callback) => {
  var cards
  client.hincrby(`${id}:game`, `${color}Cursor`, n, (cursor) => {
    if (cursor + n > DECK[color].length) {
      callback(false)
    }
    callback(DECK[color].slice(cursor - n, n))
  })
}

const nextCzar = (id, callback) => {
  client.hincrby(`${id}:game`, "turnCursor", 1, (cursor) => {
    client.lindex(`${id}:players`, cursor - 1, callback)
  })
}

const nextRound = (id) => {
  client.lrange(`${id}:players`, 0, -1, (players) => {
    nextCzar(id, (czar) => {
      drawCards(id, "black", 1, (_black) => {
          const black = _black[0]
          io.to(id).emit('dealBlack', black)
          players.forEach(player => {
            drawCards(id, "white", black.pick, (cards) => {
              if (player !== czar){
                if (cards) {
                  SOCKETS.get(player).emit("dealWhite", cards)
                  return
                }
                io.to(id).emit("failure", {message: "Ran out of cards"})
              }
            }
          )}
        )
      })
    })
  })
}

const getDeck = async () => {
  try{
    const response = await axios(
      'https://raw.githubusercontent.com/crhallberg/json-against-humanity/master/full.md.json'
    )
    return {
      white: response.data.white,
      black: response.data.black
    }
  } catch (e) {
    console.error(e)
  }
}

getDeck()
.then((deck) => DECK = deck)