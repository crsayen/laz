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
    width: 0,
    [theme.breakpoints.down("sm")]: {
      width: drawerWidth
    }
  },
 controot: {
   paddingRight: 0,
   paddingLeft: 0,
   '@media (min-width: 600px)': {
    paddingRight: 0,
    paddingLeft: 0
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
  list: {
    overflow: 'auto',
      maxHeight: "20%",
  },
  mycard: {
    padding: '1px',
    margin: '0 auto',
    height: '100%',
    maxHeight: '65px',
    minHeight: '65px',
    marginBottom: '6px',
      borderRadius: '13px',
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
    margin: "0 auto",
  width: '145px',
  // eslint-disable-next-line
  height: '29px'
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
