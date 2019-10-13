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
      playlistName: "",
      refresh_token: null,
      access_token: null,
      user: "",
      newRoom: false,
      newRoomId: ""
    };
  }

  copyToClipboard = e => {
    this.textArea.select();
    document.execCommand("copy");
    setTimeout(e.target.focus(), 500);
  };

  savePlaylistName = () => {
    if (this.state.playlistName != "") {
      this.setState({
        chosen: true
      });
    }
  };

  getRoomLink = () => {
    if (this.state.newRoomId != "") {
      return "http://localhost:3000/rooms/" + this.state.newRoomId;
    }
  };

  goToRoom = () => {
    window.location.href = this.getRoomLink();
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
        "postContent",
        "https://accounts.spotify.com/api/token",
        headers,
        formBody,
        (error, result) => {
          if (error) {
            this.props.history.push("/");
          } else {
            this.setState({
              access_token: result.data.access_token,
              refresh_token: result.data.refresh_token
            });
            Meteor.call(
              "getData",
              "https://api.spotify.com/v1/me",
              { Authorization: "Bearer " + result.data.access_token },
              (error, result) => {
                if (error) {
                  this.props.history.push("/");
                } else {
                  this.setState({ user: result.data.id });
                }
              }
            );

            Meteor.call(
              "getData",
              "https://api.spotify.com/v1/me/top/tracks?limit=16",
              { Authorization: "Bearer " + result.data.access_token },
              (error, result) => {
                if (error) {
                  this.props.history.push("/");
                } else {
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
    if (this.state.access_token !== null && this.state.user != "") {
      Meteor.call(
        "postData",
        "https://api.spotify.com/v1/users/" + this.state.user + "/playlists",
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.state.access_token
        },
        {
          name: this.state.playlistName,
          description: "A Jukebox room",
          public: false
        },
        (error, result) => {
          if (error) {
            this.props.history.push("/");
          } else {
            Meteor.call(
              "postData",
              "https://api.spotify.com/v1/playlists/" +
                result.data.id +
                "/tracks",
              {
                "Content-Type": "application/json",
                Authorization: "Bearer " + this.state.access_token
              },
              {
                uris: [track.uri]
              },
              (error, result) => {
                if (error) {
                  this.props.history.push("/");
                } else {
                  id = generateRandomString(6);
                  this.setState({ newRoom: true, newRoomId: id });
                  //Aqui se hace el resto de meteor
                }
              }
            );
          }
        }
      );
    }
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
    if (!this.state.newRoom) {
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
                    {document.queryCommandSupported("copy") && (
                      <button
                        type="button"
                        className="btn btn-primary mx-auto btnSavePlaylist"
                        onClick={this.savePlaylistName}
                      >
                        Create
                      </button>
                    )}
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
    } else {
      return (
        <div className="hello">
          <div className="row text-center">
            <div className="col-sm-8 mx-auto">
              <h1 className="h1Nombre">Jukebox</h1>
            </div>
          </div>
          <div className="row text-center">
            <div className="col-sm-5 mx-auto">
              <div className="inputCol2 rmS">
                <div className="row text-center">
                  <div className="InputLbl">Room Created Succesfully!</div>
                </div>
              </div>
            </div>
          </div>
          <div className="row text-center">
            <div className="col-sm-8 text-center mx-auto">
              <div className="row text-center">
                <div className="mx-auto my-auto">
                  <textarea
                    ref={textarea => (this.textArea = textarea)}
                    className="createInp lblTxtArea"
                    rows="1"
                    cols={this.getRoomLink().length}
                    value={this.getRoomLink()}
                    readOnly
                  />
                  <button
                    className="copyText"
                    onClick={this.copyToClipboard.bind(this)}
                  >
                    <i className="far fa-copy"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="row text-center">
            <div className="col-sm-12 mx-auto">
              <div className="row text-center mx-auto">
                <button
                  type="button"
                  className="btn btn-primary mx-auto btnSavePlaylist"
                  onClick={this.goToRoom}
                >
                  Go to the room
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default withRouter(Create);

var generateRandomString = function(length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
