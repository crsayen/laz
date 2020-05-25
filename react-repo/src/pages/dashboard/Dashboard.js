// eslint-disable-next-line
import React, { useState, useEffect } from 'react'
// eslint-disable-next-line
import { Grid, Box, Fab } from '@material-ui/core'
import Icon from '@mdi/react'
import { mdiSettings as SettingsIcon, mdiWeatherLightning } from '@mdi/js'
// eslint-disable-next-line
import axios from 'axios'
import useStyles from './styles'
// eslint-disable-next-line
import Flickity from 'react-flickity-component'
import 'flickity/css/flickity.css'
import CircularProgress from '@material-ui/core/CircularProgress';
// eslint-disable-next-line
import {
    Chip,
    Typography,
    Button,
    Avatar,
    Badge,
} from '../../components/Wrappers'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Divider from '@material-ui/core/Divider'
import { socketConnect } from 'socket.io-react'
import SettingsPopper from './components/SettingsPopper'
import Swal from 'sweetalert2'
import Container from '@material-ui/core/Container'

function Dashboard(props) {
    var classes = useStyles()
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [winnderDialogOpen, setWinnerDialogOpen] = useState(false)
    const open = Boolean(anchorEl)
    const id = open ? 'add-section-popover' : undefined
    const handleSideClick = event => {
        setAnchorEl(open ? null : event.currentTarget)
    }

    const getWinningText = () => {
        let texts = props.winnerCards.map(card => card.text)
        return texts.join('\n\n')
    }

    if (winnderDialogOpen) {
        Swal.fire({
            title: `${props.winnerName} Won!`,
            text: getWinningText(),
            icon: 'success',
            timer: 7000,
            width: '20rem',
            showConfirmButton: true,
        }).then(() => {
            props.socket.emit('ready')
            setWinnerDialogOpen(false)
        })
    }

    if (props.gameJoined) {
        Swal.fire({
            title: `Joined Game`,
            text: `Welcome to ${props.gameID}`,
            timer: 2000,
            icon: 'success',
            width: '20rem',
            showConfirmButton: false,
        }).then(() => {
            props.setGameJoined(false)
        })
    }

    useEffect(() => {
        props.socket.on('playerJoined', player => {
            if (props.username != player){
                Swal.fire({
                    title: `${player} joined!`,
                    text: `Welcome!`,
                    timer: 2000,
                    width: '20rem',
                    showConfirmButton: false
                })
            }
        });
    }, []) // eslint-disable-line

    const flickityOptions = {
        adaptiveHeight: true,
        initialIndex: 0,
        freeScroll: true,
        contain: true,
        draggable: true,
        //wrapAround: true,
        imagesLoaded: true,
        pageDots: false,
    }

    const handleClick = () => {}
    // eslint-disable-next-line
    const handleWinnerDialogClose = () => {
        setWinnerDialogOpen(false)
        props.setWinnerCards([{text: ''}])
        props.socket.emit('ready')
    }

    useEffect(() => {
        setWinnerDialogOpen(!!props.winnerCards[0].text)
    }, [props.winnerCards]) // eslint-disable-line

    const newGame = () => props.newGame()
    const joinGame = () => props.joinGame()
    const startGame = () => props.startGame()

    const renderIf = (condition, component) => (condition ? component : <></>)

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
            {/* <SettingsPopper
                id={id}
                open={open}
                anchorEl={anchorEl}
                newGame={newGame}
                joinGame={joinGame}
                startGame={startGame}
                props={props}
            /> */}
            <Grid container justify="center" alignItems="center" spacing={2}>
                { props.gameStarted ? (
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
                                                    {props.czar[0].toUpperCase()}
                                                </Avatar>
                                            }
                                            className={classes.topchip}
                                            label={props.czar}
                                            onClick={handleClick}
                                        />
                                    </Box>
                                    {/* <Typography
                                        colorBrightness="hint"
                                        variant="caption"
                                        style={{ textAlign: 'center' }}
                                        noWrap
                                    >
                                        Up Next: // TODO: do we care? If we do, it's gonna take some work
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
                                    </Box> */}
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            {renderIf(
                                props.blackCard,
                                <Card className={classes.blackcard}>
                                    <CardContent>
                                        <Typography
                                            className={classes.pos2}
                                            color="textSecondary"
                                        >
                                            {props.blackCard.text}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>

                        <Grid item lg={12} sm={12} xs={12}>
                            <Divider variant="middle" />

                            {renderIf(
                                    props.myTurn && props.userCards.length === 0,
                                    <>
                                    <Typography
                                    colorBrightness="hint"
                                    variant="caption"
                                    style={{ textAlign: 'center' }}
                                    noWrap
                                >
                                    Cards in Play
                                </Typography>
                                    <Container classes={{ root: classes.controot }}>
                                    <div className="carousel-holder">
                                        <Flickity
                                            options={flickityOptions}
                                            reloadOnUpdate
                                        >
                                                <Card
                                                    key={"MyTurn"}
                                                    className={classes.turncard}
                                                >
                                                    <CardContent className={classes.waitingCard}>
                                                        <Typography
                                                            className={classes.waitingCardContent}
                                                            color="textSecondary"
                                                        >
                                                            Waiting for the other players to pick cards
                                                        </Typography>
                                                        <CircularProgress/>
                                                    </CardContent>
                                                </Card>
                                        </Flickity>
                                    </div>
                                </Container>
                                </>
                            )}
                             {renderIf(
                                 props.userCards.length > 0,
                                 <>
                                 <Typography
                                 colorBrightness="hint"
                                 variant="caption"
                                 style={{ textAlign: 'center' }}
                                 noWrap
                             >
                                 Cards in Play
                             </Typography>
                            <Container classes={{ root: classes.controot }}>
                                <div className="carousel-holder">
                                    <Flickity
                                        options={flickityOptions}
                                        reloadOnUpdate
                                    >
                                        {props.userCards.map(data => (
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
                                                    {renderIf(
                                                        !props.myTurn,
                                                        <Chip
                                                            color="info"
                                                            colorBrightness={
                                                                'light'
                                                            }
                                                            avatar={
                                                                <Avatar color="info">
                                                                    {data.user
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()}
                                                                </Avatar>
                                                            }
                                                            className={
                                                                classes.userchip
                                                            }
                                                            label={data.user}
                                                            onClick={
                                                                handleClick
                                                            }
                                                        />
                                                    )}
                                                    {renderIf(
                                                        props.myTurn &&
                                                            props.allCardsPlayed,
                                                        <Chip
                                                            color="success"
                                                            colorBrightness={
                                                                'light'
                                                            }
                                                            className={
                                                                classes.userchip
                                                            }
                                                            label="Select"
                                                            onClick={() =>
                                                                props.selectCard(data)
                                                            }
                                                        />
                                                    )}
                                                </CardActions>
                                            </Card>
                                        ))}
                                    </Flickity>
                                </div>
                            </Container>
                            </>
                             )}
                        </Grid>
                        <Grid item lg={12} sm={12} xs={12}>
                            <Divider variant="middle" />
                            {props.myTurn ? (
                                    <Container classes={{ root: classes.controot }}>
                                    <div className="carousel-holder">
                                        <Flickity
                                            options={flickityOptions}
                                            reloadOnUpdate
                                        >
                                                <Card
                                                    key={"MyTurn"}
                                                    className={classes.turncard}
                                                >
                                                    <CardContent>
                                                        <Typography
                                                            className={classes.pos}
                                                            color="textSecondary"
                                                        >
                                                            {"Its you turn! Please select a card from above."}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                        </Flickity>
                                    </div>
                                </Container>
                            ) : (
                                    <>
                                     <Typography
                                colorBrightness="hint"
                                variant="caption"
                                style={{ textAlign: 'center' }}
                                noWrap
                            >
                                Your Cards
                            </Typography>
                            <Container classes={{ root: classes.controot }}>
                                <div className="carousel-holder">
                                    <Flickity
                                        options={flickityOptions}
                                        reloadOnUpdate
                                    >
                                        {props.myCards.map(card => (
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

                                                {renderIf(
                                                    !props.myTurn && !props.allCardsPlayed && props.myNumPlayedCards < props.blackCard.pick,
                                                    <>
                                                        <Divider variant="middle" />
                                                        <CardActions>
                                                            <Chip
                                                                color="secondary"
                                                                className={
                                                                    classes.userchip
                                                                }
                                                                label="Play Card"
                                                                onClick={e =>
                                                                    props.playCard(
                                                                        e,
                                                                        card
                                                                    )
                                                                }
                                                            />
                                                        </CardActions>
                                                    </>
                                                )}
                                            </Card>
                                        ))}
                                    </Flickity>
                                </div>
                            </Container>
                            </>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
                ) : (
            <Grid item lg={12} sm={12} xs={12}>
            <Typography className={classes.center} color={"secondary"} variant="h1" colorBrightness={'light'}>
                {
                    props.gameOwner == props.username && props.username != ''
                        ? (
                            <Button // TODO: style this thing
                                onClick={() => startGame()}
                            >
                                Start Game
                            </Button>
                        )
                        : props.gameID == ''
                            ? (<>Use the sidebar to create or join a game</>)
                            : <>Waiting for the game to start...</>
                }
            </Typography>
            </Grid>

                )}
            </Grid>
        </>
    )
}

// #######################################################################

export default socketConnect(Dashboard)
