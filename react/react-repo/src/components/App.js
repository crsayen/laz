import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import Layout from "./Layout";
import Error from "../pages/error";
import Login from "../pages/login";
import useLoginHandler from "../hooks/UserAuth";

export default function App(props) {
  const { checkLoggedIn } = useLoginHandler(props.history)
  const trueme = true;

  const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => (
      checkLoggedIn(success =>
      {
        console.log("privateroute", success)
        return success
          ? <Layout {...props} />
          : <Redirect to='/login' />
      })
    )} />
  )


  return (
    <Router>
      <Switch>
        <Route path="/" render={() => <Redirect to="/app" />} />
        {/* <Route
          exact
          path="/app"
          render={() => <Redirect to="/app/dashboard" />}
        /> */}
        <PrivateRoute path="/app" component={Layout} />
        <Route path="/login" component={Login} />
        <Route component={Error} />
      </Switch>
    </Router>
  );
}