const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: String,
  bookings: [
    {
      date: String,
      timeSlot: String,
      bookedBy: String,
    },
  ],
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
