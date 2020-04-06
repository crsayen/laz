import { makeStyles } from "@material-ui/styles";

const drawerWidth = 300;

export default makeStyles(theme => ({
  menuButton: {
    marginLeft: 12,
    marginRight: 36
  },
  hide: {
    display: "none"
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap"
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 40,
    [theme.breakpoints.down("sm")]: {
      width: drawerWidth
    }
  },
  toolbar: {
    ...theme.mixins.toolbar,
    [theme.breakpoints.down("sm")]: {
      display: "none"
    }
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  },
  sidebarList: {
    marginTop: theme.spacing(6)
  },
  mobileBackButton: {
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(3),
    [theme.breakpoints.only("sm")]: {
      marginTop: theme.spacing(0.625)
    },
    [theme.breakpoints.up("md")]: {
      display: "none"
    }
  },
  mycard: {
    padding: '6px',
    margin: '0 auto',
    
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
  popover: {
    backgroundColor: theme.palette.primary.main,
    color: "#fff"
  },
  fab: {
    width: 36,
    height: 34
  },
  pos: {
    marginBottom: 1,
    overflow: 'auto',
    height: '100%',
    bottom: 0,
  width: '145px',
  // eslint-disable-next-line
  height: '95px'
},
  noBoxShadow: {
    boxShadow: "none !important",
    marginRight: theme.spacing(1)
  },
  buttonLabel: {
    color: "#fff"
  },
  input: {
    "& .MuiInputBase-input": {
      color: "#fff"
    },
    "& .MuiInput-underline:before": {
      borderBottom: "1px solid rgba(255, 255, 255, .45)"
    }
  },
  chat: {
    width: 45,
    height: 45
  },
  padding: {
    paddingBottom: theme.spacing(2)
  }
}));
