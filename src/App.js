import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'
import logo from './logo.jpg';
import './App.css';
import AuthenticatedApp from './Components/AuthenticatedApp.js';
import DeviceSelector from './Components/DeviceSelector.js';
import Header from './Components/Header.js';
import LandingPage from './Components/LandingPage.js';
import Login from './Components/Login.js';


const request = require('browser-request');

class App extends Component {
  constructor() {
    super();
    this.state = {
      authenticated: false,
      product: '',
    }
  }

  componentDidMount() {
    let params = new URLSearchParams(window.location.search);
    let parsed_params = {};
    params.forEach((value, key) => {
      parsed_params[key] = value;
    });
    if (parsed_params['error'] === undefined && parsed_params['code'] !== undefined) {
      this.setState({ authorization: parsed_params});
      this.get_token(parsed_params);
    }
  }

  get_token(params) {
    let options = {
      url: 'http://localhost:3000/callback',
      method: 'POST',
      json: true,
      headers: params,
    };

    request(options, (err,res,body) => {
      if (body.access_token !== undefined && body.refresh_token !== undefined) {
        this.setState({
          access_token: body.access_token,
          refresh_token: body.refresh_token,
          authenticated: true,
        });
      }
    });
  }

  render() {
    if (this.state.authenticated) {
      return (
        <Router>
          <Route exact path='/' component={AuthenticatedApp} />
        </Router>
      );
    } else {
      return (
        <Router>
          <Route exact path='/' component={LandingPage} />
        </Router>
      );
    }
  }
}

// function refresh_token() {
//
//   // requesting access token from refresh token
//   var refresh_token = req.query.refresh_token;
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
//     form: {
//       grant_type: 'refresh_token',
//       refresh_token: refresh_token
//     },
//     json: true
//   };
//
//   request.post(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {
//       var access_token = body.access_token;
//       res.send({
//         'access_token': access_token
//       });
//     }
//   });
// }


export default App;
