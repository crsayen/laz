import '@babel/polyfill'
import cors from 'cors'
import bodyParser from 'body-parser'
import user from './routes/user'
import deck from '../deck.js'
import SocketioEventEmitter from './SocketioEventEmitter'
import {
  makeAddPlayer,
  makePlayerReady,
  makeNextCzar,
  makeDrawCards,
  makeDealWhiteCards,
  makeDealBlackCard,
  makeNextRound
} from './factories'

const port = 8080
const app = require('express')()

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)

const corsOptions = {
  origin: 'localhost:3000'
}

const MAXPLAYERS = 10

const socketioEventEmitter = new SocketioEventEmitter(io)

const addPlayer = makeAddPlayer(
  socketioEventEmitter,
  redisAddPlayer,
  MAXPLAYERS
)
const nextCzar = makeNextCzar(redisGetNextCzar)
const nextRound = makeNextRound(
  redisdbGetPlayers,
  nextCzar,
  eventEmitter,
  dealWhiteCards,
  dealBlackCard,
  redisSetPlayerReady
)
const playerReady = makePlayerReady(
  redisSetPlayerReady,
  redisCheckAllPlayersReady,
  nextRound
)
const drawCards = makeDrawCards(deck, redisIncrementDeckCursor)
const dealWhiteCards = makeDealWhiteCards(
  redisSetPlayerCards,
  redisGetPlayerCards,
  socketioEventEmitter
)
const dealBlackCard = makeDealBlackCard(
  redisSetPlayerCards,
  redisGetPlayerCards,
  socketioEventEmitter
)

app.use(cors(corsOptions))
app.use('/api/user', user)
const server = require('http').createServer(app)
const io = require('socket.io')(server)
server.listen(port, '0.0.0.0', () =>
  console.log(`listening on *:${port}`)
)

io.on('connection', socket => {
  // (room, player, callback)
  socket.on('newGame', createNewGame)
  // (room, password, callback)
  socket.on('makePrivate', setGameToPrivate)
  // (room, player, callback)
  socket.on('joinGame', addPlayer)
  // (room, callback)
  socket.on('startGame', startGame)
  // (room, player, card)
  socket.on('playWhiteCard', playWhiteCard)
  // (room, player)
  socket.on('playerReady', playerReady)
  // (room, card)
  socket.on('chooseWhiteCard', winningCardChosen)
})
