
import React, { Component } from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import logo from './logo.jpg';
import './App.css';
import Playlist from './Components/Playlist.js';
import Parties from './Components/Parties.js';
import Login from './Components/Login.js';
import Search from './Components/Search.js';
import TransportControls from './Components/TransportControls.js';

const request = require('browser-request');

var query_string = require('query-string');

var parsed_hash = query_string.parse(window.location.hash);
var auth_keys = {
  redirect_uri: 'http://psmusgrave.com:80/callback', // Your redirect uri
  stateKey: 'spotify_auth_state',
  access_token: parsed_hash['access_token'],
  refresh_token: parsed_hash['refresh_token']
}

class App extends Component {
  constructor(props) {
      super(props);
      this.state = {
        authenticated: false,
        playlist: [],
        player: {
          is_playing: false,
          paused_by_user: true,
          item: null
        },
        scheduler_interval: 5000,
        timer: null
      };
      this.socket = require('socket.io-client')('http://psmusgrave.com:80/callback');
      this.socket.on('playlist_add', (uri) => {
        console.log('playlist_add ' + uri);
        this.add_to_playlist(uri);
      });

      this.authentication_scheduler();
      this.playlist_scheduler();
      //this.is_authenticated();
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
          this.setState({authenticated: true});
        }
        else {
          this.setState({authenticated: false});
        }
    });
  }

  playlist_scheduler = () => {
    clearTimeout(this.state.timer);

    // emit new room signal without a new room to grab existing rooms
    // from server
    this.socket.emit('new_room', null);

    this.setState(
      {
      timer: setTimeout(() => {
        this.update_playback_state();
        },this.state.scheduler_interval)
      }
    )
  }

  update_playback_state() {
    console.log("Getting playback state... " + this.state.scheduler_interval);

    let options = {
      url: 'https://api.spotify.com/v1/me/player',
      headers: { 'Authorization': 'Bearer ' + auth_keys.access_token },
      json: true
    };

    request.get(options, (error, response, body) => {
      this.setState(
        {
          player: {
            is_playing: body.is_playing,
            paused_by_user: this.state.player.paused_by_user,
            item: body.item
          }
        }
      );

      if(body.item.duration_ms != null && body.item.duration_ms != undefined) {
        this.setState({scheduler_interval: (body.item.duration_ms - body.progress_ms + 1000)});
      }
      else {
        this.setState({scheduler_interval: (5000)});
      }

      if(!this.state.player.paused_by_user && !this.state.player.is_playing) {
        this.play_next_track(this.state.playlist[0]);
        //clearInterval(this.state.scheduler);
      }

      this.playlist_scheduler();
    });
  }

  toggle_playback_state() {
      this.setState({player: {
          is_playing: !this.state.player.is_playing,
          paused_by_user: !this.state.player.paused_by_user
        }
      });
  }

  add_to_playlist = (value) => {
    if (value != null){
      //console.log('value is ' + value);
      this.setState({playlist: this.state.playlist.concat([value])});
    }
  }

  playlist_next_track = () => {
    //console.log('next track');
    this.setState({playlist: this.state.playlist.slice(1)});
    //this.begin_playback();
    //this.toggle_playback_state();
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

      //this.update_playback_state();
      this.playlist_scheduler();
      this.playlist_next_track(); // removes next item from playlist

      //console.log(JSON.stringify({"uris": [track_id]}));
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
              //console.log(response);
              console.log('Next track... ' + track_id);
            });
          }
      });
    }
  }

  render() {
    if(this.state.authenticated) {
      return (
          <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h1 className="App-title">Spotify Jukebox</h1>
            </header>
            <Parties socket={this.socket}/>
            <Search
              playlist={this.state.playlist}
              add_to_playlist={this.add_to_playlist}
              socket={this.socket}
              auth_keys={auth_keys}
            />
            <hr/>
            <TransportControls
              playlist={this.state.playlist}
              playlist_next_track={this.playlist_next_track.bind(this)}
              player={this.state.player}
              begin_playback={this.begin_playback.bind(this)}
              pause_playback={this.pause_playback.bind(this)}
              play_next_track={this.play_next_track.bind(this)}
              toggle_playback_state={this.toggle_playback_state.bind(this)}
              socket={this.socket}
              auth_keys={auth_keys}
            />
            <Playlist current_track={this.state.player.item} playlist={this.state.playlist}/>
          </div>
      );
    }
    else {
      this.set_authenticated_state(); //this is bad
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Spotify Jukebox</h1>
          </header>
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
