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
        background: 'black',
        color: 'white',
        width: '100%'
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
        marginBottom: 5,
        overflow: 'auto',
        height: '100%',
        bottom: 0,
      width: '145px',
      // eslint-disable-next-line
      height: '85px'
    },
    pos2: {
        marginBottom: 5,
        overflow: 'auto',
        height: '100%',
        bottom: 0,
      width: '145px',
      // eslint-disable-next-line
      height: '85px'
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
