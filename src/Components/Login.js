import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import ReactDOM from 'react-dom';

const request = require('browser-request');

class Login extends Component {
  render() {
    return (
      <a href="http://localhost:3000/login">Login to Spotify</a>
    );
  }
}

export default Login;
