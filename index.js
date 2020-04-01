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
          'turn', 0,
          'isPrivate', 0,
          'started', 0, (OK) => {
            client.mset(`${id}:blackCursor`, "0", `${id}:whiteCursor`, "0")
              client.rpush(`${id}:players`, player, () => {
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
                    
                    callback(addPlayer(id, player, started))
                    return
                  }
                  callback(false)
                })
              })
            } else {
              callback(addPlayer(id, player, !!parseInt(started)))
            }
          }
        )
      } else {
        callback(false)
      }
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

const addPlayer = (id, player, started) => {
  console.log("adding:", player)
  client.rpush(`${id}:players`, player, (len) => {
    if (len > MAX_PLAYERS) {
      client.rpop(`${id}:players`)
      console.log("too many players")
      return false
    } else {
      console.log("added", player)
      return true
    }
  })
}

http.listen(3000, () => {
  console.log('listening on *:3000');
});

const makePlayer = (id) => {
  return {
    id: id,
    deal: (hand) => {
      console.log(id, hand)
      io.emit("dealHand", [id, hand])
    }
  }
}

const makeDealer = (cards) => {
  const deal = (cards, n) => {
    if(!n) n = 1
    return [
      cards.slice(0, n),
      _.curry(deal)(cards.slice(n))
    ]
  }
  return _.curry(deal)(cards)
}

const playersFinished = () => {
  io.emit("playersFinished")
}

const drawCards = (id, color, n) => {
  var cards
  client.incrby(`${id}:${color}Cursor`, n, (cursor) => {
    if (cursor + n > DECK[color].length) {
      cards = false
      return
    }
    cards = DECK[color].slice(cursor - n, n)
  })
  return cards
}
