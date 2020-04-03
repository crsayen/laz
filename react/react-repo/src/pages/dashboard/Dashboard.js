// eslint-disable-next-line
import React, { useState, useEffect } from 'react'
// eslint-disable-next-line
import { Grid, Paper, Box } from '@material-ui/core'
// eslint-disable-next-line
import axios from 'axios'
import useStyles from './styles'
// eslint-disable-next-line
import Widget from '../../components/Widget'
import WinnerDialog from '../../components/WinnerDialog'
import Flickity from 'react-flickity-component'
import 'flickity/css/flickity.css'
import './sliders.css'
// eslint-disable-next-line
import {Chip,Typography,Button,Avatar,Badge} from '../../components/Wrappers'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Divider from '@material-ui/core/Divider'
import { socketConnect } from 'socket.io-react';
const R = require('ramda')

// const userCards = [
//     { user: 'ChrisS', cardcontent: "Waiting 'til marriage.", id: '1' },
//     { user: 'AlexC', cardcontent: 'Spectacular abs.', id: '2' },
//     { user: 'GrayceC', cardcontent: 'Mouth herpes.', id: '3' },
//     { user: 'SheaB', cardcontent: 'Getting drunk on mouthwash.', id: '4' },
//     { user: 'AustinH', cardcontent: 'A sad handjob', id: '5' },
//     { user: 'Dweezy', cardcontent: 'A cooler full of organs.', id: '6' },
// ]

// const myCards = [
//     { user: 'AlexC', cardcontent: 'Being a motherfucking sorcerer.', id: '1' },
//     { user: 'AlexC', cardcontent: 'A balanced breakfast.', id: '2' },
//     { user: 'AlexC', cardcontent: 'A zesty breakfast burrito.', id: '3' },
//     { user: 'AlexC', cardcontent: 'Winking at old people.', id: '4' },
//     { user: 'AlexC', cardcontent: 'Stephen Hawking talking dirty.', id: '5' },
//     {
//         user: 'AlexC',
//         cardcontent: 'Getting so angry that you pop a boner.',
//         id: '6',
//     },
//     {
//         user: 'AlexC',
//         cardcontent: 'An M. Night Shyamalan plot twist.',
//         id: '7',
//     },
// ]

const name = Array(10).fill(null).map(() => Math.floor(Math.random() * 10).toString()).join('')

