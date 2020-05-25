"use strict";

require("@babel/polyfill");

var _cors = _interopRequireDefault(require("cors"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _user = _interopRequireDefault(require("./routes/user"));

var _deck = _interopRequireDefault(require("../deck.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _ = require("lodash");

var asyncRedis = require("async-redis");

var redisHost = process.env.REDISHOST || process.env.TEST ? "10.128.0.9" : "127.0.0.1";
var client = asyncRedis.createClient(6379, redisHost);

var express = require('express');

var app = express();
var port = process.env.PORT || process.env.TEST ? 80 : 8090;

require('dotenv').config();

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', req.header('origin') || req.header('x-forwarded-host') || req.header('referer') || req.header('host'));
  next();
});
app.use(_bodyParser["default"].json());
app.use(_bodyParser["default"].urlencoded({
  extended: true
}));
var DECK = {
  black: _.shuffle(_deck["default"].black),
  white: _.shuffle(_deck["default"].white)
};
app.use((0, _cors["default"])()); //app.use("/api/user", user);

console.log(process.env.NODE_ENV);
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

var server = require("http").createServer(app);

var io = require("socket.io")(server); //if (process.env.NODE_ENV == "development") { io.set('origins', 'http://localhost:3000'); };


server.listen(port, "0.0.0.0", function () {
  console.log("listening on *:".concat(port));
});
server.use(express["static"]('../react-repo/build'));
var MAX_PLAYERS = 10; // TODO: put in redis

client.flushall();
client.on("error", function (e) {
  return console.error(e);
});
var SOCKETS = new Map(); // TODO: put in redis
// TODO: temporary shuffle solution: shuffle daily, keep a [startIndex, incr] for each game
// TODO: make it so that you can press enter to 'create' in new-game popup
// TODO: when someone joins, do a popup that introduces the player to everyone
// TODO: PARTIAL FIX - old game continues to display after player joins a new game
// TODO: after changing game rooms, player is czar twice before it switches czars
// TODO: number of players not changing in games list
// TODO: unstable flush: https://lazaretto.slack.com/archives/D010RBXBL75/p1589509841001400

/*********************************************************************************
 * ** REDIS SCHEMA **
 * //TODO: this schema likely requires some re-working. It isn't ideal. It was improvised without forthought
 * <room>:game             hash
 *   blackCursor           int       keeps track of which black card the game is on
 *   whiteCursor           int       keeps track of which white card the game is on
 *   numberOfCardsPlayed   int       self explanatory
 *   numberOfPlayersReady  int       self explanatory //TODO: rather than keeping a counter, give <game>:<player> a 'ready' field and count them
 *   pick                  int       how many white cards each player must submit
 *   started               bool      whether the game has started or not //TODO: actually utilize this. we dont touch it.
 *   owner                 string    the name of the player who started the game
 *
 * <room>:players          list      a list of the names of the players in the game
 *
 * <room>:<player>         hash
 *   cards                 list      a list of the players cards, JSON.stringified
 *   playedCards           list      a list of the cards the player has submitted, JSON.stringified
 */

io.on("connection", function (socket) {
  socket.on("newGame", /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(room, player, callback) {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              console.log("new game ".concat(room, ", started by ").concat(player));
              _context2.next = 3;
              return client.exists("".concat(room, ":game"));

            case 3:
              if (!_context2.sent) {
                _context2.next = 7;
                break;
              }

              callback({
                success: false,
                reason: "game exists"
              });
              _context2.next = 10;
              break;

            case 7:
              _context2.next = 9;
              return client.hmset("".concat(room, ":game"), "blackCursor", 0, "whiteCursor", 0, "numberOfcardsPlayed", 0, "numberOfPlayersReady", 0, "pick", 7, "started", 0, "owner", player);

            case 9:
              addPlayer(room, player, false, socket, /*#__PURE__*/function () {
                var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(data) {
                  return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          if (!data.success) {
                            _context.next = 5;
                            break;
                          }

                          client.rpush('openGames', room);
                          console.log("new game:", room);
                          callback(data);
                          return _context.abrupt("return");

                        case 5:
                          callback(data);

                        case 6:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee);
                }));

                return function (_x4) {
                  return _ref2.apply(this, arguments);
                };
              }());

            case 10:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }());
  socket.on("getOpenGames", getOpenGames);
  socket.on("test", console.log);
  socket.on("joinGame", /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(room, player, callback) {
      var players, started;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              console.log("".concat(player, " is trying to join ").concat(room));
              _context3.next = 3;
              return client.exists("".concat(room, ":game"));

            case 3:
              if (!_context3.sent) {
                _context3.next = 14;
                break;
              }

              _context3.next = 6;
              return getPlayers(room);

            case 6:
              players = _context3.sent;

              if (players.includes(player)) {
                callback({
                  success: false,
                  reason: "player name taken"
                });
              }

              _context3.next = 10;
              return client.hget("".concat(room, ":game"), 'started');

            case 10:
              started = _context3.sent;
              addPlayer(room, player, !!parseInt(started), socket, callback);
              _context3.next = 15;
              break;

            case 14:
              callback({
                success: false,
                reason: "game does not exist"
              });

            case 15:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function (_x5, _x6, _x7) {
      return _ref3.apply(this, arguments);
    };
  }());
  socket.on("startGame", /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(room, callback) {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              console.log("starting ".concat(room));
              _context4.next = 3;
              return client.hset("".concat(room, ":game"), 'started', true);

            case 3:
              nextRound(room);
              callback(true);
              io.to(room).emit('gameStarted', true);

            case 6:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    return function (_x8, _x9) {
      return _ref4.apply(this, arguments);
    };
  }());
  socket.on("chooseWinner", function (card) {
    console.log("winner: ".concat(card));
    io.to(socket.rooms[0]).emit("winnerSelected", card);
    nextRound(socket.rooms[0]);
  });
  socket.on("playWhiteCard", /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(card, player, callback) {
      var room, cards, numberOfCardsPlayed, pick, playedCardsString, playedCardsJson, playedCards, numPlayers;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              console.log("".concat(player, " chose \"").concat(card.text, "\""));
              room = Object.keys(socket.rooms)[1];
              _context5.next = 4;
              return getPlayerCards(room, player);

            case 4:
              cards = _context5.sent;
              console.log("preFiltrer", cards);
              setPlayerCards(room, player, cards.filter(function (c) {
                return c.text != card.text;
              }));
              _context5.next = 9;
              return client.hincrby("".concat(room, ":game"), "numberOfCardsPlayed", 1);

            case 9:
              numberOfCardsPlayed = _context5.sent;
              _context5.next = 12;
              return client.hget("".concat(room, ":game"), "pick");

            case 12:
              pick = _context5.sent;
              _context5.next = 15;
              return client.hget("".concat(room, ":").concat(player), "playedCards");

            case 15:
              playedCardsString = _context5.sent;
              playedCardsJson = JSON.parse(playedCardsString);
              playedCards = playedCardsJson.length ? playedCardsJson.map(function (string) {
                return JSON.parse(string);
              }).push(card) : [card];

              if (pick == playedCards.length) {
                io.to(room).emit("whiteCardPlayed", playedCards.map(function (_card) {
                  return {
                    card: _card,
                    user: player
                  };
                }));
                client.hset("".concat(room, ":").concat(player), "playedCards", "[]");
              } else {
                client.hset("".concat(room, ":").concat(player), "playedCards", JSON.stringify([playedCards]));
              }

              _context5.next = 21;
              return client.llen("".concat(room, ":players"));

            case 21:
              numPlayers = _context5.sent;

              if (numberOfCardsPlayed == (numPlayers - 1) * parseInt(pick)) {
                io.to(room).emit("allCardsPlayed");
                client.hset("".concat(room, ":game"), "numberOfCardsPlayed", 0);
              }

              callback(true);

            case 24:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));

    return function (_x10, _x11, _x12) {
      return _ref5.apply(this, arguments);
    };
  }());
  socket.on("ready", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
    var room, numberOfPlayersReady, numPlayers;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            room = Object.keys(socket.rooms)[1];
            _context6.next = 3;
            return client.hincrby("".concat(room, ":game"), "numberOfPlayersReady", 1);

          case 3:
            numberOfPlayersReady = _context6.sent;
            _context6.next = 6;
            return client.llen("".concat(room, ":players"));

          case 6:
            numPlayers = _context6.sent;

            if (numberOfPlayersReady == numPlayers) {
              nextRound(room);
              client.hset("".concat(room, ":game"), "numberOfPlayersReady", 0);
            }

          case 8:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  })));
  socket.on("chooseWhiteCard", /*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(data) {
      var room, numberOfChosenCards, pick, chosenCardsStrings, chosenCards;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              room = Object.keys(socket.rooms)[1];
              _context7.next = 3;
              return client.lpush("".concat(room, ":winningCards"), JSON.stringify(data.card));

            case 3:
              numberOfChosenCards = _context7.sent;
              _context7.next = 6;
              return client.hget("".concat(room, ":game"), "pick");

            case 6:
              pick = _context7.sent;

              if (!(numberOfChosenCards == parseInt(pick))) {
                _context7.next = 14;
                break;
              }

              _context7.next = 10;
              return client.lrange("".concat(room, ":winningCards"), 0, -1);

            case 10:
              chosenCardsStrings = _context7.sent;
              chosenCards = chosenCardsStrings.map(function (s) {
                return JSON.parse(s);
              });
              io.to(room).emit("winnerSelected", data.user, chosenCards);
              client.del("".concat(room, ":winningCards"));

            case 14:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }));

    return function (_x13) {
      return _ref7.apply(this, arguments);
    };
  }());
  socket.on("disconnect", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
    var _yield$client$hmget, _yield$client$hmget2, name, room, players;

    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return client.hmget("".concat(socket.id), 'name', 'room');

          case 2:
            _yield$client$hmget = _context8.sent;
            _yield$client$hmget2 = _slicedToArray(_yield$client$hmget, 2);
            name = _yield$client$hmget2[0];
            room = _yield$client$hmget2[1];
            _context8.next = 8;
            return client.llen("".concat(room, ":players"));

          case 8:
            if (!_context8.sent) {
              _context8.next = 11;
              break;
            }

            client.lrem("".concat(room, ":players"), 1, name);
            console.log("removing player:", name);

          case 11:
            _context8.next = 13;
            return client.del("".concat(room, ":").concat(name));

          case 13:
            SOCKETS["delete"](name);
            _context8.next = 16;
            return client.lrange("".concat(room, ":players"), 0, -1);

          case 16:
            players = _context8.sent;

            // If any players remain, update the room with the new list
            if (players.length) {
              // Array.from(new Set(...)) is used to remove duplicates
              io.to(room).emit("updatePlayers", Array.from(new Set(players.map(function (p) {
                return {
                  name: p,
                  score: "TODO"
                };
              }))));
            } else {
              client.lrem("openGames", 1, room);
              client.del("".concat(room, ":game"));
              client.del("".concat(room, ":players"));
            }

          case 18:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  })));
});

var getPlayers = /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(room) {
    var players;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return client.lrange("".concat(room, ":players"), 0, -1);

          case 2:
            players = _context9.sent;
            console.log("players", players);
            return _context9.abrupt("return", players);

          case 5:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function getPlayers(_x14) {
    return _ref9.apply(this, arguments);
  };
}();

var getOpenGames = /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(callback) {
    var GAMES, compileGames, games;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            GAMES = [];

            compileGames = function compileGames(game, numPlayers, numGames, owner, callback) {
              GAMES.push({
                name: game,
                players: numPlayers,
                leader: 'TODO',
                owner: owner
              });

              if (GAMES.length == numGames) {
                callback(GAMES);
              }
            };

            _context11.next = 4;
            return client.lrange("openGames", 0, -1);

          case 4:
            games = _context11.sent;
            games.forEach( /*#__PURE__*/function () {
              var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(game) {
                var owner, players;
                return regeneratorRuntime.wrap(function _callee10$(_context10) {
                  while (1) {
                    switch (_context10.prev = _context10.next) {
                      case 0:
                        _context10.next = 2;
                        return client.hget("".concat(game, ":game"), "owner");

                      case 2:
                        owner = _context10.sent;
                        _context10.next = 5;
                        return client.lrange("".concat(game, ":players"), 0, -1);

                      case 5:
                        players = _context10.sent;
                        compileGames(game, players.length, games.length, owner, callback);

                      case 7:
                      case "end":
                        return _context10.stop();
                    }
                  }
                }, _callee10);
              }));

              return function (_x16) {
                return _ref11.apply(this, arguments);
              };
            }());

          case 6:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));

  return function getOpenGames(_x15) {
    return _ref10.apply(this, arguments);
  };
}();

