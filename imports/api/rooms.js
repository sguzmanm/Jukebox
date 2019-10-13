import { Mongo } from 'meteor/mongo';
import { Meteor } from "meteor/meteor";

export default Rooms = new Mongo.Collection('rooms');
if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish('rooms', function roomsPublication() {
    return Rooms.find()
  });
}
Meteor.methods({
  'rooms.addSong'(roomId, song) {
    const room = Rooms.findOne(roomId);
    const songs = room.songs;
    songs.push(song)
    Rooms.update(roomId, { $set: { songs: songs } });
  },
  'rooms.insert'(room) {
    var id = Rooms.insert({
      name: room.name,
      createdAt: new Date(),
      owner: room.owner,
      songs:room.songs,
      tokenA: room.tokenA,
      tokenB: room.tokenA,
    });
    return id
  },

});