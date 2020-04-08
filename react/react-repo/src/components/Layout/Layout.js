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


const name = Array(10)
    .fill(null)
    .map(() => Math.floor(Math.random() * 10).toString())
    .join('')

const socket = io.connect('localhost:8080');

function Layout(props) {
    const classes = useStyles()
    var layoutState = useLayoutState()

/********************************************************************** */
//    GAME STUFF
/********************************************************************** */

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
        socket.emit('joinGame', id, name, success =>
            success
                ? setgameID(id)
                : console.error("failed to join game") // TODO
        )
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

    useEffect(() => {
        socket.on('connect', () => socket.emit("getOpenGames", (games) => {
            setOpenGames(games)
        }));
        socket.on('dealWhite', doSetMyCards)
        socket.on('dealBlack', setBlackCard)
        socket.on('newCzar', setCzar)
        socket.on('myTurn', setMyTurn)
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
                joinGame={joinGame}
                openGames={openGames}
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
                                startGame={startGame}
                                selectCard={selectCard}
                                playCard={playCard}
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
