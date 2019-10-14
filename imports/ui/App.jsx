import React from "react";
import { Switch, Route } from "react-router-dom";
import Hello from "./Hello.jsx";
import Room from "./Room.jsx";
import Create from "./Create.jsx";
import NotFound from "./NotFound.jsx";

export const SCOPE =
  "user-read-private user-read-email user-read-currently-playing user-read-playback-state playlist-modify-public playlist-modify-private playlist-read-private user-top-read";
// sguzmanm: I am not a 100% sure that your client credentials should be burnt in the client code. It´s better to have env variables ofor this things
export const CLIENT_ID = "11b6f67236e247b2a05d70cf8b819b51";
export const CLIENT_SECRET = "016e987e71cb4cc9a0d630d7b56449f5";
export const REDIRECT_URI = "http://localhost:3000/create";
class App extends React.Component {
  constructor(props) {
    super(props);
  }


  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/" render={() => <Hello />} />
          <Route path="/create" render={() => <Create />} />
          <Route path="/rooms/:id" render={() => <Room />} />
          <Route path="/notfound" render={() => <NotFound />} />
        </Switch>
      </div>
    );
  }
}

export default App;
