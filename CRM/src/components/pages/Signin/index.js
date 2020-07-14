import React, { useState } from "react";
import SigninForm from "./SigninForm";
import { Redirect } from "react-router-dom";
// import {
//   signIn,
//   authenticate,
//   isAuthenticated
// } from "../../../Utils/Requests/Auth";

const Login = () => {
  const [state, setState] = useState({
    email: "john@hotmail.com",
    password: "qwerty12345",
    error: "",
    loading: false
  });

  const { email, password, loading, error } = state;

  const handleChange = event => {
    setState({
      ...state,
      error: false,
      [event.target.name]: event.target.value
    });
  };

  // const handleSubmit = async event => {
  //   event.preventDefault();
  //   setState({ ...state, error: false, loading: true });
  //   const data = await signIn({ email, password }).catch(err => {
  //     setState({ ...state, error: err.response.data.error });
  //   });

  //   console.log(data);
  //   if (data && data.status === 200) {
  //     authenticate(data, () => {
  //       if (isAuthenticated()) {
  //         setState({ ...state });
  //       }
  //     });
  //   }
  // };

  const showError = () => <div className="alert alert-danger">{error}</div>;

  const showLoading = () => (
    <div className="alert alert-info">
      <h2>Loading...</h2>
    </div>
  );

  return (
    <div className="login-dark">
      {loading && showLoading()}
      {error && showError()}
      {!loading && (
        <SigninForm
          handleSubmit={()=>{}}
          handleChange={handleChange}
          state={state}
        />
      )}
    </div>
  );
};

export default Login;
