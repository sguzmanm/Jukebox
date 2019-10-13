import React, { Component } from "react";
import { Meteor } from 'meteor/meteor';
import { withTracker } from "meteor/react-meteor-data";
import Rooms from "../api/rooms";
import { withRouter } from "react-router-dom";
import Song from './Song.jsx';
import "./Room.css";

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
           id={keys}
           data={actual}
          />
        );
      });
    }
  }

  sendRoom () {
    let song = {
      name:"Marinela",
      author:"Ska-p",
      duration:"4:25",
      state:"comming"
    }
    let room = {
      name : "La playlist aleta",
      owner: "nicolas3746",
      songs: [song],
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
  renderRoomDescription = () =>{
    let rooms = this.props.room;
    let keys = 0;
    if(rooms.length != 0)
    {
      let current_datetime = rooms[0].createdAt
      let formatted_date = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear()
      console.log(formatted_date)
      return(
        <div>
          <h5>Jukebox</h5>
          <h1 className="title">{rooms[0].name}</h1>
          <h5><label id="create">Created by: &nbsp;</label>{rooms[0].owner}&nbsp;<label id="create">on &nbsp;</label>{formatted_date}</h5>
          <h5><label id="create">Room id: &nbsp;</label>{this.state.id}</h5>
        </div>
      )
    }
    else{
      return(
        <h1>No existe un room asociado a: {this.state.id}</h1>
      )
    }
  }
  render() {
    return (
      <div className="room row">
        <div class="col-sm-4">
          <h1>Search Bar</h1>
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
        <div className="list col-sm-7">
          {this.renderRoomDescription()}
          <table className="table">
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">#</th>
                <th scope="col">Title</th>
                <th scope="col">Author</th>
                <th scope="col">Duration</th>
              </tr>
            </thead>
            <tbody>
              {this.renderSongs()}
            </tbody>
          </table>
        </div>
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
