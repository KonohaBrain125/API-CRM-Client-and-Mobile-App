import React, { useEffect } from "react";

import { connect } from "react-redux";

// import { loadUser } from './redux/actions/auth';
import setAuthToken from "./utils/setAuthToken";
import MainRouter from "./router/MainRouter";
import "./App.scss";
import Signin from "./components/pages/Signin";
import Home from "./components/pages/Home";

const App = (props) => {
  useEffect(() => {
    setAuthToken(localStorage.token);
    // store.dispatch(loadUser());
  }, []);
  return <>{!props.isAuthenticated ? <Signin /> : <MainRouter />}</>;
};

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.Auth.isAuth,
  };
};

export default connect(mapStateToProps)(App);
