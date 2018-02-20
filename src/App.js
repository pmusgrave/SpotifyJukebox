
import React, { Component } from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import logo from './logo.jpg';
import './App.css';
import Input from './Components/Input.js';
import Login from './Components/Login.js';
import Search from './Components/Search.js';
import TransportControls from './Components/TransportControls.js';

const request = require('browser-request');

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
        player: {
          is_playing: false,
          paused_by_user: true,
          playlist_scheduler: this.playlist_scheduler
        },
        toggle_playback_state: this.toggle_playback_state,
      };
      this.socket = require('socket.io-client')('http://localhost:8888');
      this.socket.on('playlist_add', (uri) => {
        console.log('playlist_add ' + uri);
        this.add_to_playlist(uri);
      });

      this.playlist_scheduler();
      //this.is_authenticated();
  }

  update_playback_state() {
    console.log("Getting playback state...");
    let options = {
      url: 'https://api.spotify.com/v1/me/player',
      headers: { 'Authorization': 'Bearer ' + auth_keys.access_token },
      json: true
    };

    // use the access token to access the Spotify Web API
    request.get(options, (error, response, body) => {
        let options = {
          url: 'https://api.spotify.com/v1/me/player',
          headers: { 'Authorization': 'Bearer ' + auth_keys.access_token },
          json: true
        };
        request.get(options, (error, response, body) => {
          //return body.is_playing;
          this.setState({player: {
            is_playing: body.is_playing,
            paused_by_user: this.state.player.paused_by_user
          }});

          if(!this.state.player.paused_by_user && !this.state.player.is_playing) {
            this.play_next_track(this.state.playlist[0]);
          }

        });
    });
  }

  toggle_playback_state() {
      this.setState({player: {
          is_playing: !this.state.player.is_playing,
          paused_by_user: !this.state.player.paused_by_user
        }
      });
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

  add_to_playlist = (value) => {
    console.log('value is ');
    console.log(value);
    this.setState({playlist: this.state.playlist.concat([value])});
  }

  begin_playback() {
    let options = {
      url: 'https://api.spotify.com/v1/me/player/devices',
      headers: { 'Authorization': 'Bearer ' + auth_keys.access_token },
      json: true
    };

    // use the access token to access the Spotify Web API
    request.get(options, (error, response, body) => {
        // get active device before changing playback
        let num_devices = body.devices.length;
        let device_id = null;
        for (let i = 0; i < num_devices; i++) {
            if (body.devices[i].is_active === true) {
                device_id = body.devices[i].id;
            }
        }
        let options = {
          url: 'https://api.spotify.com/v1/me/player/play',
          headers: { 'Authorization': 'Bearer ' + auth_keys.access_token },
          device_id: device_id,
          body: ''
        };
        request.put(options, function(error, response, body) {

          console.log('Playing...');
        });
    });
  }

  pause_playback() {
    this.setState({player:{
      is_playing: false,
      paused_by_user: true
    }})
    let options = {
      url: 'https://api.spotify.com/v1/me/player/devices',
      headers: { 'Authorization': 'Bearer ' + auth_keys.access_token },
      json: true
    };

    // use the access token to access the Spotify Web API
    request.get(options, (error, response, body) => {
        // get active device before changing playback
        let num_devices = body.devices.length;
        let device_id = null;
        for (let i = 0; i < num_devices; i++) {
            if (body.devices[i].is_active === true) {
                device_id = body.devices[i].id;
            }
        }
        let options = {
          url: 'https://api.spotify.com/v1/me/player/pause',
          headers: { 'Authorization': 'Bearer ' + auth_keys.access_token },
          device_id: device_id
        };
        request.put(options, function(error, response, body) {
          console.log('Pausing...');
        });
    });
  }

  play_next_track(track_id) {
    if(track_id != null) {
      this.setState({player: {
          is_playing: true,
          paused_by_user: false,
        }
      })

      this.playlist_next_track(); // removes next item from playlist

      console.log(JSON.stringify({"uris": [track_id]}));
      let options = {
        url: 'https://api.spotify.com/v1/me/player/devices',
        headers: { 'Authorization': 'Bearer ' + auth_keys.access_token },
        json: true
      };

      request.get(options, (error, response, body) => {
          // get active device before changing playback
          if(body.devices != undefined){
            let num_devices = body.devices.length;
            let device_id = null;
            for (let i = 0; i < num_devices; i++) {
                if (body.devices[i].is_active === true) {
                    device_id = body.devices[i].id;
                }
            }
            let options = {
              url: 'https://api.spotify.com/v1/me/player/play',
              headers: { 'Authorization': 'Bearer ' + auth_keys.access_token },
              device_id: device_id,
              json: true,
              body: JSON.stringify({"uris": [track_id]})
            };
            request.put(options, function(error, response, body) {
              console.log(response);
              console.log('Next track... ' + track_id);
            });
          }
      });
    }
  }

  playlist_next_track = () => {
    console.log('next track');
    this.setState({playlist: this.state.playlist.slice(1)});
    //this.begin_playback();
    //this.toggle_playback_state();
  }

  playlist_scheduler = () => {
    setInterval(() => {
      this.update_playback_state();
    },3500)
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
            <TransportControls
              playlist={this.state.playlist}
              playlist_next_track={this.playlist_next_track.bind(this)}
              player={this.state.player}
              begin_playback={this.begin_playback.bind(this)}
              pause_playback={this.pause_playback.bind(this)}
              play_next_track={this.play_next_track.bind(this)}
              toggle_playback_state={this.state.toggle_playback_state.bind(this)}
              socket={this.socket}
              auth_keys={auth_keys}
            />
            <Search
              playlist={this.state.playlist}
              add_to_playlist={this.add_to_playlist}
              socket={this.socket}
              auth_keys={auth_keys}
            />
            <h1>Playlist</h1>
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
