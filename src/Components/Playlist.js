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

    // current_track.artists is an array (always?), but just displaying the
    // first element
    if(this.props.current_track != null){
      return (
        <div className="footer">
          <h1>Current Track</h1>
          <h3>{this.props.current_track.name}</h3>
          <h4>{this.props.current_track.artists[0].name}</h4>
          <h5>{this.props.current_track.album.name}</h5>
        </div>
      );
    }
    else{
      return(<div className="footer">
        <h1>Current Track</h1>
      </div>
        )
    }
  }
}

export default Playlist;