var addPlayer = /*#__PURE__*/function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(room, player, started, socket, callback) {
    var len, owner;
    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            console.log("adding ".concat(player, " to ").concat(room));
            _context13.next = 3;
            return client.llen("".concat(room, ":players"));

          case 3:
            len = _context13.sent;
            _context13.next = 6;
            return client.hget("".concat(room, ":game"), 'owner');

          case 6:
            owner = _context13.sent;

            if (len > MAX_PLAYERS) {
              client.rpop("".concat(room, ":players"));
              callback({
                success: false,
                reason: "game full"
              });
            } else {
              client.rpush("".concat(room, ":players"), player);
              client.hmset("".concat(room, ":").concat(player), "playedCards", "[]", "cards", "[]");
              client.hmset("".concat(socket.id), 'name', player, 'room', room);
              SOCKETS.set(player, socket);
              console.log('started', started);
              socket.emit('gameStarted', started);
              socket.join(room, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
                var players;
                return regeneratorRuntime.wrap(function _callee12$(_context12) {
                  while (1) {
                    switch (_context12.prev = _context12.next) {
                      case 0:
                        dealWhiteCards(room, player);
                        _context12.next = 3;
                        return client.lrange("".concat(room, ":players"), 0, -1);

                      case 3:
                        players = _context12.sent;
                        io.to(room).emit("updatePlayers", Array.from(new Set(players.map(function (p) {
                          return {
                            name: p,
                            score: "TODO"
                          };
                        }))));
                        io.to(room).emit("playerJoined", player);

                      case 6:
                      case "end":
                        return _context12.stop();
                    }
                  }
                }, _callee12);
              })));
              callback({
                success: true,
                id: room,
                owner: owner,
                started: started
              });
            }

          case 8:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13);
  }));

  return function addPlayer(_x17, _x18, _x19, _x20, _x21) {
    return _ref12.apply(this, arguments);
  };
}();

