import React, { Component } from 'react';

export default class Song extends Component {

  render() {
    return (
      <li>
        <span >{this.props.data.name}</span>
        <span >{this.props.data.author}</span>
        <span >{this.props.data.duration}</span>
      </li>
    );
  }
}