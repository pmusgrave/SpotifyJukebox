import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class Playlist extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>Playlist</h1>
        <ul>{this.props.playlist.map(function(list_item) {
          return <li>{list_item}</li>;
        })}</ul>
      </div>
    );
  }
}

export default Playlist;
