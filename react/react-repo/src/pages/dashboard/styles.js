import { makeStyles } from '@material-ui/styles'

export default makeStyles(theme => ({
    button: {
        marginBottom: theme.spacing(2),
    },
    card: {
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    fullHeightBody: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    alignStandaloneElement: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    text: {
        paddingRight: 15,
        'word-break': 'keep-all',
        overflow: 'hidden',
        'white-space': 'nowrap',
    },
    blackcard: {
        borderRadius: '13px',
        background: 'black',
        color: 'white',
    },
    actions: {
        display: 'inline',
    },
    playedcard: {
        borderRadius: '13px',
        width: '100%',
        height: '100%',
    },
    mycard: {
      padding: '5px',
      margin: '5px',
        borderRadius: '13px',
        // eslint-disable-next-line
        width: 'intrinsic' /* Safari/WebKit uses a non-standard name */,
        // eslint-disable-next-line
        width: '-moz-max-content' /* Firefox/Gecko */,
        // eslint-disable-next-line
        width: '-webkit-max-content' /* Chrome */,
        // eslint-disable-next-line
        width: 'max-content',
    },
    playedcardCont: {
        padding: '5px',
        maxHeight: 'max-content',
        height: '100%',
    },
    userchip: {
        width: '100%',
        textAlign: 'center',
    },
    topchip: {
        width: '100%',
        textAlign: 'center',
        color: 'black',
    },
    pos: {
        marginBottom: 15,
        height: '100%',
        bottom: 0,
      width: '120px',
      // eslint-disable-next-line
      height: '75px'
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
}))
