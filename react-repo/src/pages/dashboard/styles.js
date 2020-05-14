import { makeStyles } from '@material-ui/styles'

export default makeStyles(theme => ({
    button: {
        marginBottom: theme.spacing(2),
    },
    settingsFab: {
        position: "fixed",
        top: theme.spacing(12),
        right: 0,
        zIndex: 1,
        borderRadius: 0,
        borderTopLeftRadius: "50%",
        borderBottomLeftRadius: "50%"
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
        margin: '0 auto',
        background: 'black',
        color: 'white',
        width: 'auto',
        [theme.breakpoints.down("xl")]: {
            width: "25%"
        },
        [theme.breakpoints.down("lg")]: {
            width: "25%"
        },
        [theme.breakpoints.down("md")]: {
            width: "50%"
        },
        [theme.breakpoints.down("sm")]: {
            width: "100%",
            height: "60%"
        },
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
      padding: '6px',
      margin: '6px',
      
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
    controot: {
        paddingRight: 0,
        paddingLeft: 0,
        marginTop: '5px',
        marginBottom: '5px',
        '@media (min-width: 600px)': {
         paddingRight: 0,
         paddingLeft: 0
       }
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
        marginBottom: 1,
        'overflow-y': 'auto',
        'touch-action': 'pan-y',
        height: '100%',
        bottom: 0,
      width: '145px',
      // eslint-disable-next-line
      height: '95px'
    },
    pos2: {
        marginBottom: 1,
        padding: 1,
        'overflow-y': 'auto',
        'touch-action': 'pan-y',
        bottom: 0,
      // eslint-disable-next-line
      minWidth: '50%',
      height: '85px',
      [theme.breakpoints.down("sm")]: {
        width: "90%",
        height: '95px'
         },
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
