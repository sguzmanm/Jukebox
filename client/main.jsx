import React from "react";
import { Meteor } from "meteor/meteor";
import { render } from "react-dom";
import { Router } from "react-router-dom";
import App from "/imports/ui/App";
import { createBrowserHistory } from "history";

import "./main.css";
const history = createBrowserHistory();

Meteor.startup(() => {
  render(
    <Router history={history}>
      <App />
    </Router>,
    document.getElementById("root")
  );
});

