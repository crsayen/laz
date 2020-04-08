import React, { useState, useEffect } from 'react'
import { ArrowBack as ArrowBackIcon } from '@material-ui/icons'
import {
    Drawer,
    IconButton,
    List,
    Popover,
    TextField as Input,
} from '@material-ui/core'
import { useTheme, makeStyles } from '@material-ui/styles'
import { withRouter } from 'react-router-dom'
import classNames from 'classnames'
import CardContent from '@material-ui/core/CardContent'
import Card from '@material-ui/core/Card'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import PropTypes from 'prop-types'
import SwipeableViews from 'react-swipeable-views'
import AppBar from '@material-ui/core/AppBar'
import Box from '@material-ui/core/Box'
import { Typography } from '../../components/Wrappers'
import ListItemText from '@material-ui/core/ListItemText'
import useStyles from './styles'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Container from '@material-ui/core/Container'
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled'
import SportsEsportsIcon from '@material-ui/icons/SportsEsports'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Avatar from '@material-ui/core/Avatar'
import { Add as AddSectionIcon } from '@material-ui/icons'
import { Button } from '../Wrappers'
import {
    useLayoutState,
    useLayoutDispatch,
    toggleSidebar,
} from '../../context/LayoutContext'

const gameList = [
    { name: 'Game Room 1', players: '6', leader: 'AlexC' },
    { name: 'Game Room 2', players: '3', leader: 'ChrisS' },
    { name: 'Game Room 3', players: '4', leader: 'AustinH' },
    { name: 'Game Room 4', players: '1', leader: 'SheaB' },
    { name: 'Game Room 5', players: '4', leader: 'AustinH' },
    { name: 'Game Room 6', players: '1', leader: 'SheaB' },
    { name: 'Game Room 7', players: '4', leader: 'AustinH' },
    { name: 'Game Room 8', players: '6', leader: 'AlexC' },
    { name: 'Game Room 9', players: '3', leader: 'ChrisS' },
]

const userList = [
    { name: 'AlexC', score: '6' },
    { name: 'ChrisS', score: '3' },
    { name: 'AustinH', score: '4' },
    { name: 'SheaB', score: '1' },
    { name: 'AlexC1', score: '6' },
    { name: 'ChrisS1', score: '3' },
    { name: 'AustinH3', score: '4' },
]

function TabPanel(props) {
    const { children, value, index, ...other } = props
    var classes = useStyles()
    return (
        <Container
            component="div"
            sytle={{ height: '100%', width: '100%', marginLeft: '-10%' }}
            role="tabpanel"
            classes={{ root: classes.controot }}
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Container classes={{ root: classes.controot }}>
                    {children}
                </Container>
            )}
        </Container>
    )
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
}

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    }
}

const useStyles2 = makeStyles(theme => ({
    root: {
        width: '100%',
    },
}))