var nextCzar = /*#__PURE__*/function () {
  var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(room) {
    var czar;
    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            _context14.next = 2;
            return client.lpop("".concat(room, ":players"));

          case 2:
            czar = _context14.sent;
            client.rpush("".concat(room, ":players"), czar);
            console.log("next czar", czar);
            return _context14.abrupt("return", czar);

          case 6:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14);
  }));

  return function nextCzar(_x22) {
    return _ref14.apply(this, arguments);
  };
}();

var _drawCards = /*#__PURE__*/function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(room, color, n) {
    var cursor;
    return regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            _context15.next = 2;
            return client.hincrby("".concat(room, ":game"), "".concat(color, "Cursor"), n);

          case 2:
            cursor = _context15.sent;
            return _context15.abrupt("return", DECK[color].slice(cursor - n + 1, cursor + 1));

          case 4:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15);
  }));

  return function _drawCards(_x23, _x24, _x25) {
    return _ref15.apply(this, arguments);
  };
}();

var drawCards = /*#__PURE__*/function () {
  var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(filterfn, room, color, n) {
    var f;
    return regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            f = /*#__PURE__*/function () {
              var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(newN, oldCards) {
                var newCards, filtered;
                return regeneratorRuntime.wrap(function _callee16$(_context16) {
                  while (1) {
                    switch (_context16.prev = _context16.next) {
                      case 0:
                        _context16.next = 2;
                        return _drawCards(room, color, newN);

                      case 2:
                        newCards = _context16.sent;
                        filtered = oldCards.concat(newCards.filter(filterfn));

                        if (!(filtered.length < newN)) {
                          _context16.next = 6;
                          break;
                        }

                        return _context16.abrupt("return", f(newN - filtered.length, filtered));

                      case 6:
                        return _context16.abrupt("return", filtered);

                      case 7:
                      case "end":
                        return _context16.stop();
                    }
                  }
                }, _callee16);
              }));

              return function f(_x30, _x31) {
                return _ref17.apply(this, arguments);
              };
            }();

            return _context17.abrupt("return", f(n, []));

          case 2:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17);
  }));

  return function drawCards(_x26, _x27, _x28, _x29) {
    return _ref16.apply(this, arguments);
  };
}();

