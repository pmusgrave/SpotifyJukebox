import React, { Component } from 'react';
import ReactDOM from 'react-dom';
const request = require('browser-request');

class PlayPause extends Component {
  constructor(props) {
    super(props);
    //console.log(this.props);
    //this.pause_playback = this.pause_playback.bind(this);
    //this.begin_playback = this.begin_playback.bind(this);
    this.handle_click = this.handle_click.bind(this);
  }

  handle_click() {
    let options = {
      url: 'https://api.spotify.com/v1/me/player',
      headers: { 'Authorization': 'Bearer ' + this.props.auth_keys.access_token },
      json: true
    };

    // use the access token to access the Spotify Web API
    request.get(options, (error, response, body) => {
        let options = {
          url: 'https://api.spotify.com/v1/me/player',
          headers: { 'Authorization': 'Bearer ' + this.props.auth_keys.access_token },
          json: true
        };
        request.get(options, (error, response, body) => {
          //return body.is_playing;
          if(body.is_playing) {
            this.props.toggle_playback_state();
            this.props.pause_playback();
          }
          else {
            this.props.toggle_playback_state();
            this.props.begin_playback();
          }
        });
    });
  }



  render() {
    return (
      <button id="PlayPauseButton" type="button" onClick={this.handle_click}></button>
    );
  }
}

export default PlayPause;
