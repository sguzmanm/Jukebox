import React, { Component } from "react";
import { SCOPE, CLIENT_ID, REDIRECT_URI } from "./App";
var querystring = require("query-string");

import "./btn.css";
export default class Hello extends Component {
  constructor(props) {
    super(props);
    this.state = {
      join: false,
      playlistId: ""
    };
  }

  selectJoin = () => {
    this.setState({ join: true });
  };

  join = () => {
    window.location.href =
      "https://localhost:3000/rooms/" + this.state.playlistId;
  };

  actualizarId = e => {
    this.setState({ playlistId: e.target.value });
  };

  auth = () => {
    window.location.href =
      "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: CLIENT_ID,
        scope: SCOPE,
        redirect_uri: REDIRECT_URI
      });
  };

  render() {
    if (!this.state.join) {
      return (
        <div className="hello">
          <div className="row text-center">
            <div className="col-sm-8 mx-auto">
              <h1 className="h1Nombre">Jukebox</h1>
            </div>
          </div>
          <div className="row text-center">
            <div className="col-sm-3"></div>
            <div className="col-sm-3 colbtn mx-auto">
              <div className="btn btn-primary" onClick={this.auth}>
                Host
              </div>
            </div>
            <div className="col-sm-3 colbtn mx-auto">
              <div className="btn btn-primary" onClick={this.selectJoin}>
                Join
              </div>
            </div>
            <div className="col-sm-3"></div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="hello">
          <div className="row text-center">
            <div className="col-sm-8 mx-auto">
              <h1 className="h1Nombre">Jukebox</h1>
            </div>
          </div>
          <div className="row text-center">
            <div className="col-sm-5 colInput mx-auto">
              <div className="inputCol">
                <div className="row text-center">
                  <div className="InputLbl">Enter the room's ID:</div>
                </div>
                <div className="row text-center">
                  <div className="col-sm-8 mx-auto">
                    <input
                      type="text"
                      className="form-control"
                      value={this.state.playlistId}
                      onChange={this.actualizarId.bind(this)}
                    />
                  </div>
                </div>
                <div className="row text-center filaJoin">
                  <div className="btn btn-primary mx-auto" onClick={this.join}>
                    Join
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}
