import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

// sguzmanm: Love how clean this code is, nice job
let Rooms = new Mongo.Collection("rooms");
if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish("rooms", function roomsPublication() {
    return Rooms.find();
  });
}
Meteor.methods({
  "rooms.addSong"(roomId, song) {
    const room = Rooms.findOne({ roomId: roomId });
    const songs = room.songs;
    songs.push(song);
    Rooms.update(room._id, { $set: { songs: songs } });
  },
  "rooms.updateSongs"(roomId, songs) {
    Rooms.update(roomId, { $set: { songs: songs } });
  },
  "rooms.updateAccess"(roomId, access_token) {
    Rooms.update(roomId, { $set: { access_token: access_token } });
  },
  "rooms.insert"(room) {
    Rooms.insert({
      name: room.name,
      playlistId: room.playlistId,
      createdAt: new Date(),
      owner: room.owner,
      songs: room.songs,
      refresh_token: room.refresh_token,
      access_token: room.access_token,
      roomId: room.roomId
    });
  },
  "rooms.delete"(id) {
    Rooms.remove({ roomId: id });
  },
  "rooms.checkId"(id) {
    var result = Rooms.findOne({ roomId: id });
    return result;
  }
});
export default Rooms;
