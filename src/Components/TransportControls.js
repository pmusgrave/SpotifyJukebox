import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Next from './Next.js';
import PlayPause from './PlayPause.js';

class TransportControls extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props);
    return(
      <div>
        <PlayPause auth_keys={this.props.auth_keys} />
        <Next
          playlist_next_track={this.props.playlist_next_track}
          auth_keys={this.props.auth_keys}
          track_id={this.props.playlist[0]}
          socket={this.props.socket}
        />
      </div>
    );
  }
}

export default TransportControls;
