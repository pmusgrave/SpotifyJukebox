import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class SearchResult extends Component {
  constructor(props){
    super(props);
    this.state = {
      current_selection: ''
    }
  };

  queue_item(item) {
    //event.preventDefault();
    console.log('queueueueueuing');
    this.props.add_to_playlist(item);
    this.setState({current_selection: ''});
  }

  render() {
    if (this.props.results.hasOwnProperty('items')) {
      return(
        <div>
          <h2>{this.props.title}</h2>

          <ul>
            {this.props.results.items.map(function(list_item) {

              return <li>{list_item["uri"]}</li>

            })}
          </ul>


        </div>
      )
    }
    else {
      // console.log('props')
      // console.log(this.props);
      return(
        <h2>{this.props.title}</h2>
      )
    }
  }
}

export default SearchResult;
