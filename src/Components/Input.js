import React, { Component } from 'react';
import ReactDOM from 'react-dom';

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
      console.log("stuff happening");
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

export default Input;
