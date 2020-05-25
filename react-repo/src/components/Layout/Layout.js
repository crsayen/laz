import React, { useState, useEffect } from 'react'
import { Route, withRouter } from 'react-router-dom'
import classnames from 'classnames'
import useStyles from './styles'
import Header from '../Header'
import Sidebar from '../Sidebar'
import Dashboard from '../../pages/dashboard'
import { useLayoutState } from '../../context/LayoutContext'
import { SocketProvider } from 'socket.io-react';
import io from 'socket.io-client';


// TODO: black card not showing up for player joining in middle of a game
// user should not be able to participate in ongoing round

// TODO: after a player has played 'pick' number of cards, hide 'play card' button

// this is for debugging. use it if you want to
const logFunctionCall = (func, args) => {
    var STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var params = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if(params === null)
        params = [];
    let padding = Array(args.length - params.length).fill(null)
    params = [...params, ...padding]
    var output = {}
    for (let i = 0; i < args.length; i++) {
        output[params[i]] = args[i]
    }
    console.log(func.name, output)
}

const socket = io.connect('localhost:8090');

function Layout(props) {
    const classes = useStyles()
    var layoutState = useLayoutState()

/********************************************************************** */
//    GAME STUFF
/********************************************************************** */

    const [username, setUsername] = useState('')
    const [winnerName, setWinnerName] = useState('')
    const [allCardsPlayed, setAllCardsPlayed] = useState(false)
    const [winnerCards, setWinnerCards] = useState([{ text: '' }])
    const [gameID, setgameID] = useState('test1')
    const [myCards, setMyCards] = useState([])
    const [blackCard, setBlackCard] = useState(false)
    const [_userCard, _setUserCard] = useState([])
    const [userCards, setUserCards] = useState([])
    const [userCardPlayed, setUserCardPlayed] = useState(false)
    const [czar, setCzar] = useState('Waiting')
    const [myTurn, setMyTurn] = useState(false)
    const [openGames, setOpenGames] = useState([])
    const [gameJoined, setGameJoined] = useState(false)
    const [players, setPlayers] = useState([])
    const [gameOwner, setGameOwner] = useState(null)
    const [gameStarted, setGameStarted] = useState(false)
    const [myNumPlayedCards, setMyNumPlayedCards] = useState(0)

    useEffect(() => {
        let newCards = userCards.slice().concat(_userCard)
        setUserCards(newCards)
    }, [_userCard]) // eslint-disable-line

    const newGame = (gameName, userName) => {
        setUsername(userName.slice())
        console.log("username", username)
        logFunctionCall(newGame, [gameName, userName])
        socket.emit('newGame', gameName, userName, gameInfo => {
            console.log("gameInfo", gameInfo)
            if (gameInfo.success) {
                setgameID(gameInfo.id)
                setGameOwner(gameInfo.owner)
            } else {
                console.error(gameInfo.reason) // TODO: handle new game failure
            }
            console.log("gameID", gameID)
        })
    }

    const joinGame = (gameName, userName) => {
        logFunctionCall(joinGame, [gameName, userName])
        socket.emit('joinGame', gameName, userName, gameInfo => {
            if (gameInfo.success) {
                setUsername(userName.slice())
                setgameID(gameInfo.id)
                setGameOwner(gameInfo.owner)
                setGameJoined(true)
            } else {
                console.error(gameInfo.reason)
                if (gameInfo.reason == "game does not exist") {
                    // TODO: let the player know somehow
                } else if (gameInfo.reason == "player name taken") {
                    // TODO: let the player know somehow
                }
            }
        })
    }

    const startGame = () => {
        socket.emit('startGame', gameID, console.log)
    }

    const selectCard = card => {
        socket.emit('chooseWhiteCard', card)
    }

    const playCard = (e, playedCard) => {
        logFunctionCall(playCard, [e, playedCard])
        setMyNumPlayedCards(myNumPlayedCards + 1)
        e.preventDefault()
        // eslint-disable-next-line
        let newCards = myCards.slice().filter(card => card != playedCard)
        setMyCards(newCards)
        console.log("username", username)
        socket.emit('playWhiteCard', playedCard, username, console.log)
    }

    const doSetMyCards = cards => {
        console.log('myCards', myCards)
        console.log('newcards', cards)
        let newCards = cards
        setMyCards(newCards)
    }

    const fetchGames = () => socket.emit('getOpenGames', games => {
        console.log("fetching games")
        setOpenGames(games)
    })

    const updatePlayers = (players) => {
        console.log("update players:", players)
        setPlayers(players)
    }

    useEffect(() => {
        socket.on('connect', fetchGames);
        socket.on('dealWhite', doSetMyCards)
        socket.on('dealBlack', setBlackCard)
        socket.on('gameStarted', setGameStarted)
        socket.on('newCzar', setCzar)
        socket.on('myTurn', setMyTurn)
        socket.on('updatePlayers', updatePlayers)
        socket.on('startgame', console.log)
        socket.on('allCardsPlayed', () => {
            console.log('all cards played')
            setAllCardsPlayed(true)
        })
        socket.on('winnerSelected', (user, cards) => {
            setAllCardsPlayed(false)
            setMyNumPlayedCards(0)
            setWinnerName(user)
            setUserCards([])
            setWinnerCards(cards)
        })
        socket.on('whiteCardPlayed', card => {
            setUserCardPlayed(true)
            _setUserCard(card)
        })
    }, []) // eslint-disable-line

/*********************************************************************** */

    return (
        <div className={classes.root}>
            <Header history={props.history} />
            <Sidebar
                newGame={newGame}
                joinGame={joinGame}
                openGames={openGames}
                fetchGames={fetchGames}
                players={players}
            />
            <div
                className={classnames(classes.content, {
                    [classes.contentShift]: layoutState.isSidebarOpened,
                })}
            >
                <div className={classes.fakeToolbar} />
                <SocketProvider
                  socket={socket}
                >
                    <Route path="/app/dashboard" render={
                        (props) =>
                            <Dashboard
                                gameOwner={gameOwner}
                                winnerName={winnerName}
                                allCardsPlayed={allCardsPlayed}
                                winnerCards={winnerCards}
                                gameID={gameID}
                                myCards={myCards}
                                blackCard={blackCard}
                                userCards={userCards}
                                userCardPlayed={userCardPlayed}
                                czar={czar}
                                myTurn={myTurn}
                                newGame={newGame}
                                joinGame={joinGame}
                                gameJoined={gameJoined}
                                startGame={startGame}
                                selectCard={selectCard}
                                playCard={playCard}
                                gameJoined={gameJoined}
                                setGameJoined={setGameJoined}
                                gameStarted={gameStarted}
                                myNumPlayedCards={myNumPlayedCards}
                                {...props}
                            />
                        }
                    />
                </SocketProvider>
            </div>
        </div>
    )
}

export default withRouter(Layout)
