const mongoose = require("mongoose");
const Room = require("../models/Room");
const connectDB = require("../config/db");

const seedDatabase = async () => {
  try {
    await connectDB();

    const defaultRooms = [
      { name: "Room 1", bookings: [] },
      { name: "Room 2", bookings: [] },
      { name: "Room 3", bookings: [] },
      { name: "Room 4", bookings: [] },
      { name: "Room 5", bookings: [] },
    ];

    // Clear existing rooms
    await Room.deleteMany({});

    // Insert default rooms
    await Room.insertMany(defaultRooms);

    console.log("Database seeded with default rooms!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding database", err);
    process.exit(1);
  }
};

seedDatabase();
