import React from "react";
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import Layout from "./Layout";
import Error from "../pages/error";
import Login from "../pages/login";

export default function App() {
  const trueme = true;

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/app/dashboard" />} />
        {/* <Route
          exact
          path="/app"
          render={() => <Redirect to="/app/dashboard" />}
        /> */}
        <Route path="/app" render={() => <Layout /> } />
        <PublicRoute path="/login" component={Login} />
        <Route component={Error} />
      </Switch>
    </BrowserRouter>
  );

  // #######################################################################
// eslint-disable-next-line
  function PrivateRoute({ component, ...rest }) {
    return (
      <Route
        {...rest}
        render={props =>
          trueme ? (
            React.createElement(component, props)
          ) : (
            <Redirect to={"/login"} />
          )
        }
      />
    );
  }

  function PublicRoute({ component, ...rest }) {
    return (
      <Route
        {...rest}
        render={props =>
          !trueme ? (
            <Redirect
              to={{
                pathname: "/"
              }}
            />
          ) : (
            React.createElement(component, props)
          )
        }
      />
    );
  }
}
