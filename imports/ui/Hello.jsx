import React, { Component } from "react";
import { SCOPE, CLIENT_ID, REDIRECT_URI } from "./App";
var querystring = require("query-string");

import "./btn.css";
export default class Hello extends Component {
  constructor(props) {
    super(props);
    this.state = {
      join: false,
      playlistId: "",
      focus: "join"
    };
    this.join = React.createRef();
    this.host = React.createRef();
    this.inputId = React.createRef();
    this.joinRm = React.createRef();
    this.cancel = React.createRef();
  }

  // sguzmanm: This method is too big and hard to understand, it should have comments and be segmented into more than one function, e.g., one for handling each type of btn.
  handleKeyPress = (btn, event) => {
    if (btn === "join" && event.key === "ArrowLeft") {
      this.setState({ focus: "host" });
      this.host.current.focus();
    } else if (btn === "host" && event.key === "ArrowRight") {
      this.setState({ focus: "join" });
      this.join.current.focus();
    } else if (btn === "inputId" && event.key === "Enter") {
      this.joinClick();
    } else if (btn === "inputId" && event.key === "ArrowDown") {
      this.setState({ focus: "cancel" });
      this.cancel.current.focus();
    } else if (btn === "joinRm" && event.key === "ArrowLeft") {
      this.setState({ focus: "cancel" });
      this.cancel.current.focus();
    } else if (btn === "cancel" && event.key === "ArrowRight") {
      this.setState({ focus: "joinRm" });
      this.joinRm.current.focus();
    } else if (
      (btn === "cancel" || btn === "joinRm") &&
      event.key === "ArrowUp"
    ) {
      this.setState({ join: true, focus: "inputId" });
      this.inputId.current.focus();
    }
  };

  selectJoin = () => {
    this.setState({ join: true, focus: "inputId" });
    this.inputId.current.focus();
  };
  cancelClick = () => {
    this.setState({ join: false, focus: "join" });
  };

  joinClick = () => {
    if (this.state.playlistId != "") {
      window.location.href =
        "http://localhost:3000/rooms/" + this.state.playlistId;
    }
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
        <div className="hello" role="main">
          <div className="row text-center">
            <div className="col-sm-8 mx-auto">
              <h1
                className="h1Nombre"
                onClick={() => {
                  this.join.current.focus();
                }}
              >
                Jukebox
              </h1>
            </div>
          </div>
          <div className="row text-center">
            <div className="col-sm-3"></div>
            <div className="col-sm-3 colbtn mx-auto">
              <button
                onKeyDown={event => {
                  this.handleKeyPress("host", event);
                }}
                className="btn btn-primary"
                onClick={() => {
                  this.auth();
                }}
                ref={this.host}
              >
                Host
              </button>
            </div>
            <div className="col-sm-3 colbtn mx-auto">
              <button
                autoFocus
                className="btn btn-primary"
                ref={this.join}
                onKeyDown={event => {
                  this.handleKeyPress("join", event);
                }}
                onClick={() => {
                  this.selectJoin();
                }}
              >
                Join
              </button>
            </div>
            <div className="col-sm-3"></div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="hello" role="main">
          <div className="row text-center">
            <div className="col-sm-8 mx-auto">
              <h1
                className="h1Nombre"
                onClick={() => {
                  this.inputId.current.focus();
                }}
              >
                Jukebox
              </h1>
            </div>
          </div>
          <div className="row text-center">
            <div className="col-sm-5 mx-auto">
              <div className="inputCol2">
                <div className="row text-center">
                  <div className="InputLbl"><label htmlFor="EnterRoom">Enter the room&apos;s ID:</label></div>
                </div>
                <div className="row text-center">
                  <div className="col-sm-12 mx-auto">
                    <input
                      ref={this.inputId}
                      type="text"
                      autoFocus
                      onKeyDown={event => {
                        this.handleKeyPress("inputId", event);
                      }}
                      className="form-control createInp "
                      id="EnterRoom"
                      value={this.state.playlistId}
                      onChange={this.actualizarId.bind(this)}
                    />
                  </div>
                </div>
                <hr className="hrCreate" />
                <div className="row text-center">
                  <div className="col-sm-2"></div>
                  <div className="col-sm-4 colbtn mx-auto">
                    <button
                      onKeyDown={event => {
                        this.handleKeyPress("cancel", event);
                      }}
                      ref={this.cancel}
                      className="btn btn-primary"
                      onClick={() => {
                        this.cancelClick();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="col-sm-4 colbtn mx-auto">
                    <button
                      onKeyDown={event => {
                        this.handleKeyPress("joinRm", event);
                      }}
                      ref={this.joinRm}
                      className="btn btn-primary"
                      onClick={() => {
                        this.joinClick();
                      }}
                    >
                      Join
                    </button>
                  </div>
                  <div className="col-sm-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}
