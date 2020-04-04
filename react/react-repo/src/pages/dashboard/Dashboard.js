// eslint-disable-next-line
import React, { useState, useEffect } from 'react'
// eslint-disable-next-line
import { Grid, Paper, Box, Fab, } from '@material-ui/core'
import Icon from '@mdi/react'
import { mdiSettings as SettingsIcon } from '@mdi/js'
// eslint-disable-next-line
import axios from 'axios'
import useStyles from './styles'
// eslint-disable-next-line
import Widget from '../../components/Widget'
import WinnerDialog from '../../components/WinnerDialog'
import Flickity from 'react-flickity-component'
import 'flickity/css/flickity.css'
// eslint-disable-next-line
import {Chip,Typography,Button,Avatar,Badge} from '../../components/Wrappers'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Divider from '@material-ui/core/Divider'
import { socketConnect } from 'socket.io-react';
import SettingsPopper from './components/SettingsPopper'
// TODO: make it so that the winner dialog shows the black card's text (black bg)
// with white card text filling in the blanks (whitebg)

const name = Array(10).fill(null).map(() => Math.floor(Math.random() * 10).toString()).join('')

function Dashboard(props) {
    var classes = useStyles()
    const [winnderDialogOpen, setWinnerDialogOpen] = useState(false)
    const [winnerName, setWinnerName] = useState('')
    const [allCardsPlayed, setAllCardsPlayed] = useState(false)
    const [winnerCards, setWinnerCards] = useState([{text:''}])
    const [gameID, setgameID] = useState("test1");
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [myCards, setMyCards] = useState([])
    const [blackCard, setBlackCard] = useState(false)
    const [_userCard, _setUserCard] = useState([])
    const [userCards, setUserCards] = useState([])
    const [userCardPlayed, setUserCardPlayed] = useState(false)
    const [czar, setCzar] = useState('Waiting')
    const [myTurn, setMyTurn] = useState(false)
    const open = Boolean(anchorEl)

    const id = open ? 'add-section-popover' : undefined

    const handleSideClick = event => {
        setAnchorEl(open ? null : event.currentTarget)
    }

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



      const handleClick = () => {

    }

    const handleWinnerDialogClose = () => {
        setWinnerDialogOpen(false)
        setWinnerCards([{text:''}])
        props.socket.emit("ready", true)
    }

    useEffect(() => {
        props.socket.on("dealWhite", doSetMyCards)
        props.socket.on("dealBlack", setBlackCard)
        props.socket.on("newCzar", setCzar)
        props.socket.on("myTurn", setMyTurn)
        props.socket.on('startgame', console.log)
        props.socket.on('allCardsPlayed', () => {
            console.log("all cards played")
            setAllCardsPlayed(true)
        })
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
    const doSetMyCards = (cards) => {
        console.log(cards)
        let newCards = myCards.slice().concat(cards)
        setMyCards(newCards)
    }

    const renderIf = (condition, component) => (
        (condition) ? component : <></>
    )

    return (
        <>
                 <Fab
                    color="primary"
                    aria-label="settings"
                    onClick={e => handleSideClick(e)}
                    className={classes.settingsFab}
                    style={{ zIndex: 100 }}
                >
                 <Icon path={SettingsIcon} size={1} color="#fff" />
                </Fab>
                <SettingsPopper id={id} open={open} anchorEl={anchorEl} newGame={newGame} joinGame={joinGame} startGame={startGame}/>
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
                    <Grid item lg={8} sm={8} xs={8}>
                        <Grid
                            container
                            justify="center"
                            alignItems="center"
                            style={{ paddingBottom: 20 }}
                            spacing={2}
                        >
                            <Grid item lg={6} sm={6} xs={12}>
                                <Typography
                                    colorBrightness="hint"
                                    variant="caption"
                                    style={{ textAlign: 'center' }}
                                    noWrap
                                >
                                    Card Czar:
                                </Typography>
                                <Box

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
                                <Typography
                                    colorBrightness="hint"
                                    variant="caption"
                                    style={{ textAlign: 'center' }}
                                    noWrap
                                >
                                    Up Next:
                                </Typography>
                                <Box

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
                        </Grid>
                        <Grid item xs={12}>
                            {renderIf(
                                blackCard,
                                (<Card className={classes.blackcard}>
                                    <CardContent>
                                        <Typography
                                            className={classes.pos2}
                                            color="textSecondary"
                                        >
                                            {blackCard.text}
                                        </Typography>
                                    </CardContent>
                                </Card>)
                            )}
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
                                            {renderIf(!myTurn,
                                                <Chip
                                                    color="info"
                                                    colorBrightness={'light'}
                                                    avatar=
                                                        {<Avatar color="info">
                                                            {data.user.charAt(0).toUpperCase()}
                                                        </Avatar>}
                                                    className={classes.userchip}
                                                    label={data.user}
                                                    onClick={handleClick}
                                                />
                                            )}
                                            {renderIf(
                                                myTurn && allCardsPlayed,
                                                (<Chip
                                                    color="success"
                                                    colorBrightness={'light'}
                                                    className={classes.userchip}
                                                    label='Select'
                                                    onClick={() => selectCard(data)}
                                                />)
                                            )}
                                        </CardActions>
                                    </Card>
                                ))}
                            </Flickity>
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
                                        {renderIf(
                                            !myTurn && !allCardsPlayed,
                                            (<CardActions>
                                                <Chip
                                                    color="secondary"
                                                    className={classes.userchip}
                                                    label="Play Card"
                                                    onClick={(e) => playCard(e, card)}
                                                />
                                            </CardActions>)
                                        )}
                                    </Card>
                                ))}
                            </Flickity>
                        </div>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
        </>
    )
}

// #######################################################################

export default socketConnect(Dashboard);
