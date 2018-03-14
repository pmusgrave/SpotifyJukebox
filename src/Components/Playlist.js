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
    if(this.props.playlist.length != 0){
      return (
        <div id="playlist">
          <h1>Playlist</h1>
          {this.props.playlist.map((list_item) => {
            return <div>
              <label> {list_item}</label>
            </div>
          })}
        </div>
      );
    }
    else{
      return(<div id="playlist">
        <h1></h1>
      </div>
      )
    }
  }
}

export default Playlist;
