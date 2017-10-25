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
        <Next auth_keys={this.props.auth_keys} track_id={this.props.playlist[0]}/>
      </div>
    );
  }
}

export default TransportControls;
