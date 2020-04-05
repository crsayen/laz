const makeAddPlayer = (eventEmitter, dbAddPlayer, max) => (room, player, socket, callback) =>
  dbAddPlayer(room, player, max, (result) => {
    callback(result)
    if (result.success) {
      eventEmitter.addEndpoint(socket, player)
      eventEmitter.emit(room, "playerAdded", player)
    }
  })

const makePlayerReady = (dbSetPlayerReady, dbCheckAllPlayersReady, nextRound) => (room, player) =>
  dbSetPlayerReady(room, player, () => {
    dbCheckAllPlayersReady(room, (allPlayersReady) => {
      if (allPlayersReady) {
        nextRound(room)
      }
    })
  })

const makeNextCzar = (dbGetNextCzar) => (room, callback) =>
  dbGetNextCzar(room, callback)

const makeDrawCards = (deck, dbIncrementDeckCursor) => (room, color, n, callback) =>
  dbIncrementDeckCursor(room, color, (cursor) => {
    if (!cursor) return false
    callback(deck[color].slice(cursor - n, cursor))
  })

const makeDealWhiteCards = (dbSetPlayerCards, dbGetPlayerCards, eventEmitter) => (room, player) =>
  dbGetPlayerCards(room, player, (cards) => {
    drawCards(room, "white", 7 - cards.length, (newCardsData) => {
      let cardsDealt = [...cards, ...newCardsData.map((data) => data.text)]
      dbSetPlayerCards(room, player, cardsDealt)
      eventEmitter.emit(player, "dealWhite", cardsDealt)
    })
  })

const makeDealBlackCard = (eventEmitter, dbSetPick) => (room) =>
  drawCards(room, "black", 1, (cardsData) => {
    const [cardData] = cardsData
    dbSetPick(cardData.pick)
    eventEmitter(room, 'dealBlack', cardData.text)
  })

const makeNextRound = (dbGetPlayers, nextCzar, eventEmitter, dealWhiteCards, dealBlackCard) => (room) =>
  dbGetPlayers(room, (players) =>
    nextCzar(room, (czar) => {
      eventEmitter(room, 'newCzar', czar)
      dealBlackCard(room)
      players.forEach(player => {
        eventEmitter(player, "myTurn", (player == czar))
        dealWhiteCards(room, player)
      })
    })
  )

module.exports = {
  makeAddPlayer,
  makePlayerReady,
  makeNextCzar,
  makeDrawCards,
  makeDealWhiteCards,
  makeDealBlackCard,
  makeNextRound
}