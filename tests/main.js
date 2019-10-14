import assert from "assert";
import { Meteor } from "meteor/meteor";
/*global describe*/
describe("Jukebox", function() {
  it("package.json has correct name", async function() {
    const { name } = await import("../package.json");
    assert.strictEqual(name, "Jukebox");
  });

  if (Meteor.isClient) {
    it("client is not server", function() {
      assert.strictEqual(Meteor.isServer, false);
    });
  }

  if (Meteor.isServer) {
    /*global it*/
    it("server is not client", function() {
      assert.strictEqual(Meteor.isClient, false);
    });
  }
});
