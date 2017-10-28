import React, { Component } from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Input from './Components/Input.js';
import Login from './Components/Login.js';
import Search from './Components/Search.js';
import TransportControls from './Components/TransportControls.js';

var query_string = require('query-string');

var parsed_hash = query_string.parse(window.location.hash);
var auth_keys = {
  redirect_uri: 'http://localhost:8888/callback', // Your redirect uri
  stateKey: 'spotify_auth_state',
  access_token: parsed_hash['access_token'],
  refresh_token: parsed_hash['refresh_token']
}

class App extends Component {
  constructor(props) {
      super(props);
      this.state = {
        authenticated: true,
        playlist: [],
      };
      this.socket = require('socket.io-client')('http://localhost:8888');
      this.socket.on('playlist_add', (uri) => {
        console.log('playlist_add ' + uri);
        this.add_to_playlist(uri);
      });
      //this.is_authenticated();
  }

  // componentDidMount() {
  //   socket.on('server:event', data => {
  //     console.log('hi io');
  //   })
  // }

  // is_authenticated() {
    // it might be okay to simply check if access_token != 'invalid_token'

    // not exactly sure when or from where this function should be called
    // because you don't want to query the spotify API on every render.
    // but calling it in the app constructor, for instance, might result in the
    // state being read before app is authenticated

    // let options = {
    //   url: 'https://api.spotify.com/v1/me',
    //   headers: { 'Authorization': 'Bearer ' + this.props.auth_keys.access_token },
    //   json: true
    // };

    // use the access token to access the Spotify Web API
    // request.get(options, (error, response, body) => {
    //     if (!error && response.statusCode === 200) {
    //       this.state.authenticated = true;
    //     }
    // });
  // }

  add_to_playlist_broadcast = (value) => {
    this.socket.emit('playlist_add', value);
  }

  add_to_playlist = (value) => {
    console.log('value is ');
    console.log(value);
    this.setState({playlist: this.state.playlist.concat([value])});
  }

  playlist_next_track = () => {
    this.setState({playlist: this.state.playlist.slice(1)});
  }

  render() {
    // if(true) {
      return (
          <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h1 className="App-title">Spotify Jukebox</h1>
            </header>
            <Login/>
            <TransportControls playlist={this.state.playlist} playlist_next_track={this.playlist_next_track} auth_keys={auth_keys}/>
            <Search playlist={this.state.playlist} add_to_playlist={this.add_to_playlist} add_broadcast={this.add_to_playlist_broadcast} auth_keys={auth_keys} />
            <Input playlist={this.add_to_playlist_broadcast.bind(this)}/>
            <ul>{this.state.playlist.map(function(list_item) {
              return <li>{list_item}</li>;
            })}</ul>
          </div>
      );
    // }
    // else {
    //   return (
    //     <div className="App">
    //       <header className="App-header">
    //         <img src={logo} className="App-logo" alt="logo" />
    //         <h1 className="App-title">Spotify Jukebox</h1>
    //       </header>
    //       <Login />
    //     </div>
    //   );
    // }
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
