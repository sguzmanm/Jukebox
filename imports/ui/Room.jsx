import React, { Component } from "react";
import { Meteor } from 'meteor/meteor';
import { withTracker } from "meteor/react-meteor-data";
import Rooms from "../api/rooms";
import { withRouter } from "react-router-dom";
import Song from './Song.jsx';

class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.match.params.id
    };
  }

  renderSongs() {
    let filteredSongs = this.props.room;
    let keys = 0;
    if(filteredSongs.length != 0)
    {
      return filteredSongs[0].songs.map((actual) => {
        keys+=1
        return (
          <Song
           key={keys}
           data={actual}
          />
        );
      });
    }
  }

  sendRoom () {
    let room = {
      name : "La playlist aleta",
      owner: "nicolas3746",
      tokenA: "asnfdjasnfosaf",
      tokenB: "dfsafagfafqefef"
    }
    Meteor.call('rooms.insert', room, (error,result) => {console.log(result)});
  }

  addSong = () => {
    let song = {
      name:"Marinela",
      author:"Ska-p",
      duration:"4:25",
      state:"comming"
    }
    let roomId = this.state.id
    Meteor.call('rooms.addSong',roomId, song);
  }
  render() {
    return (
      <div>
        <h2>Learn Meteor!{this.state.id}</h2>
        {this.renderSongs()}
        <button
          className="btn btn-primary mx-auto"
          onClick={this.sendRoom}
        >
          Create Room
        </button>
        <button
          className="btn btn-primary mx-auto"
          onClick={this.addSong}
        >
          Add Song
        </button>
      </div>
    );
  }
}

export default Room = withRouter(
  withTracker( props => {
    Meteor.subscribe('rooms');

    return {
      room: Rooms.find({ _id: props.match.params.id }).fetch()
    };
  })(Room)
);
