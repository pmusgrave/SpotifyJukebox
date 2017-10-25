// this is a really ugly early version and needs to be split up into modules

import React, { Component } from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom'
import logo from './logo.svg';
import './App.css';

const request = require('browser-request');
const query_string = require('query-string');

var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
var stateKey = 'spotify_auth_state';
var parsed_hash = query_string.parse(window.location.hash);
var access_token = parsed_hash['access_token'];
var refresh_token = parsed_hash['refresh_token'];

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
              <TransportControls playlist={this.state.playlist}/>

              <Input playlist={this.add_to_playlist.bind(this)}/>
              <ul>{this.state.playlist.map(function(list_item) {
                return <li>{list_item}</li>;
              })}</ul>
            </div>
        );
    }
}

class Input extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        this.props.playlist(this.state.value);
        this.setState({
            value: '',
        })
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Add To Playlist:
                    <input type="text" value={this.state.value} onChange={this.handleChange} />
                </label>
                <input type="submit" value="Submit" />
            </form>
        );
    }
}

class TransportControls extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props);
    return(
      <div>
        <PlayPause />
        <Next track_id={this.props.playlist[0]}/>
      </div>
    );
  }
}

class PlayPause extends Component {
  constructor() {
    super();
    this.pause_playback = this.pause_playback.bind(this);
  }

  pause_playback() {
    let options = {
      url: 'https://api.spotify.com/v1/me/player/devices',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    // use the access token to access the Spotify Web API
    request.get(options, function(error, response, body) {
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
          headers: { 'Authorization': 'Bearer ' + access_token },
          device_id: device_id
        };
        request.put(options, function(error, response, body) {
          console.log('Pausing...');
        });
    });

  }

  render() {
    return (
      <button type="button" onClick={this.pause_playback}>PlayPause</button>
    );
  }
}

class Next extends Component {
  constructor(props) {
    super(props);
  }

  play_next_track(track_id) {
    console.log(JSON.stringify({"uris": [track_id]}));
    let options = {
      url: 'https://api.spotify.com/v1/me/player/devices',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    request.get(options, function(error, response, body) {
        // get active device before changing playback
        console.log(track_id);
        let num_devices = body.devices.length;
        let device_id = null;
        for (let i = 0; i < num_devices; i++) {
            if (body.devices[i].is_active === true) {
                device_id = body.devices[i].id;
            }
        }
        let options = {
          url: 'https://api.spotify.com/v1/me/player/play',
          headers: { 'Authorization': 'Bearer ' + access_token },
          device_id: device_id,
          json: true,
          body: JSON.stringify({"uris": [track_id]})
        };
        request.put(options, function(error, response, body) {
          console.log(response);
          console.log('Next track... ' + track_id);
        });
    });

  }

  render() {
    return (
      <button type="button" onClick={this.play_next_track.bind(this, this.props.track_id)}>Next</button>
    );
  }
}

class Login extends Component {
  render() {
    return (
      <a href="/login">Login to Spotify</a>
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
