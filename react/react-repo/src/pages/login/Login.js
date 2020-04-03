import React, { useState } from "react";
import {
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  Fade,
  TextField as Input
} from "@material-ui/core";
import { withRouter } from "react-router-dom";
// styles
import useStyles from "./styles";

// logo
import logo from "./logo.svg";


// context
import useLoginHandler from "../../hooks/UserAuth";

//components
import { Button, Typography } from "../../components/Wrappers";

const getGreeting = () => {
  const d = new Date();
  if (d.getHours() >= 4 && d.getHours() <= 12) {
    return "Good Morning";
  } else if (d.getHours() >= 13 && d.getHours() <= 16) {
    return "Good Day";
  } else if (d.getHours() >= 17 && d.getHours() <= 23) {
    return "Good Evening";
  } else {
    return "Good Night";
  }
};

function Login(props) {
  var classes = useStyles();


  // local
  // eslint-disable-next-line
  var [error, setError] = useState(null);
  var [activeTabId, setActiveTabId] = useState(0);
  var [loginValue, setLoginValue] = useState("admin@rs-ll.com");
  var [passwordValue, setPasswordValue] = useState("password");
  const { onLogin } = useLoginHandler(props.history)

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin(loginValue, passwordValue)
  };

  return (
    <Grid container className={classes.container}>
      <div className={classes.logotypeContainer}>
        <img src={logo} alt="logo" className={classes.logotypeImage} />
        <Typography className={classes.logotypeText}></Typography>
      </div>
      <div className={classes.formContainer}>
        <div className={classes.form}>
          <Tabs
            value={activeTabId}
            onChange={(e, id) => setActiveTabId(id)}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Login" classes={{ root: classes.tab }} />
            <Tab label="New User" classes={{ root: classes.tab }} />
          </Tabs>
          {activeTabId === 0 && (
            <React.Fragment>
              <Typography variant="h1" className={classes.greeting}>
                {getGreeting()}, User
              </Typography>
              <Fade
                in={error}
                style={
                  !error ? { display: "none" } : { display: "inline-block" }
                }
              >
                <Typography color="secondary" className={classes.errorMessage}>
                  Something is wrong with your login or password :(
                </Typography>
              </Fade>
              <form onSubmit={handleSubmit}>
              <Input
                id="email"
                InputProps={{
                  classes: {
                    underline: classes.InputUnderline,
                    input: classes.Input
                  }
                }}
                value={loginValue}
                onChange={e => setLoginValue(e.target.value)}
                margin="normal"
                placeholder="Email Adress"
                type="email"
                fullWidth
              />
              <Input
                id="password"
                InputProps={{
                  classes: {
                    underline: classes.InputUnderline,
                    input: classes.Input
                  }
                }}
                value={passwordValue}
                onChange={e => setPasswordValue(e.target.value)}
                margin="normal"
                placeholder="Password"
                type="password"
                fullWidth
              />
              <div className={classes.formButtons}>
                {false ? (
                  <CircularProgress size={26} className={classes.loginLoader} />
                ) : (
                  <Button
                    disabled={
                      loginValue.length === 0 || passwordValue.length === 0
                    }
                    variant="contained"
                    type="submit"
                    color="primary"
                    size="large"
                  >
                    Login
                  </Button>
                )}
              </div>
              </form>
            </React.Fragment>
          )}
         
        </div>
      </div>
    </Grid>
  );
}

export default withRouter(Login);
