
import React, { Component } from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import logo from './logo.jpg';
import './App.css';
import Header from './Components/Header.js';
import Login from './Components/Login.js';
import DeviceSelector from './Components/DeviceSelector.js';

const request = require('browser-request');

var query_string = require('query-string');

var parsed_hash = query_string.parse(window.location.hash);
var auth_keys = {
  // redirect_uri: 'http://psmusgrave.com:80/callback', // Your redirect uri
  // redirect_uri: 'http://localhost:8888/callback', // Your redirect uri
  redirect_uri: 'https://spotboxify.herokuapp.com/callback',
  stateKey: 'spotify_auth_state',
  access_token: parsed_hash['access_token'],
  refresh_token: parsed_hash['refresh_token']
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      authenticated: false,
      product: ''
    }

    this.authentication_scheduler();
  }
  // componentDidMount() {
  //   socket.on('server:event', data => {
  //     console.log('hi io');
  //   })
  // }

  authentication_scheduler(){
    setInterval(() => {
      this.set_authenticated_state()
    }, 900000)
  }

  set_authenticated_state() {
    // it might be okay to simply check if access_token != 'invalid_token'

    // currently calling this function initially until login is successful,
    // then calling it on a 15 minute interval

    let options = {
      url: 'https://api.spotify.com/v1/me',
      headers: { 'Authorization': 'Bearer ' + auth_keys.access_token },
      json: true
    };

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          this.setState({
            authenticated: true,
            product: body.product
          });
        }
        else {
          this.setState({authenticated: false});
        }
    });
  }

  render() {
    if(this.state.authenticated && this.state.product == 'premium') {
      return (
          <DeviceSelector auth_keys={auth_keys}/>
      );
    }
    else if(this.state.authenticated && this.state.product != 'premium') {
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Spotify Jukebox</h1>
          </header>
          <h4>Sorry! This app requires Spotify Premium.</h4>
        </div>
      );
    }
    else {
      this.set_authenticated_state(); //this is bad
      return (
        <div className="App">
          <Header />
          <Login />
        </div>
      );
    }

  }
}

// function refresh_token() {
//
//   // requesting access token from refresh token
//   var refresh_token = req.query.refresh_token;
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
//     form: {
//       grant_type: 'refresh_token',
//       refresh_token: refresh_token
//     },
//     json: true
//   };
//
//   request.post(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {
//       var access_token = body.access_token;
//       res.send({
//         'access_token': access_token
//       });
//     }
//   });
// }


export default App;
