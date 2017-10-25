// this is a really ugly early version and needs to be split up into modules

import React, { Component } from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Input from './Components/Input.js';
import Login from './Components/Login.js';
import TransportControls from './Components/TransportControls.js';

const query_string = require('query-string');

var parsed_hash = query_string.parse(window.location.hash);
var auth_keys = {
  redirect_uri: 'http://localhost:8888/callback', // Your redirect uri
  stateKey: 'spotify_auth_state',
  access_token: parsed_hash['access_token'],
  refresh_token: parsed_hash['refresh_token']
}

function get_parameter_by_name(name) {
  // this function copied from stackoverflow here:
  // https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
  var url = window.location.href;
  //name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&#]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            playlist: [],
        };
    }

    add_to_playlist = (value) => {
        this.setState({playlist: this.state.playlist.concat([value])});
    }

    render() {
        return (
            <div className="App">
              <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h1 className="App-title">Spotify Jukebox</h1>
              </header>
              <Login />
              <TransportControls playlist={this.state.playlist} auth_keys={auth_keys}/>

              <Input playlist={this.add_to_playlist.bind(this)}/>
              <ul>{this.state.playlist.map(function(list_item) {
                return <li>{list_item}</li>;
              })}</ul>
            </div>
        );
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
