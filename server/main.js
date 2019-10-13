import "/imports/api/rooms";

Meteor.methods({
  postContent(url, headers, details) {
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
  },

  postData(url, headers, data) {
    try {
      var result = HTTP.call("POST", url, {
        data: data,
        headers: headers
      });
      return result;
    } catch (err) {
      throw err;
    }
  }
});
