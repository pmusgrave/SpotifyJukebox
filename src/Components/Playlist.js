import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class Playlist extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    // showing the entire playlist is for debugging purposes
    // in true jukebox fasion, only the current track should be visible
    // console.log(this.props.current_track);
    if(this.props.current_track != null){
      return (
        <div>
          <h1>Current Track</h1>
          <h3>{this.props.current_track.name}</h3>
          <h4>{this.props.current_track.artists[0].name}</h4>
          <h5>{this.props.current_track.album.name}</h5>
          <h1>Playlist</h1>
          <ul>{this.props.playlist.map(function(list_item) {
            return <li>{list_item}</li>;
          })}</ul>
        </div>
      );
    }
    else{
      return(<h1>Current Track</h1>)
    }
  }
}

export default Playlist;
