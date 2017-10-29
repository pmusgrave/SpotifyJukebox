import React, { Component } from 'react';
import ReactDOM from 'react-dom';
const request = require('browser-request');

class Next extends Component {
  constructor(props) {
    super(props);

    this.props.socket.on('next_track', (track_id) => {
      this.play_next_track(track_id);
    })

  }

  handle_next_click = (track_id) => {
    this.props.socket.emit('next_track', track_id);
  }

  play_next_track(track_id) {
    this.props.playlist_next_track(); // removes next item from playlist
    console.log(JSON.stringify({"uris": [track_id]}));
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
            console.log(response);
            console.log('Next track... ' + track_id);
          });
        }
    });
  }

  render() {
    return (
      <button type="button" onClick={this.handle_next_click.bind(this, this.props.track_id)}>Next</button>
    );
  }
}

export default Next;
