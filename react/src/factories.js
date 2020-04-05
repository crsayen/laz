const makeAddPlayer = (eventEmitter, dbAddPlayer, max) => (
  room,
  player,
  socket,
  callback
) =>
  dbAddPlayer(room, player, max, result => {
    callback(result);
    if (result.success) {
      eventEmitter.addPlayerToRoom(socket, room, player);
      eventEmitter.toRoom(room, "playerAdded", player);
    }
  });

const makePlayerReady = (
  dbSetPlayerReady,
  dbCheckAllPlayersReady,
  nextRound
) => (room, player) =>
  dbSetPlayerReady(room, player, true, () => {
    dbCheckAllPlayersReady(room, allPlayersReady => {
      if (allPlayersReady) {
        nextRound(room);
      }
    });
  });

const makeNextCzar = dbGetNextCzar => (room, callback) =>
  dbGetNextCzar(room, callback);

const makeDrawCards = (deck, dbIncrementDeckCursor) => (
  room,
  color,
  n,
  callback
) =>
  dbIncrementDeckCursor(room, color, n, cursor => {
    if (cursor > deck[color].length) return false;
    callback(deck[color].slice(cursor - n, cursor));
  });

const makeDealWhiteCards = (
  dbSetPlayerCards,
  dbGetPlayerCards,
  eventEmitter
) => (room, player) =>
  dbGetPlayerCards(room, player, cards => {
    drawCards(room, "white", 7 - cards.length, newCardsData => {
      let cardsDealt = [...cards, ...newCardsData.map(data => data.text)];
      dbSetPlayerCards(room, player, cardsDealt);
      eventEmitter.toPlayer(player, "dealWhite", cardsDealt);
    });
  });

const makeDealBlackCard = (eventEmitter, dbSetPick) => room =>
  drawCards(room, "black", 1, cardsData => {
    const [cardData] = cardsData;
    dbSetPick(cardData.pick);
    eventEmitter.toRoom(room, "dealBlack", cardData.text);
  });

const makeNextRound = (
  dbGetPlayers,
  nextCzar,
  eventEmitter,
  dealWhiteCards,
  dealBlackCard,
  dbSetPlayerReady
) => room =>
  dbGetPlayers(room, players =>
    nextCzar(room, czar => {
      eventEmitter.toRoom(room, "newCzar", czar);
      dealBlackCard(room);
      players.forEach(player => {
        dbSetPlayerReady(room, player, false)
        eventEmitter.toPlayer(player, "myTurn", player == czar);
        dealWhiteCards(room, player);
      });
    })
  );

module.exports = {
  makeAddPlayer,
  makePlayerReady,
  makeNextCzar,
  makeDrawCards,
  makeDealWhiteCards,
  makeDealBlackCard,
  makeNextRound
};
