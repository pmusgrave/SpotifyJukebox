import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import logo from '../logo.jpg';
import Parties from './Parties.js';
import Search from './Search.js';
import TransportControls from './TransportControls.js';
import Playlist from './Playlist.js';

const request = require('browser-request');

class AuthenticatedApp extends Component {
  constructor(props) {
      super(props);
      this.state = {
        room_name: null,
        playlist: [],
        player: {
          is_playing: false,
          paused_by_user: true,
          item: null
        },
        scheduler_interval: 5000,
        timer: null
      };
      // this.socket = require('socket.io-client')('http://psmusgrave.com:80');
      this.socket = require('socket.io-client')('http://localhost:8888');

      this.socket.on('you_are_in', (client, room_name) => {
        if (client === this.socket.id) {
          this.setState({room_name:room_name});
        }
      });

      this.socket.on('playlist_add', (room, playlist) => {
        console.log('playlist_add ' + playlist);
        //this.add_to_playlist(uri);
        this.setState({playlist:playlist});
      });

      this.playlist_scheduler();
  }


  playlist_scheduler = () => {
    console.log(this.state.player);
    console.log(this.state.scheduler_interval);
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
      headers: { 'Authorization': 'Bearer ' + this.props.auth_keys.access_token },
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
        if(body.is_playing){
          this.setState({scheduler_interval: (body.item.duration_ms - body.progress_ms + 1000)});
        }
        else {
          this.setState({scheduler_interval: (5000)});
        }
      }
      else {
        this.setState({scheduler_interval: (5000)});
      }


      if(!this.state.player.paused_by_user && !this.state.player.is_playing) {
        // this.play_next_track(this.state.playlist[0]);
        this.socket.emit("next_track", this.socket.id, this.state.playlist[0]);
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
    console.log('value is ' + value);
    if (value != null){
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
      headers: { 'Authorization': 'Bearer ' + this.props.auth_keys.access_token },
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
          headers: { 'Authorization': 'Bearer ' + this.props.auth_keys.access_token },
          device_id: device_id,
          body: ''
        };
        request.put(options, function(error, response, body) {
          this.playlist_scheduler();
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
      headers: { 'Authorization': 'Bearer ' + this.props.auth_keys.access_token },
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
          headers: { 'Authorization': 'Bearer ' + this.props.auth_keys.access_token },
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
        headers: { 'Authorization': 'Bearer ' + this.props.auth_keys.access_token },
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
              headers: { 'Authorization': 'Bearer ' + this.props.auth_keys.access_token },
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

  handle_room_click() {
    this.setState({room_name:null});
    this.socket.emit('new_room', null); // emitting null room will refresh the room list
  }

  render() {
    if(this.state.room_name === null){
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Spotify Jukebox</h1>
          </header>
          <div>
            <Parties socket={this.socket}/>
          </div>
        </div>
      );
    }
    else {
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Spotify Jukebox</h1>
          </header>
          <div>
            <h3>Current Room: {this.state.room_name}</h3>

            <button type="button" onClick={this.handle_room_click.bind(this)}>Change Rooms</button>
            <Search
              playlist={this.state.playlist}
              add_to_playlist={this.add_to_playlist}
              socket={this.socket}
              auth_keys={this.props.auth_keys}
            />
            <TransportControls
              playlist={this.state.playlist}
              playlist_next_track={this.playlist_next_track.bind(this)}
              player={this.state.player}
              begin_playback={this.begin_playback.bind(this)}
              pause_playback={this.pause_playback.bind(this)}
              play_next_track={this.play_next_track.bind(this)}
              toggle_playback_state={this.toggle_playback_state.bind(this)}
              socket={this.socket}
              auth_keys={this.props.auth_keys}
            />
            <Playlist current_track={this.state.player.item} playlist={this.state.playlist}/>
          </div>
        </div>
      );
    }
  }
}

export default AuthenticatedApp;
