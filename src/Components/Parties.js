import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class Parties extends Component {
  constructor(props){
    super(props);
    this.state = {
      room_name: '',
      rooms: [],
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.props.socket.on('updated_room_list', (rooms) => {
      this.setState({rooms: rooms});
    });
  }

  handleChange(event) {
    this.setState({room_name: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.socket.emit('new_room', this.state.room_name);
    //this.join_room(this.state.room_name);
    this.setState({
      room_name: '',
    });
    console.log(this.state.rooms);
  }

  join_room(room) {
    console.log("let me in");
    this.props.socket.emit('try_to_join_room', this.props.socket.id,room);
  }

  render() {
    if (this.state.rooms != undefined) {
      return(
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            Add a new party:
            <input type="text" value={this.state.room_name} onChange={this.handleChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>

        <ul>{this.state.rooms.map((list_item) => {
          return <div>
            <li>{list_item.name}</li>
            <button onClick={this.join_room.bind(this,list_item.name)}>Join</button>
          </div>
        })}</ul>
      </div>
      )
    }
    else {
      return(
        <div>
          <form onSubmit={this.handleSubmit}>
            <label>
              Add a new party:
              <input type="text" value={this.state.room_name} onChange={this.handleChange} />
            </label>
            <input type="submit" value="Submit" />
          </form>
        </div>
      )
    }
  }
}

export default Parties;
