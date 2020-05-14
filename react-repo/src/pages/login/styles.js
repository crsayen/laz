import { makeStyles } from "@material-ui/styles";

export default makeStyles(theme => ({
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0
  },
  logotypeContainer: {
    backgroundColor: theme.palette.primary.main,
    width: "40%",
    height: "75%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    [theme.breakpoints.down("md")]: {
      width: "50%"
    },
    [theme.breakpoints.down("md")]: {
      display: "none"
    }
  },
  logotypeImage: {
    width: 165,
    marginBottom: theme.spacing(4)
  },
  logotypeText: {
    color: "white",
    fontWeight: 500,
    fontSize: 50,
    [theme.breakpoints.down("md")]: {
      fontSize: 48
    }
  },
  formContainer: {
    width: "40%",
    height: "75%",
    display: "flex",
    flexDirection: "column",
    boxShadow: theme.customShadows.widget,
    justifyContent: "center",
    overflow: "auto",
    alignItems: "center",
    [theme.breakpoints.down("md")]: {
      width: "50%",
      overflow: "visible"
    }
  },
  form: {
    width: 320
  },
  tab: {
    fontWeight: 400,
    fontSize: 18
  },
  greeting: {
    fontWeight: 500,
    textAlign: "center",
    marginTop: theme.spacing(4)
  },
  subGreeting: {
    fontWeight: 500,
    textAlign: "center",
    marginTop: theme.spacing(2)
  },
  creatingButtonContainer: {
    marginTop: theme.spacing(2.5),
    height: 46,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  createAccountButton: {
    height: 46,
    textTransform: "none"
  },
  formDividerContainer: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    display: "flex",
    alignItems: "center"
  },
  formDividerWord: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  formDivider: {
    flexGrow: 1,
    height: 1,
    backgroundColor: theme.palette.text.hint + "40"
  },
  errorMessage: {
    textAlign: "center"
  },
  textFieldUnderline: {
    "&:before": {
      borderBottomColor: theme.palette.primary.light
    },
    "&:after": {
      borderBottomColor: theme.palette.primary.main
    },
    "&:hover:before": {
      borderBottomColor: `${theme.palette.primary.light} !important`
    }
  },
  textField: {
    borderBottomColor: theme.palette.background.light
  },
  formButtons: {
    width: "100%",
    marginTop: theme.spacing(4),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  forgetButton: {
    textTransform: "none",
    fontWeight: 400
  },
  loginLoader: {
    marginLeft: theme.spacing(4)
  },
}));
