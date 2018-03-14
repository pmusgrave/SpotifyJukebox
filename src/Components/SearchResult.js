import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class SearchResult extends Component {
  constructor(props){
    super(props);
    this.state = {
      // current_selection: ''
    }
  };

  queue_item(item) {
    //event.preventDefault();
    console.log('queueueueueuing');
    // this.props.add_to_playlist(item);
    this.props.socket.emit('playlist_add', this.props.socket.id, item);
    // this.setState({current_selection: ''});
  }

  render() {
    // there must be a better way of doing this, but applying the styles
    // in CSS isn't working for some reason
    var styles = {
      overflow:"auto",
      height:"45vh",
      width: "60vw",
      float:"left",
    }

    if (this.props.results != undefined && this.props.results.hasOwnProperty('items')) {
      return(
        <div>
          <hr/>
          <div style={styles}>
            <table>
              <tr>
                <th></th>
                <th>Track</th>
                <th>Artist</th>
                <th>Album</th>
              </tr>
              {this.props.results.items.map((list_item) => {
                return <tr>
                  <td><button onClick={this.queue_item.bind(this,list_item["uri"])}>Add</button></td>
                  <td>{list_item["name"]}</td>
                  <td>{list_item["artists"][0].name}</td>
                  <td>{list_item["album"].name}</td>
                </tr>
              })}
            </table>
          </div>
        </div>
      )
    }
    else {
      // console.log('props')
      // console.log(this.props);
      return(
        //<h2>{this.props.title}</h2>
        null
      )
    }
  }
}

export default SearchResult;
