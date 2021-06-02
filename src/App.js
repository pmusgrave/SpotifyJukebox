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
      this.get_access_token(parsed_params);
    }
  }

  get_access_token(params) {
    let options = {
      url: `${process.env.REACT_APP_HOST_URL}/access_token`,
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
        this.schedule_token_refresh();
      }
    });
  }

  get_refresh_token() {
    let options = {
      url: `${process.env.REACT_APP_HOST_URL}/refresh_token`,
      method: 'POST',
      json: true,
      headers: {
        refresh_token: this.state.refresh_token,
      },
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

  schedule_token_refresh() {
    setInterval(this.get_refresh_token.bind(this), 600000);
  }

  render() {
    if (this.state.authenticated) {
      return (
        <Router>
          <Route exact path='/'
          render={(props) => <AuthenticatedApp {...props} 
            auth_keys={{access_token:this.state.access_token, refresh_token: this.state.refresh_token }} />}
          />
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

export default App;
