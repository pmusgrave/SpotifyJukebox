import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import AuthenticatedApp from './AuthenticatedApp.js';
import Header from './Header.js';

const request = require('browser-request');

class DeviceSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      devices: [],
      selected_device: null
    }
    this.get_user_devices();
  }


  get_user_devices() {
    let options = {
      url: 'https://api.spotify.com/v1/me/player/devices',
      headers: { 'Authorization': 'Bearer ' + this.props.auth_keys.access_token },
      json: true
    };

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          this.setState({
            devices: body.devices
          });
        }
    });
  }

  set_device(device_id) {
    this.setState({selected_device:device_id});
  }

  render() {
    if (this.state.selected_device == null){
      return(
        <div className="App">
          <Header />
          <h3>Select Your Device</h3>
          <table>
            {this.state.devices.map((list_item) => {
              return <tr>
                <td>{list_item["name"]}</td>
                <td><button onClick={this.set_device.bind(this, list_item["id"])}>Use</button></td>
              </tr>
            })}
            <tr>
              <td>I don't want to playback on any devices, just add songs</td>
              <td><button onClick={this.set_device.bind(this, "no_device")}>Use</button></td>
            </tr>
          </table>
        </div>
      )
    }
    else {
      return (<AuthenticatedApp auth_keys={this.props.auth_keys} device={this.state.selected_device}/>);
    }
  }
}

export default DeviceSelector;
