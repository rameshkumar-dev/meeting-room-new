const Room = require("../models/Room");

// Get all rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms", error });
  }
};

// Search rooms by name
exports.searchRooms = async (req, res) => {
  const { query } = req.query;
  try {
    const rooms = await Room.find({ name: new RegExp(query, "i") });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error searching rooms", error });
  }
};

// Book a room
exports.bookRoom = async (req, res) => {
  const { roomId } = req.params;
  const { date, timeSlot, bookedBy } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if the time slot is already booked
    const isBooked = room.bookings.some(
      (booking) => booking.date === date && booking.timeSlot === timeSlot
    );
    if (isBooked) {
      return res.status(400).json({ message: "Time slot already booked" });
    }

    room.bookings.push({ date, timeSlot, bookedBy });
    await room.save();

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Error booking room", error });
  }
};

// Get room details
exports.getRoomById = async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Error fetching room details", error });
  }
};


exports.getBookingsForCurrentMonth = async (req, res) => {
    try {
        const { start, end } = req.query;
        const startDate = new Date(start);
        const endDate = new Date(end);
    
        const rooms = await Room.find({
          "bookings.date": {
            $gte: startDate.toISOString().split('T')[0], // Assuming date is stored as 'YYYY-MM-DD'
            $lte: endDate.toISOString().split('T')[0],
          }
        });
    
        // Extract bookings that match the date range
        const bookings = rooms.flatMap(room => 
          room.bookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            return bookingDate >= startDate && bookingDate <= endDate;
          })
        );
    
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};