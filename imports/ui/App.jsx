import React from "react";
import { Switch, Route } from "react-router-dom";
import Hello from "./Hello.jsx";
import Room from "./Room.jsx";

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>Welcome to Meteor!</h1>
        <Switch>
          <Route exact path="/" render={() => <Hello />} />
          <Route path="/rooms/:id" render={() => <Room />} />
        </Switch>
      </div>
    );
  }
}

export default App;