function Dashboard(props) {
    var classes = useStyles()
    const [winnderDialogOpen, setWinnerDialogOpen] = useState(false)
    const [winnerName, setWinnerName] = useState('')
    const [allCardsPlayed, setAllCardsPlayed] = useState(false)
    const [winnerCards, setWinnerCards] = useState([{text:''}])
    const [gameID, setgameID] = useState("test1");
    const [myCards, setMyCards] = useState([])
    const [blackCard, setBlackCard] = useState(false)
    const [_userCard, _setUserCard] = useState([])
    const [userCards, setUserCards] = useState([])
    const [czar, setCzar] = useState('Waiting')
    const [userCardPlayed, setUserCardPlayed] = useState(false)
    const [myTurn, setMyTurn] = useState(false)
    const flickityOptions = {
        adaptiveHeight: true,
        initialIndex: 0,
        freeScroll: true,
        freeScrollFriction: 0.03,
        contain: true,
        //wrapAround: true,
        imagesLoaded: true,
        pageDots: false,
    }

    function sendMessage() {

    }

      const handleClick = () => {
        sendMessage()
    }

    const handleWinnerDialogClose = () => {
        setWinnerDialogOpen(false)
        props.socket.emit("ready", true)
    }

    useEffect(() => {
        props.socket.on("dealWhite", setMyCards)
        props.socket.on("dealBlack", setBlackCard)
        props.socket.on("newCzar", setCzar)
        props.socket.on("myTurn", setMyTurn)
        props.socket.on('startgame', console.log)
        props.socket.on('allCardsPlayed', () => setAllCardsPlayed(true))
        props.socket.on('winnerSelected', (user, cards) => {
            setAllCardsPlayed(false)
            setWinnerName(user)
            setUserCards([])
            setWinnerCards(cards)
        })
        props.socket.on("whiteCardPlayed", card => {
            setUserCardPlayed(true)
            _setUserCard(card)
        })
    },[])
    useEffect(() => {
        let newCards = userCards.slice().concat(_userCard)
        setUserCards(newCards)
    },[_userCard])
    useEffect(() => {
        setWinnerDialogOpen(!!winnerCards[0].text)
    }, [winnerCards])

    const newGame = () => props.socket.emit('newGame', gameID, name, console.log)
    const joinGame = () => props.socket.emit('joinGame', gameID, name, console.log)
    const startGame = () => props.socket.emit('startGame', gameID, console.log)
    const selectCard = (card) => props.socket.emit("chooseWhiteCard", card, console.log)
    const playCard = (e, playedCard) => {
        e.preventDefault();
        let newCards = myCards.filter(card => card != playedCard)
        setMyCards(newCards)
        props.socket.emit("playWhiteCard", playedCard, name, console.log)
    }

    return (
        <Grid container justify="center" alignItems="center" spacing={2}>
                <WinnerDialog
                    onClose={handleWinnerDialogClose}
                    userName={winnerName}
                    cards={winnerCards}
                    open={winnderDialogOpen}
                />
            <Grid item lg={12} sm={12} xs={12}>
                <Grid
                    container
                    justify="center"
                    alignItems="center"
                    spacing={2}
                >
                    <Grid item lg={3} sm={3} xs={12}>
                        <Grid
                            container
                            justify="center"
                            alignItems="center"
                            style={{ paddingBottom: 20 }}
                            spacing={2}
                        >
                            <Grid item xs={12}>
                            <Button style={{ margin: 10 }} color="primary" variant="contained" onClick={() => newGame()}>New Game</Button>
                            <Button style={{ margin: 10 }} color="primary" variant="contained" onClick={() => joinGame()}>Join Game</Button>
                            <Button style={{ margin: 10 }} color="primary" variant="contained" onClick={() => startGame()}>Start Game</Button>
                            <Button style={{ margin: 10 }} color="primary" variant="contained">butt two</Button>
                            <Button style={{ margin: 10 }} color="primary" variant="contained">butt three</Button>
                            {/* <form><input style="text" value={"enter name"} onChange={setName}/></form> */}
                            </Grid>
                            <Grid item xs={6}>
                                <Typography
                                    colorBrightness="hint"
                                    variant="caption"
                                    style={{ textAlign: 'center' }}
                                    noWrap
                                >
                                    Card Czar:
                                </Typography>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Chip
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                        avatar={
                                            <Avatar
                                                color="success"
                                                colorBrightness={'light'}
                                            >
                                                {czar[0].toUpperCase()}
                                            </Avatar>
                                        }
                                        className={classes.topchip}
                                        label={czar}
                                        onClick={handleClick}
                                    />
                                </Box>
                            </Grid>
                            <Grid item lg={3} sm={3} xs={12}>
                                <Typography
                                    colorBrightness="hint"
                                    variant="caption"
                                    style={{ textAlign: 'center' }}
                                    noWrap
                                >
                                    Up Next:
                                </Typography>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        color="warning"
                                        avatar={
                                            <Avatar
                                                color="warning"
                                                colorBrightness={'light'}
                                            >
                                                R
                                            </Avatar>
                                        }
                                        className={classes.topchip}
                                        label="RooRoo"
                                        onClick={handleClick}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                        {blackCard ? (
                            <>
                            <Card className={classes.blackcard}>
                                <CardContent>
                                    <Typography
                                        className={classes.pos2}
                                        color="textSecondary"
                                    >
                                        {blackCard.text}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </>
                        ) : (<></>)}
                    </Grid>
                    <Grid item lg={12} sm={12} xs={12}>
                        <Divider variant="middle" />
                        <Typography
                            colorBrightness="hint"
                            variant="caption"
                            style={{ textAlign: 'center' }}
                            noWrap
                        >
                            Cards in Play
                        </Typography>
                        <div className="carousel-holder">
                        {userCardPlayed ? (
                            <Flickity options={flickityOptions} reloadOnUpdate>
                                {userCards.map(data => (
                                    <Card
                                        key={data.card.text}
                                        className={classes.mycard}
                                    >
                                        <CardContent>
                                            <Typography
                                                className={classes.pos}
                                                color="textSecondary"
                                            >
                                                {data.card.text}
                                            </Typography>
                                        </CardContent>
                                        <Divider variant="middle" />
                                        <CardActions>
                                            <Chip
                                                color="info"
                                                colorBrightness={'dark'}
                                                avatar={
                                                    <Avatar color="info">
                                                        {data.user.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                }
                                                className={classes.userchip}
                                                label={data.user}
                                                onClick={handleClick}
                                            />
                                            {myTurn && allCardsPlayed ? (
                                            <Chip
                                            color="success"
                                            colorBrightness={'light'}
                                            className={classes.userchip}
                                            label='Select'
                                            onClick={() => selectCard(data)}
                                        />
                                            ) : (<></>)}
                                        </CardActions>
                                    </Card>
                                ))}
                            </Flickity>
                             ) : (<></>)}
                        </div>
                    </Grid>
                    <Grid item lg={12} sm={12} xs={12}>
                        <Divider variant="middle" />
                        <Typography
                            colorBrightness="hint"
                            variant="caption"
                            style={{ textAlign: 'center' }}
                            noWrap
                        >
                            Your Cards
                        </Typography>
                        <div className="carousel-holder">
                            <Flickity options={flickityOptions} reloadOnUpdate>
                                {myCards.map(card => (
                                    <Card
                                        key={card.text}
                                        className={classes.mycard}
                                    >
                                        <CardContent>
                                            <Typography
                                                className={classes.pos}
                                                color="textSecondary"
                                            >
                                                {card.text}
                                            </Typography>
                                        </CardContent>
                                        <Divider variant="middle" />
                                        <CardActions>
                                            <Chip
                                                color="secondary"
                                                className={classes.userchip}
                                                label="Play Card"
                                                onClick={(e) => playCard(e, card)}
                                            />
                                        </CardActions>
                                    </Card>
                                ))}
                            </Flickity>
                        </div>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

// #######################################################################

export default socketConnect(Dashboard);
