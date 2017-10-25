import React, { Component } from 'react';
import ReactDOM from 'react-dom';
const request = require('browser-request');

class PlayPause extends Component {
  constructor(props) {
    super(props);
    console.log(this.props);
    this.pause_playback = this.pause_playback.bind(this);
  }

  pause_playback() {
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

  render() {
    return (
      <button type="button" onClick={this.pause_playback}>PlayPause</button>
    );
  }
}

export default PlayPause;
