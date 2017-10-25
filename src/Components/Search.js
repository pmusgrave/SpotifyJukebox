import React, { Component } from 'react';
import ReactDOM from 'react-dom';
const request = require('browser-request');
const querystring = require('querystring');

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      artists : {},
      albums : {},
      playlists : {},
      tracks : {}
    };
  }

  search_for_track(query) {
    console.log(JSON.stringify({"uris": [track_id]}));
    let options = {
      url: 'https://api.spotify.com/v1/me/player/devices',
      headers: { 'Authorization': 'Bearer ' + this.props.auth_keys.access_token },
      json: true
    };

    request.get(options, (error, response, body) => {
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
          url: 'https://api.spotify.com/v1/search',
          headers: { 'Authorization': 'Bearer ' + this.props.auth_keys.access_token },
          device_id: device_id,
          json: true,
          body: querystring.stringify("q=" + query),
          type: album, artist, playlist, track
        };
        request.get(options, function(error, response, body) {
          console.log('Searching... ' + track_id);
          this.setState({
            artists: body.artists,
            albums : body.albums,
            playlists : body.playlists,
            tracks : body.tracks
          });
        });
    });

  }

  render() {
    return (
      <div>
        <form></form>
        <div></div>
      </div>
    );
  }
}

export default Search;
