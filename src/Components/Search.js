import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Input from './Input.js';
const request = require('browser-request');
const querystring = require('querystring');

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      results: {
        artists : {},
        albums : {},
        playlists : {},
        tracks : {}
      }
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  search_for_track(query) {
    // console.log(JSON.stringify({"uris": [track_id]}));
    let options = {
      url: 'https://api.spotify.com/v1/me/player/devices',
      headers: { 'Authorization': 'Bearer ' + this.props.auth_keys.access_token },
      json: true
    };

    request.get(options, (error, response, body) => {
        // get active device before changing playback
        // let num_devices = body.devices.length;
        // let device_id = null;
        // for (let i = 0; i < num_devices; i++) {
        //     if (body.devices[i].is_active === true) {
        //         device_id = body.devices[i].id;
        //     }
        // }
        let options = {
          url: 'https://api.spotify.com/v1/search' + '/?' + querystring.stringify({"q" : query}) + '&type=album,artist,playlist,track',
          headers: { 'Authorization': 'Bearer ' + this.props.auth_keys.access_token },
          json: true,
        };
        request.get(options, (error, response, body) => {
          console.log('Searching for ' + query + "...");
          console.log(body)
          this.setState({
            artists: body.artists,
            albums : body.albums,
            playlists : body.playlists,
            tracks : body.tracks
          });
        });
    });

  }

  handleChange(event) {
      this.setState({query: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.search_for_track(this.state.query);
    this.setState({query: ''});
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            Search:
            <input type="text" value={this.state.value} onChange={this.handleChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>

        <div>
          <h2>Artists</h2>
          <ul>
            {this.state.results.artists.map(function(list_item) {
              return <li>{list_item["uri"]}</li>;
            })}
          </ul>
        </div>  

        <div>
          <h2>Albums</h2>
          <ul>
            {this.state.results.albums.map(function(list_item) {
              return <li>{list_item["uri"]}</li>;
            })}
          </ul>
        </div>  

        <div>
          <h2>Tracks</h2>
          <ul>
            {this.state.results.tracks.map(function(list_item) {
              return <li>{list_item["uri"]}</li>;
            })}
          </ul>
        </div>  

        <div>
          <h2>Playlists</h2>
          <ul>
            {this.state.results.playlists.map(function(list_item) {
              return <li>{list_item["uri"]}</li>;
            })}
          </ul>
        </div>  
      </div>
    );
  }
}

export default Search;
