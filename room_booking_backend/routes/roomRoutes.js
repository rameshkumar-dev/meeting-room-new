const express = require("express");
const roomController = require("../controllers/roomController");

const router = express.Router();

// Define routes
router.get("/rooms", roomController.getRooms);
router.get("/rooms/search", roomController.searchRooms);
router.post("/rooms/:roomId/book", roomController.bookRoom);
router.get("/rooms/:roomId", roomController.getRoomById);
router.get("/rooms/bookings", roomController.getBookingsForCurrentMonth);

module.exports = router;
