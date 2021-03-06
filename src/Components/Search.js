import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Input from './Input.js';
import SearchResult from './SearchResult.js';
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
      },
      show_results: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  search_for_track(query) {
    let options = {
      url: 'https://api.spotify.com/v1/me/player/devices',
      headers: { 'Authorization': 'Bearer ' + this.props.auth_keys.access_token },
      json: true
    };

    request.get(options, (error, response, body) => {
        let options = {
          url: 'https://api.spotify.com/v1/search' + '/?' + querystring.stringify({"q" : query}) + '&type=album,artist,playlist,track&limit=50',
          headers: { 'Authorization': 'Bearer ' + this.props.auth_keys.access_token },
          json: true,
        };
        request.get(options, (error, response, body) => {
          //console.log('Searching for ' + query + "...");
          //console.log(body)
          this.setState({
            results: {
              artists: body.artists,
              albums : body.albums,
              playlists : body.playlists,
              tracks : body.tracks
            }
          });
          //console.log(this.state.artists.items)
        });
    });

  }

  handleChange(event) {
      this.setState({query: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.search_for_track(this.state.query);
    this.setState({
      query: '',
      show_results: true
    });
  }

  render() {
    return (
      <div id="search">
        <form onSubmit={this.handleSubmit}>
          <label>
            Search:
            <input type="text" value={this.state.query} onChange={this.handleChange} />
          </label>
          <input className="SubmitButton" type="submit" value="Submit" />
        </form>

        {this.state.show_results ?
          <SearchResult
            playlist={this.props.playlist}
            add_to_playlist={this.props.add_to_playlist}
            title="Tracks"
            results={this.state.results.tracks}
            socket={this.props.socket}
          />
        : null}
      </div>
    );
  }
}

export default Search;
