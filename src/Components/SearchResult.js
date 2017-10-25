import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class SearchResult extends Component {
  constructor(props){
    super(props);
    this.state = {
      current_selection: '';
    }
  };
  
  queue_item(item) {
    //event.preventDefault();
    console.log('queueueueueuing');
    this.props.add_to_playlist(item);
    this.setState({current_selection: ''});
  }

  render(
    <div>
      <h2>{this.props.title}</h2>
      {this.props.results.map(function(list_item) {
        return <div onMouseOver={this.setState({current_selection: list_item["uri"]})}>
          {list_item["uri"]}
          <button type="button" onClick={this.queue_item.bind(this, this.state.current_selection)}>PlayPause</button>
        </div>;
      })}
      
    </div>  
  );
}

export default SearchResult;