var wfilter = function wfilter(card) {
  return !card.text.includes('*');
};

var bfilter = function bfilter(card) {
  return card.pick < 2;
};

var setPlayerCards = function setPlayerCards(room, player, cards) {
  client.hset("".concat(room, ":").concat(player), "cards", JSON.stringify(cards));
};

var getPlayerCards = /*#__PURE__*/function () {
  var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(room, player) {
    var r;
    return regeneratorRuntime.wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            _context18.next = 2;
            return client.hget("".concat(room, ":").concat(player), "cards");

          case 2:
            r = _context18.sent;
            return _context18.abrupt("return", JSON.parse(r));

          case 4:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee18);
  }));

  return function getPlayerCards(_x32, _x33) {
    return _ref18.apply(this, arguments);
  };
}();

var dealWhiteCards = /*#__PURE__*/function () {
  var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(room, player, callback) {
    var cards, newCards, cardsDealt;
    return regeneratorRuntime.wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            console.log("dealing white cards to ".concat(player, " in ").concat(room));
            _context19.next = 3;
            return getPlayerCards(room, player);

          case 3:
            cards = _context19.sent;
            console.log("".concat(player, " has ").concat(cards.length, " cards"));
            _context19.next = 7;
            return drawCards(wfilter, room, "white", 7 - cards.length);

          case 7:
            newCards = _context19.sent;
            console.log("".concat(player, " will get ").concat(newCards.length, " new cards"));
            cardsDealt = [].concat(_toConsumableArray(cards), _toConsumableArray(newCards));
            setPlayerCards(room, player, cardsDealt);
            SOCKETS.get(player).emit("dealWhite", cardsDealt);
            callback ? callback(cards) : null;

          case 13:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee19);
  }));

  return function dealWhiteCards(_x34, _x35, _x36) {
    return _ref19.apply(this, arguments);
  };
}();

