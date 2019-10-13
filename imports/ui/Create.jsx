import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from "./App";

var querystring = require("query-string");

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
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          new Buffer(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64")
      };

      var details = {
        code: parsed.code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code"
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

            Meteor.call(
              "getData",
              "https://api.spotify.com/v1/me/top/tracks?limit=16",
              { Authorization: "Bearer " + result.data.access_token },
              (error, result) => {
                if (error) {
                  this.props.history.push("/");
                } else {
                  console.log(result);
                }
              }
            );
          }
        }
      );
    }
  }
  //Input para playlist. Con esta info pedir los mas visualizados.
  render() {
    if (!this.state.chosen) {
      return (
        <div>
          <h1>CREATE</h1>
          <input
            type="text"
            className="form-control"
            value={this.state.playlistName}
            onChange={this.actualizarNombre.bind(this)}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.savePlaylistName}
          >
            Primary
          </button>
        </div>
      );
    } else {
      return <div>{this.state.favoriteTracks}</div>;
    }
  }
}

export default withRouter(Create);
