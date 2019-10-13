import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from "./App";

var querystring = require("query-string");
import "./create.css";
class Create extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chosen: false,
      favoriteTracks: [],
      playlistName: ""
    };
  }

  savePlaylistName = () => {
    this.setState({
      chosen: true
    });
  };

  actualizarNombre = e => {
    this.setState({ playlistName: e.target.value });
  };

  componentDidMount() {
    const parsed = querystring.parse(location.search);
    if (parsed.code === undefined) {
      this.props.history.push("/");
    } else {
      var headers = {
        "Content-Type": "application/x-www-form-urlencoded"
      };

      var details = {
        code: parsed.code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
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
        "postData",
        "https://accounts.spotify.com/api/token",
        headers,
        formBody,
        (error, result) => {
          if (error) {
            this.props.history.push("/");
          } else {
            console.log(result);
            //Se guardan result.data.access_token y result.data.refresh_token

            Meteor.call(
              "getData",
              "https://api.spotify.com/v1/me/top/tracks?limit=16",
              { Authorization: "Bearer " + result.data.access_token },
              (error, result) => {
                if (error) {
                  this.props.history.push("/");
                } else {
                  console.log(result);
                  this.setState({ favoriteTracks: result.data.items });
                }
              }
            );
          }
        }
      );
    }
  }
  firstSong = track => {
    console.log(track);
  };

  _renderCol = track => {
    let audio = new Audio(track.preview_url);
    let pic = "";
    if (
      track.album !== null &&
      track.album.images.length > 0 &&
      track.album.images[0].url !== null
    ) {
      pic = track.album.images[0].url;
    }

    var timeoutId;
    return (
      <div className="col-sm-3 colpic">
        <div
          className="pic mx-auto"
          onClick={() => {
            this.firstSong(track);
          }}
          onMouseLeave={() => {
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            } else {
              audio.pause();
            }
          }}
          onMouseEnter={() => {
            if (!timeoutId) {
              timeoutId = setTimeout(function() {
                timeoutId = null;
                audio.play();
              }, 1000);
            }
          }}
        >
          <div className="row text-center">
            <div className="contImg mx-auto">
              <img src={pic} className="img-fluid" alt={track.name} />
            </div>
          </div>
          <div className="row text-center">
            <div className="lblnameTrack">{track.name}</div>
          </div>
        </div>
      </div>
    );
  };
  _renderRow = row => {
    return (
      <div className="row text-center">
        {this._renderCol(row[0])}
        {this._renderCol(row[1])}
        {this._renderCol(row[2])}
        {this._renderCol(row[3])}
      </div>
    );
  };
  //Input para playlist. Con esta info pedir los mas visualizados.
  render() {
    if (!this.state.chosen) {
      return (
        <div className="hello">
          <div className="row text-center">
            <div className="col-sm-8 mx-auto">
              <h1 className="h1Nombre">Jukebox</h1>
            </div>
          </div>
          <div className="row text-center">
            <div className="col-sm-5 mx-auto">
              <div className="inputCol2">
                <div className="row text-center">
                  <div className="InputLbl">Name the room:</div>
                </div>
                <div className="row text-center">
                  <div className="col-sm-12 mx-auto">
                    <input
                      type="text"
                      className="form-control createInp "
                      value={this.state.playlistName}
                      onChange={this.actualizarNombre.bind(this)}
                    />
                  </div>
                </div>
                <hr className="hrCreate" />
                <div className="row text-center filaJoin">
                  <button
                    type="button"
                    className="btn btn-primary mx-auto btnSavePlaylist"
                    onClick={this.savePlaylistName}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      if (this.state.favoriteTracks.length === 16) {
        return (
          <div className="hello">
            <div className="row text-center">
              <h1 className="filanombre">Select your first track:</h1>
            </div>
            <div className="container">
              {this._renderRow(this.state.favoriteTracks.slice(0, 4))}
              {this._renderRow(this.state.favoriteTracks.slice(4, 8))}
              {this._renderRow(this.state.favoriteTracks.slice(8, 12))}
              {this._renderRow(this.state.favoriteTracks.slice(12, 16))}
            </div>
          </div>
        );
      }
    }
  }
}

export default withRouter(Create);
