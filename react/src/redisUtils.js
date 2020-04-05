const redis = require("redis");
const client = redis.createClient();

`${room}:game`
`${room}:${player}`

const redisAddPlayer = (room, player, max, callback) =>
  client.rpush(`${id}:players`, player, (err, len) => {
    handleError(err)
    if (len > max) {
      client.rpop(`${id}:players`, (err, popped) => {
        if (popped == player) {
          callback(false)
          return
        }
      })
    }
    client.hset(`${room}:${player}`, 'ready', 0)
    callback(true)
  })

const redisGetPlayers = (room, callback) =>
  client.heget(`${room}:game`, 'players', (err, players) => {
    handleError(err)
    callback(players)
  })

const redisSetPlayersReady = (room, player, callback) =>
  client.hset(`${room}:${player}`, 'ready', 1, (err, result) => {
    handleError(err)
    callback()
  })

const redisCheckAllPlayersReady = (room, callback) =>
  redisGetPlayers(room, (players) => {
    var nReady = 0
    players.forEach(player => {
      client.hget(`${room}:${player}`, 'ready', (ready) => {
        if (ready == '1') nReady++
      })
    })
    callback(nReady == players.length)
  })