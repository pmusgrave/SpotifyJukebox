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
    var styles = {
      overflow:"auto",
      height:"20vh"
    }

    if (this.props.results != undefined && this.props.results.hasOwnProperty('items')) {
      return(
        <div>
          <h2>{this.props.title}</h2>
          <div style={styles}>
            {this.props.results.items.map((list_item) => {
              return <div>
                <label>{list_item["name"]}</label>
                <button onClick={this.queue_item.bind(this,list_item["uri"])}>Add</button>
              </div>
            })}
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
