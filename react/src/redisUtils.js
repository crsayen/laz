const redis = require("redis");
const client = redis.createClient();

client.flushall();

client.on("error", e => console.error(e));

const redisAddPlayer = (room, player, max, callback) =>
  client.rpush(`${id}:players`, player, (err, len) => {
    if (len > max) {
      client.rpop(`${id}:players`, (err, popped) => {
        if (popped == player) {
          callback(false)
          return
        }
      })
    }
    redisSetPlayerReady(room, player, true)
    callback(true)
  })

const redisGetPlayers = (room, callback) =>
  client.heget(`${room}:game`, 'players', (err, players) =>
    callback(players)
  )

const redisSetPlayerReady = (room, player, ready, callback) =>
  client.hset(`${room}:${player}`, 'ready', ready ? 1 : 0, () =>
    callback ? callback() : null
  )

const redisCheckAllPlayersReady = (room, callback) =>
  redisGetPlayers(room, (players) => {
    var nReady = 0
    players.forEach(player =>
      client.hget(`${room}:${player}`, 'ready', (err, ready) =>
        ready == '1' ? nReady++ : null
      )
    )
    callback(nReady == players.length)
  })

const redisIncrementDeckCursor = (room, color, n, callback) =>
  client.hincrby(`${room}:game`, `${color}Cursor`, n, (err, cursor) =>
    callback(cursor)
  )

const redisSetPlayerCards = (room, player, cards, callback) =>
  client.hset(`${room}:${player}`, 'cards', JSON.stringify(cards), () =>
    callback ? callback(cards) : null
  )


const getPlayerCards = (room, player, callback) =>
  client.hget(`${room}:${player}`, 'cards', cardsString =>
    callback(JSON.parse(cardsString))
  )

