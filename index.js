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
          io.emit('idTaken', [isPrivate])
        })
      } else {
        client.hmset(`${id}:game`, 'turn', 0, 'isPrivate', 0, () => {
          client.lpush(`players:${id}`, player, () => {
            io.emit('gameCreated', [id, player])
          })
        })
      }
    })

    socket.on('makePrivate', (id, password) => {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) console.error(err)
        client.hmset(`${id}:game`, 'password', hash, 'isPrivate', 1)
      })
    })
  });

  socket.on('joinPrivateGame', (id, password) => {
    client.hget(`${id}:game`, "password", (hash) => {
      bcrypt.compare(password, hash, (result) => {
        if (result) {
          // do stuff cause they knew the password
        } else {
          io.emit('incorrectPassword', [password])
        }
      })
    })
  })
});

io.on('connection')

io.on('connection', (socket) => {

});

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