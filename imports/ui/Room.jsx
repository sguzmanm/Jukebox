import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import Autosuggest from "react-autosuggest";
import { withRouter } from "react-router-dom";

import { CLIENT_ID, CLIENT_SECRET } from "./App";
import Rooms from "../api/rooms";
import Song from "./Song.jsx";
import "./Room.css";
import NotFound from "./NotFound.jsx";

class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.match.params.id,
      render: false,
      value: "",
      suggestions: []
    };
    this.lastRequestId = null;
  }
  componentDidMount() {
    //Se espera medio segundo para renderizar
    setTimeout(
      function() {
        this.setState({ render: true });
        this.checkPlaylist();
      }.bind(this),
      500
    );
  }

  renderSongs() {
    let filteredSongs = this.props.room;
    let keys = 0;
    if (filteredSongs.length != 0) {
      // sguzmanm: You can get the index by using songs.map((actual,index)=>{})
      return filteredSongs[0].songs.map(actual => {
        keys += 1;
        return <Song key={keys} id={keys} data={actual} />;
      });
    }
  }

  renderRoomDescription = () => {
    let rooms = this.props.room;
    if (rooms.length != 0) {
      let current_datetime = rooms[0].createdAt;
      let formatted_date =
        current_datetime.getDate() +
        "-" +
        (current_datetime.getMonth() + 1) +
        "-" +
        current_datetime.getFullYear();
      return (
        <div>
          <h5>Jukebox</h5>
          <h1 className="title">{rooms[0].name}</h1>
          <h5>
            <label id="create">Created by: &nbsp;</label>
            {rooms[0].owner}&nbsp;<label id="create">on &nbsp;</label>
            {formatted_date}
          </h5>
          <h5>
            <label id="create">Room id: &nbsp;</label>
            {this.state.id}
          </h5>
        </div>
      );
    }
  };

  checkPlaylist = () => {
    let rooms = this.props.room;
    // sguzmanm: You can make an early return here
    if (rooms.length != 0) {
      let room = rooms[0];
      Meteor.call(
        "getData",
        "https://api.spotify.com/v1/playlists/" +
          room.playlistId +
          "/followers/contains?ids=" +
          room.owner,
        { Authorization: "Bearer " + room.access_token },
        (error, result) => {
          if (error) {
            this.refreshToken(this.checkPlaylist);
          } else {
            if (result.data[0] === false) {
              Meteor.call("rooms.delete", rooms[0].roomId);
              this.setState({ render: true });
            }
          }
        }
      );
    }
  };

  addSong = track => {
    let room = this.props.room[0];
    Meteor.call(
      "postData",
      "https://api.spotify.com/v1/playlists/" + room.playlistId + "/tracks",
      {
        "Content-Type": "application/json",
        Authorization: "Bearer " + room.access_token
      },
      {
        uris: [track.uri]
      },
      (error, result) => {
        if (error) {
          this.refreshToken(() => {
            this.addSong(track);
          });
        } else if (result !== undefined) {
          let minutes = Math.trunc(track.duration_ms / 1000 / 60);
          let seconds = Math.trunc((track.duration_ms / 1000) % 60);
          let authors = "";
          for (const index in track.artists) {
            authors = authors + track.artists[index].name;
            if (index != track.artists.length - 1) {
              authors = authors + ", ";
            }
          }
          let song = {
            name: track.name,
            author: authors,
            duration: minutes + ":" + seconds,
            state: "comming"
          };
          Meteor.call("rooms.addSong", room.roomId, song);
          this.setState({ value: "" });
        }
      }
    );
  };

  onSuggestionSelected = (event, { suggestion }) => {
    let rooms = this.props.room;
    this.checkPlaylist();
    if (rooms.length != 0) {
      this.addSong(suggestion);
    }
  };

  refreshToken = callBack => {
    let rooms = this.props.room;
    // sguzmanm: You can make an early return here
    if (rooms.length != 0) {
      let refresh_token = rooms[0].refresh_token;
      var headers = {
        "Content-Type": "application/x-www-form-urlencoded"
      };
      var details = {
        grant_type: "refresh_token",
        refresh_token: refresh_token,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      };
      var formBody = [];
      for (var property in details) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
      formBody = formBody.join("&");

      Meteor.call(
        "postContent",
        "https://accounts.spotify.com/api/token",
        headers,
        formBody,
        (error, result) => {
          if (error) {
            console.error(error);
          } else {
            Meteor.call(
              "rooms.updateAccess",
              rooms[0]._id,
              result.data.access_token
            );
            callBack();
          }
        }
      );
    }
  };

  loadSuggestions(value) {
    // Cancel the previous request
    if (this.lastRequestId !== null) {
      clearTimeout(this.lastRequestId);
    }

    this.setState({
      isLoading: true
    });

    // Fake request
    this.lastRequestId = setTimeout(() => {
      let rooms = this.props.room;
      if (rooms.length != 0 && value !== "") {
        let access_token = rooms[0].access_token;
        Meteor.call(
          "getData",
          "https://api.spotify.com/v1/search?q=" +
            value.replace(" ", "+") +
            "&type=track&market=from_token&limit=5",
          { Authorization: "Bearer " + access_token },
          (error, result) => {
            if (error) {
              this.refreshToken(() => {
                this.loadSuggestions(value);
              });
            } else {
              this.setState({
                isLoading: false,
                suggestions: result.data.tracks.items
              });
            }
          }
        );
      }
    }, 1000);
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.loadSuggestions(value);
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  // sguzmanm: I suggest you name this differently, the underscore is confusing rather than differentiating from the react render method
  _render = () => {
    const { value, suggestions, isLoading } = this.state;
    const inputProps = {
      placeholder: "Search a track",
      value,
      onChange: this.onChange,
      autoFocus: true
    };
    const status = isLoading ? "Loading..." : "Type to load suggestions";

    if (this.props.room === undefined || this.props.room.length === 0) {
      return <NotFound />;
    }
    return (
      <div className="room row">
        <div className="col-sm-4">
          <div className="status">
            <strong>Status:</strong> {status}
          </div>
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
            onSuggestionSelected={this.onSuggestionSelected}
          />
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
            <tbody>{this.renderSongs()}</tbody>
          </table>
        </div>
      </div>
    );
  };
  render() {
    let renderContainer = false;
    if (this.state.render) {
      renderContainer = this._render();
    }
    return renderContainer;
  }
}

export default Room = withRouter(
  withTracker(props => {
    Meteor.subscribe("rooms");
    return {
      room: Rooms.find({ roomId: props.match.params.id }).fetch()
    };
  })(Room)
);

function getSuggestionValue(suggestion) {
  return suggestion.name;
}

function renderSuggestion(suggestion) {
  return <span>{suggestion.name}</span>;
}
