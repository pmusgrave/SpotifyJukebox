import React, { Component } from 'react';
import Header from './Header.js';
import Login from './Login.js';

const request = require('browser-request');

class LandingPage extends Component {

  render() {
    return (
      <div className="App">
        <Header />
        <Login />
      </div>
    );
  }
}

export default LandingPage;