function Sidebar(props) {
    const classes = useStyles()
    const classes2 = useStyles2()
    const theme = useTheme()
    const [value, setValue] = React.useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isJoinGameOpen, setJoinGameOpen] = useState(false)
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [anchorElTwo, setAnchorElTwo] = React.useState(null)
    const [anchorElThree, setAnchorElThree] = React.useState(null)
    const [isPermanent, setPermanent] = useState(true)
    const { isSidebarOpened } = useLayoutState()
    const layoutDispatch = useLayoutDispatch()
    const [joinGameText, setJoinGameText] = useState('')
    const [createGameText, setCreateGameText] = useState('')
    const [selectedGame, setSelectedGame] = useState('')
    function createGameClick(event) {
        setIsCreateOpen(true)
        setAnchorElTwo(event.currentTarget)
    }
    function joinGameClick(event) {
        setIsOpen(true)
        setAnchorEl(event.currentTarget)
    }
    const joinGameClose = () => {
        setIsOpen(false)
        setAnchorEl(null)
    }
    const createGameClose = () => {
        setIsCreateOpen(false)
        setAnchorElTwo(null)
    }
    function joinGame(event, data) {
        setSelectedGame(data.name)
        setJoinGameOpen(true)
        setAnchorElThree(event.currentTarget)
    }
    const joinGameCloseTwo = () => {
        setJoinGameOpen(false)
        setAnchorElThree(null)
    }
    const handleChange = (event, newValue) => {
        setValue(newValue)
    }
    const handleChangeIndex = index => {
        setValue(index)
    }

    const handleJoinGameText = (e) => {
        setJoinGameText(e.target.value)
    }

    const handleJoinClicked = () => {
        setJoinGameOpen(false)
        setIsOpen(false)
        toggleSidebar(layoutDispatch)
        props.joinGame(joinGameText)
    }

    const handleCreateClicked = () => {
        props.newGame(createGameText)
    }

    const handleCreateGameText = (e) => {
        setCreateGameText(e.target.value)
    }

    const handleJoinFromGamesList = () => {
        setJoinGameOpen(false)
        setIsOpen(false)
        toggleSidebar(layoutDispatch)
        props.joinGame(selectedGame)
    }

    const toggleDrawer = value => event => {
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return
        }
        if (value && !isPermanent) toggleSidebar(layoutDispatch)
    }

    useEffect(function() {
        window.addEventListener('resize', handleWindowWidthChange)
        handleWindowWidthChange()
        return function cleanup() {
            window.removeEventListener('resize', handleWindowWidthChange)
        }
    })

    return (
        <Drawer
            variant={isPermanent ? 'permanent' : 'temporary'}
            className={classNames(classes.drawer, {
                [classes.drawerOpen]: !isPermanent
                    ? !isSidebarOpened
                    : isSidebarOpened,
                [classes.drawerClose]: !isPermanent
                    ? isSidebarOpened
                    : !isSidebarOpened,
            })}
            classes={{
                paper: classNames({
                    [classes.drawerOpen]: !isPermanent
                        ? !isSidebarOpened
                        : isSidebarOpened,
                    [classes.drawerClose]: !isPermanent
                        ? isSidebarOpened
                        : !isSidebarOpened,
                }),
            }}
            open={!isPermanent ? !isSidebarOpened : isSidebarOpened}
            onClose={toggleDrawer(true)}
        >
            <div className={classes.toolbar} />
            <div className={classes.mobileBackButton}>
                <IconButton onClick={() => toggleSidebar(layoutDispatch)}>
                    <ArrowBackIcon
                        classes={{
                            root: classNames(
                                classes.headerIcon,
                                classes.headerIconCollapse
                            ),
                        }}
                    />
                </IconButton>
            </div>
            <Card className={classes.mycard} variant="outlined">
                <CardContent>
                    <Typography
                        className={classes.pos}
                        variant="h4"
                        color="textSecondary"
                    >
                        Lazaretto.io
                    </Typography>
                </CardContent>
            </Card>
            <div className={classes2.root}>
                <AppBar position="static" color="default">
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        aria-label="Sidebar Tabs"
                    >
                        <Tab label="Main" {...a11yProps(0)} />
                        <Tab label="Games" {...a11yProps(1)} />
                    </Tabs>
                </AppBar>
                <SwipeableViews
                    axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                    index={value}
                    onChangeIndex={handleChangeIndex}
                >
                    <TabPanel value={value} index={0} dir={theme.direction}>
                        <List
                            className={classes.sidebarList}
                            classes={{ padding: classes.padding }}
                        >
                            <ListItem button onClick={createGameClick}>
                                <ListItemIcon>
                                    <AddSectionIcon />
                                </ListItemIcon>
                                <ListItemText primary="Create A New Game" />
                            </ListItem>
                            <ListItem button onClick={joinGameClick}>
                                <ListItemIcon>
                                    <AddSectionIcon />
                                </ListItemIcon>
                                <ListItemText primary="Join Existing Game" />
                            </ListItem>
                        </List>
                        <Popover
                            open={isOpen}
                            anchorEl={anchorEl}
                            onClose={joinGameClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            classes={{ paper: classes2.popover }}
                        >
                            <Box m={3} display="flex" flexDirection="column">
                                <Typography>Join Game</Typography>
                                <Input
                                    placeholder="Game Name"
                                    onChange={handleJoinGameText}
                                    classes={{ root: classes2.input }}
                                />
                                <Box
                                    display="flex"
                                    justifyContent="flex-end"
                                    mt={2}
                                >
                                    <Button
                                        color="secondary"
                                        variant="contained"
                                        onClick={() => handleJoinClicked()}
                                        className={classes2.noBoxShadow}
                                    >
                                        Join
                                    </Button>
                                    <Button
                                        classes={{
                                            label: classes2.buttonLabel,
                                        }}
                                        onClick={joinGameClose}
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </Box>
                        </Popover>
                        <Popover
                            open={isCreateOpen}
                            anchorEl={anchorElTwo}
                            onClose={createGameClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            classes={{ paper: classes2.popover }}
                        >
                            <Box m={3} display="flex" flexDirection="column">
                                <Typography>New Game</Typography>
                                <Input
                                    placeholder="Game Name"
                                    classes={{ root: classes2.input }}
                                    onChange={handleCreateGameText}
                                />
                                <Box
                                    display="flex"
                                    justifyContent="flex-end"
                                    mt={2}
                                >
                                    <Button
                                        color="secondary"
                                        variant="contained"
                                        className={classes2.noBoxShadow}
                                        onClick={() => handleCreateClicked()}
                                    >
                                        Create
                                    </Button>
                                    <Button
                                        classes={{
                                            label: classes2.buttonLabel,
                                        }}
                                        onClick={createGameClose}
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </Box>
                        </Popover>
                        <Divider />
                        <Typography
                            variant="h5"
                            style={{ textAlign: 'center' }}
                        >
                            Current Game
                        </Typography>
                        <Typography variant="body2">Your Score: 6</Typography>
                        <Typography variant="body2">
                            Current Winner: ChrisS
                        </Typography>
                        <Divider />
                        <Typography
                            variant="h6"
                            style={{ textAlign: 'center' }}
                        >
                            Players
                        </Typography>
                        <div style={{ maxHeight: '175px', overflow: 'auto' }}>
                            <List className={classes.list} dense>
                                {userList.map(data => (
                                    <ListItem key={data.name} button dense>
                                        <ListItemAvatar>
                                            <AccountCircleIcon />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={data.name}
                                            secondary={`Score: ${data.score}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </div>
                    </TabPanel>
                    <TabPanel value={value} index={1} dir={theme.direction}>
                        <Container classes={{ root: classes.controot }}>
                            <div className={classes.demo}>
                                <List className={classes.list} dense>
                                    {props.openGames.map(data => (
                                        <ListItem key={data.name} button>
                                            <ListItemAvatar>
                                                <Avatar>
                                                    <SportsEsportsIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={data.name}
                                                secondary={`Owner: ${data.leader} Players: ${data.players}`}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    aria-label="Join Game"
                                                    onClick={(e) => joinGame(e, data)}
                                                >
                                                    <PlayCircleFilledIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                                <Popover
                                    open={isJoinGameOpen}
                                    anchorEl={anchorElThree}
                                    onClose={joinGameCloseTwo}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                    classes={{ paper: classes2.popover }}
                                >
                                    <Box
                                        m={3}
                                        display="flex"
                                        flexDirection="column"
                                    >
                                        <Typography>Join Game ?</Typography>
                                        <Box
                                            display="flex"
                                            justifyContent="flex-end"
                                            mt={2}
                                        >
                                            <Button
                                                color="secondary"
                                                variant="contained"
                                                className={classes2.noBoxShadow}
                                                onClick={handleJoinFromGamesList}
                                            >
                                                Join
                                            </Button>
                                            <Button
                                                classes={{
                                                    label: classes2.buttonLabel,
                                                }}
                                                onClick={joinGameCloseTwo}
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                    </Box>
                                </Popover>
                            </div>
                        </Container>
                    </TabPanel>
                </SwipeableViews>
            </div>
        </Drawer>
    )

    // ##################################################################
    function handleWindowWidthChange() {
        var windowWidth = window.innerWidth
        var breakpointWidth = theme.breakpoints.values.md
        var isSmallScreen = windowWidth < breakpointWidth

        if (isSmallScreen && isPermanent) {
            setPermanent(false)
        } else if (!isSmallScreen && !isPermanent) {
            setPermanent(true)
        }
    }
}

export default withRouter(Sidebar)
