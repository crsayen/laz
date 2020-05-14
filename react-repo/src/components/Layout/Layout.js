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

const name = Array(10)
    .fill(null)
    .map(() => Math.floor(Math.random() * 10).toString())
    .join('')

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


    useEffect(() => {
        let newCards = userCards.slice().concat(_userCard)
        setUserCards(newCards)
    }, [_userCard]) // eslint-disable-line

    const newGame = (id) => {
        console.log("new game:",id)
        socket.emit('newGame', id, name, success => {
            console.log("newGameCallback")
            success
                ? setgameID(id)
                : console.error("failed to create game") // TODO
            console.log("gameID", gameID)
        })
    }

    const joinGame = (id) => {
        socket.emit('joinGame', id, name, success => {
            if (success) {
                setgameID(id)
                setGameJoined(true)
            } else {
                console.error("failed to join game")
            }
        })
    }

    const pickUsername = (name) => {
        socket.emit('usernameSelected', name, success => success ? "it woerkd!" : "your name is taken")
    }

    const startGame = () => {
        socket.emit('startGame', gameID, console.log)
    }

    const selectCard = card => {
        socket.emit('chooseWhiteCard', card, console.log)
    }

    const playCard = (e, playedCard) => {
        e.preventDefault()
        // eslint-disable-next-line
        let newCards = myCards.slice().filter(card => card != playedCard)
        setMyCards(newCards)
        socket.emit('playWhiteCard', playedCard, name, console.log)
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
                pickUsername={pickUsername}
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
