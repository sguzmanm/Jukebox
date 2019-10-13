import React, { Component } from 'react';
import "./Song.css";
export default class Song extends Component {
  renderState()
  {
    if(this.props.data.state === "reproduced")
    {
      return (<th scope="row">✓</th>)
    }
    else if(this.props.data.state === "playing")
    {
      return (<th scope="row">▷</th>)
    }
    else
    {
      return (<th scope="row">→</th>)
    }
  }
  render() {
    return (
      <tr className={this.props.data.state}>
        {this.renderState()}
        <th>{this.props.id}</th>
        <td>{this.props.data.name}</td>
        <td>{this.props.data.author}</td>
        <td>{this.props.data.duration}</td>
      </tr>
    );
  }
}