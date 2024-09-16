const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://rameshk978433:vd8LZgNvlRvJtgz8@meeting-room.ulbno.mongodb.net/?retryWrites=true&w=majority&appName=meeting-room",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
