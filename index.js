// https://raw.githubusercontent.com/crhallberg/json-against-humanity/master/full.md.json
const _ = require('lodash');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const axios = require('axios');

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
});

io.on('connection', (socket) => {
  socket.on('winnerSelected', (card) => {
    io.emit("playerWonRound", [selectedCards.get(card)])
  });
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

const getDeck = async () => {
  try{
    const response = await axios(
      'https://raw.githubusercontent.com/crhallberg/json-against-humanity/master/full.md.json'
    )
    return {
      drawWhite: makeDealer(_.shuffle(response.data.white)),
      drawBlack: makeDealer(_.shuffle(response.data.black))
    }
  } catch (e) {
    console.error(e)
  }
}

const play = (deck, players, it) => {
  dealRound(players, it, deck.drawWhite, deck.drawBlack)
}

const dealRound = (players, it, drawWhite, drawBlack) => {
  it += 1
  it %= players.length
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
var it = -1
const players = [
  makePlayer("chris"),
  makePlayer("shea"),
  makePlayer("alex"),
  makePlayer("grayce"),
]

getDeck()
.then(deck => play(deck, players, it))
.catch(error => console.error(error))