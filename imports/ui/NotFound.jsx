import React, { Component } from "react";

import "./btn.css";
export default class NotFound extends Component {
  cancel = () => {
    window.location.href = "http://localhost:3000/";
  };

  render() {
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
                <div className="InputLbl">This room doesn't exist!</div>
              </div>
              <div className="row text-center">
                <div className="col-sm-3"></div>
                <div className="col-sm-6 colbtn mx-auto">
                  <div className="btn btn-primary" onClick={this.cancel}>
                    Go Back
                  </div>
                </div>
                <div className="col-sm-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
