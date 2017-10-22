import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            playlist: [],
        };
    }

    add_to_playlist = (value) => {
        this.setState({playlist: this.state.playlist.concat([value])});
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Welcome to React</h1>
                </header>

                <TransportControls />

                <Input playlist={this.add_to_playlist.bind(this)}/>
                <ul>{this.state.playlist.map(function(list_item) {
                    return <li>{list_item}</li>;
                })}</ul>
            </div>
        );
    }
}

class Input extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        this.props.playlist(this.state.value);
        this.setState({
            value: '',
        })
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Add To Playlist:
                    <input type="text" value={this.state.value} onChange={this.handleChange} />
                </label>
                <input type="submit" value="Submit" />
            </form>
        );
    }
}

class TransportControls extends Component {
    render() {
        return(
            <div>
                <Previous />
                <PlayPause />
                <Next />
            </div>
        );
    }
}

class PlayPause extends Component {
    render() {
        return (
            <button type="button">PlayPause</button>
        );
    }
}

class Previous extends Component {
    render() {
        return(
            <button type="button">Previous</button>
        );
    }

}

class Next extends Component {
    render() {
        return (
                <button type="button">Next</button>
        );
    }
}

export default App;
