import React, { Component } from 'react';
import { GalleryItem } from './GalleryItem';
import './App.css';

class App extends Component {
  render() {
    const { code } = this.props;
    return (
      <div className="App">
        <GalleryItem
          name="256 colors"
          attribution={{author: "Alex Ciminian"}}
          imgSrc="./frag/256-colors.png"
          code={code}
        />
      </div>
    );
  }
}

export default App;
