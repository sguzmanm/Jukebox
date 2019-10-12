import React, { Component } from "react";
import { withTracker } from "meteor/react-meteor-data";
import Links from "../api/links";
import { withRouter } from "react-router-dom";

class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comment: "",
      id: this.props.match.params.id
    };
  }

  render() {
    return (
      <div>
        <h2>Learn Meteor!{this.state.id}</h2>
      </div>
    );
  }
}

export default Room = withRouter(
  withTracker(() => {
    return {
      links: Links.find().fetch()
    };
  })(Room)
);
