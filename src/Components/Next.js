import React, { Component } from 'react';
import ReactDOM from 'react-dom';
const request = require('browser-request');

class Next extends Component {
  constructor(props) {
    super(props);

    this.props.socket.on('next_track', (track_id) => {
      this.props.play_next_track(track_id);
    })

  }

  handle_next_click = (track_id) => {
    console.log(this.props.socket.id)
    this.props.socket.emit('next_track', this.props.socket.id, track_id);
  }

  render() {
    return (
      <button id="NextButton" type="button" onClick={this.handle_next_click.bind(this, this.props.track_id)}></button>
    );
  }
}

export default Next;
