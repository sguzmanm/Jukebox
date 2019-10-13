import "/imports/api/rooms";

Meteor.methods({
  postData(url, headers, details) {
    try {
      var result = HTTP.call("POST", url, {
        content: details,
        headers: headers
      });
      return result;
    } catch (err) {
      throw err;
    }
  },

  getData(url, headers) {
    try {
      var result = HTTP.call("GET", url, {
        headers: headers
      });
      return result;
    } catch (err) {
      throw err;
    }
  }
});