var dealBlackCard = /*#__PURE__*/function () {
  var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(room, callback) {
    var _black, black;

    return regeneratorRuntime.wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            console.log("dealing black card to ".concat(room));
            _context20.next = 3;
            return drawCards(bfilter, room, "black", 1);

          case 3:
            _black = _context20.sent;
            black = _black[0];
            client.hset("".concat(room, ":game"), 'pick', black.pick);
            io.to(room).emit('dealBlack', black);
            callback ? callback(black) : null;

          case 8:
          case "end":
            return _context20.stop();
        }
      }
    }, _callee20);
  }));

  return function dealBlackCard(_x37, _x38) {
    return _ref20.apply(this, arguments);
  };
}();

var nextRound = /*#__PURE__*/function () {
  var _ref21 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(room) {
    var players, czar;
    return regeneratorRuntime.wrap(function _callee21$(_context21) {
      while (1) {
        switch (_context21.prev = _context21.next) {
          case 0:
            _context21.next = 2;
            return client.lrange("".concat(room, ":players"), 0, -1);

          case 2:
            players = _context21.sent;
            _context21.next = 5;
            return nextCzar(room);

          case 5:
            czar = _context21.sent;
            io.to(room).emit('newCzar', czar);
            dealBlackCard(room);
            players.forEach(function (player) {
              SOCKETS.get(player).emit("myTurn", player == czar);
              dealWhiteCards(room, player);
            });

          case 9:
          case "end":
            return _context21.stop();
        }
      }
    }, _callee21);
  }));

  return function nextRound(_x39) {
    return _ref21.apply(this, arguments);
  };
}();