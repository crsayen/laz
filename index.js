// https://raw.githubusercontent.com/crhallberg/json-against-humanity/master/full.md.json
const _ = require('lodash');
const redis = require("redis");
const client = redis.createClient();
const bcrypt = require('bcrypt');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const deck = require('/deck.js')
const axios = require('axios');
// const { promisify } = require('util')
// const getAsync = promisify(client.get).bind(client)
// const hgetAsync = promisify(client.hget).bind(client)
// const hsetAsync = promisify(client.hset).bind(client)
// const hmgetAsync = promisify(client.hmget).bind(client)
// const hmsetAsync = promisify(client.hmset).bind(client)
// const llenAsync = promisify(client.llen).bind(client)
// const rpushAsync = promisify(client.rpush).bind(client)
// const rpopAsync = promisify(client.rpop).bind(client)
// const existsAsync = promisify(client.exists).bind(client)

const MAX_PLAYERS = 10

client.on("error", e => console.log(e))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('cardPlayed', (id, card) => {
    selectedCards.set(card, id)
    if(selectedCards.size == players.size - 1) { // TODO: account for multicard rounds
      playersFinished()
    }
  });

  socket.on('winnerSelected', (card) => {
    io.emit("playerWonRound", [selectedCards.get(card)])
  });

  socket.on('newGame', (id, player) => {
    client.exists(`${id}:game`, (exists) => {
      if(exists) {
        client.hget(`${id}:game`, "isPrivate", (isPrivate) => {
          client.llen(`${id}:players`, (numberOfPlayers) => {
            io.emit('gameExists', [isPrivate, (numberOfPlayers >= MAX_PLAYERS)])
          })
        })
      } else {
        client.hmset(`${id}:game`, 'turn', 0, 'isPrivate', 0, 'open', 0, () => {
          client.rpush(`${id}:players`, player, () => {
            io.emit('gameCreated', [id])
          })
        })
      }
    })

    socket.on('makePrivate', (id, password) => {
      client.exists(`${id}:game`, (exists) => {
        if (!exists) {
          io.emit("error", [id, "Game does not exist"])
        } else {
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) console.error(err)
            client.hmset(`${id}:game`, 'password', hash, 'isPrivate', 1)
          })
        }
      })
    })
  });

  socket.on('joinGame', (id, player, password=false) => {
    var OK = false
    client.hmget(`${id}:game`, "isPrivate", "open", "started", "password", (isPrivate, open, started,  hash) => {
      if (!isPrivate) {
        OK = true
      } else {
        if (password) {
          bcrypt.compare(password, hash, (result) => {
            if (result) {
              addPlayer(id, player, started)
            } else {
              io.emit('wrongPassword', [id])
            }
          })
        } else {
          io.emit("error", [id, "Game requires a password"])
        }
      }
      if (!open) {
        io.emit("error" [id, "Game isn't open yet"])
      } else if (OK) {
        addPlayer(id, player, started)
      } else {
        io.emit("error", [id, "Failed to join game"])
      }
    })
  })
})

const addPlayer = (id, player, started) => {
  client.rpush(`${id}:players`, player, (len) => {
    if (len > MAX_PLAYERS) {
      client.rpop(`${id}:players`)
      io.emit("error", [id, "Game is full"])
    } else {

    }
  })
}

createGame(id)

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

const startGame = (gameID) => {
  dealRound(
    players,
    it,
    makeDealer(_.shuffle(deck.white)),
    makeDealer(_.shuffle(deck.black))
  )
}




const dealRound = (players, it, drawWhite, drawBlack) => {
  let hand, black
  [black, drawBlack] = drawBlack(1)
  io.emit("dealBlackCard", [black])
  players.forEach((p, i, _a) => {
    if (it == i) {
      console.log(`${p.id}'s turn:`, black)
      io.emit("playersTurn", [p.id])
    } else {
      [hand, drawWhite] = drawWhite(7)
      p.deal(hand)
    }
  });
  return [drawWhite, drawBlack]
}

const selectedCards = new Map()
var it = 0
const players = [
  makePlayer("chris"),
  makePlayer("shea"),
  makePlayer("alex"),
  makePlayer("grayce"),
]

getDeck()
.then(deck => play(deck, players, it))
.catch(error => console.error(error))