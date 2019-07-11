import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import logo from '../logo.jpg';

class Header extends Component {
  constructor(){
    super();
  }

  render() {
    return (
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">Spotify Jukebox</h1>
      </header>
    );
  }
}

export default Header;
