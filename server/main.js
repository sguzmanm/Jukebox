import "/imports/api/rooms";
import { Meteor } from "meteor/meteor";
Meteor.methods({
  postContent(url, headers, details) {
    var result = HTTP.call("POST", url, {
      content: details,
      headers: headers
    });
    return result;
  },

  getData(url, headers) {
    var result = HTTP.call("GET", url, {
      headers: headers
    });
    return result;
  },

  postData(url, headers, data) {
    /*global HTTP*/
    var result = HTTP.call("POST", url, {
      data: data,
      headers: headers
    });
    return result;
  }
});

// sguzmanm: For what is this?
Meteor.startup(function() {
  /*global WebApp*/
  WebApp.addHtmlAttributeHook(function() {
    return {
      "lang": "en"
    };
  });
});
