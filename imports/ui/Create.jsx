import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from "./App";
import { Meteor } from "meteor/meteor";
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

    this.btnSave = React.createRef();
    this.inPlay = React.createRef();
    this.refMatrix = [];
  }

  handleKey = (btn, event) => {
    if (btn === "inPlay" && event.key === "ArrowDown") {
      this.btnSave.current.focus();
    } else if (btn === "inPlay" && event.key === "Enter") {
      this.btnSave.current.focus();
    } else if (btn === "btnSave" && event.key === "ArrowUp") {
      this.inPlay.current.focus();
    }
  };

  handleMatrix = (x, y, event) => {
    if (event.key === "ArrowUp" && y !== 0) {
      this.refMatrix[y - 1][x].current.focus();
    } else if (event.key === "ArrowDown" && y !== 3) {
      this.refMatrix[y + 1][x].current.focus();
    } else if (event.key === "ArrowLeft" && x !== 0) {
      this.refMatrix[y][x - 1].current.focus();
    } else if (event.key === "ArrowRight" && x !== 3) {
      this.refMatrix[y][x + 1].current.focus();
    }
  };

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

  persistRoom = track => {
    let id = generateRandomString(6);
    Meteor.call("rooms.checkId", id, (error, result) => {
      if (result === undefined) {
        let minutes = Math.trunc(track.duration_ms / 1000 / 60);
        let seconds = Math.trunc((track.duration_ms / 1000) % 60);
        let authors = "";
        for (const index in track.artists) {
          authors = authors + track.artists[index].name;
          if (index != track.artists.length - 1) {
            authors = authors + ", ";
          }
        }
        //Aqui se hace el resto de meteor
        let song = {
          name: track.name,
          author: authors,
          duration: minutes + ":" + seconds,
          state: "comming"
        };
        let room = {
          roomId: id,
          name: this.state.playlistName,
          owner: this.state.user,
          songs: [song],
          refresh_token: this.state.refresh_token,
          access_token: this.state.access_token
        };
        Meteor.call("rooms.insert", room);
        this.setState({ newRoom: true, newRoomId: id });
      } else {
        this.persistRoom(track);
      }
    });
  };

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
                  this.persistRoom(track);
                }
              }
            );
          }
        }
      );
    }
  };

  _renderCol = (track, ref, x, y) => {
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
    var playing = false;
    return (
      <div className="col-sm-3 colpic">
        <button
          className="pic mx-auto"
          ref={ref}
          autoFocus={x === 0 && y === 0}
          onKeyDown={event => {
            console.log(playing);
            if (event.key == "Control") {
              if (!playing) {
                playing = true;
                audio.play();
              }
            } else {
              this.handleMatrix(x, y, event);
            }
          }}
          onKeyUp={event => {
            if (event.key == "Control") {
              if (playing) {
                playing = false;
                audio.pause();
              }
            }
          }}
          onClick={() => {
            this.firstSong(track);
            try {
              if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
              } else {
                audio.pause();
                playing = false;
              }
            } catch (e) {
              console.log(e);
            }
          }}
          onMouseLeave={() => {
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            } else {
              audio.pause();
              playing = false;
            }
          }}
          onMouseEnter={() => {
            if (!timeoutId) {
              timeoutId = setTimeout(function() {
                timeoutId = null;
                audio.play();
                playing = true;
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
        </button>
      </div>
    );
  };
  _renderRow = (row, refs, y) => {
    return (
      <div className="row text-center">
        {this._renderCol(row[0], refs[0], 0, y)}
        {this._renderCol(row[1], refs[1], 1, y)}
        {this._renderCol(row[2], refs[2], 2, y)}
        {this._renderCol(row[3], refs[3], 3, y)}
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
                        ref={this.inPlay}
                        autoFocus
                        type="text"
                        className="form-control createInp "
                        value={this.state.playlistName}
                        onChange={this.actualizarNombre.bind(this)}
                        onKeyDown={event => {
                          this.handleKey("inPlay", event);
                        }}
                      />
                    </div>
                  </div>
                  <hr className="hrCreate" />
                  <div className="row text-center filaJoin">
                    {document.queryCommandSupported("copy") && (
                      <button
                        ref={this.btnSave}
                        type="button"
                        className="btn btn-primary mx-auto btnSavePlaylist"
                        onClick={this.savePlaylistName}
                        onKeyDown={event => {
                          this.handleKey("btnSave", event);
                        }}
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
          for (let i = 0; i < 4; i++) {
            let temp = [];
            for (let j = 0; j < 4; j++) {
              temp.push(React.createRef());
            }
            this.refMatrix.push(temp);
          }

          return (
            <div className="hello">
              <div className="row text-center">
                <h1
                  className="filanombre"
                  onClick={() => {
                    this.refMatrix[0][0].current.focus();
                  }}
                >
                  Select your first track:
                </h1>
              </div>
              <div className="container">
                {this._renderRow(
                  this.state.favoriteTracks.slice(0, 4),
                  this.refMatrix[0],
                  0
                )}
                {this._renderRow(
                  this.state.favoriteTracks.slice(4, 8),
                  this.refMatrix[1],
                  1
                )}
                {this._renderRow(
                  this.state.favoriteTracks.slice(8, 12),
                  this.refMatrix[2],
                  2
                )}
                {this._renderRow(
                  this.state.favoriteTracks.slice(12, 16),
                  this.refMatrix[3],
                  3
                )}
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
                  autoFocus
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
