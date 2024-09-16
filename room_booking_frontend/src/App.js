import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./App.css"; // Updated with new styles

function App() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [session, setSession] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [message, setMessage] = useState("");
  const [bookedRooms, setBookedRooms] = useState([]); // For current month bookings

  const holidays = ["2024-09-13", "2024-09-16"]; // we can add optional holiday to avoid wrong booking details

  const getTagsByRoomName = (roomName) => {
    switch (roomName) {
      case "Room 1":
        return ["Projector", "Whiteboard", "15 Seats"];
      case "Room 2":
        return ["Projector", "Sound", "15 Seats"];
      case "Room 3":
        return ["Video Conferencing", "8 Seats"];
      case "Room 4":
        return ["Premium", "Private", "5 Seats"];
      default:
        return ["Standard", "10 Seats"];
    }
  };

  const fetchRooms = useCallback(() => {
    axios
      .get("http://localhost:5000/api/rooms")
      .then((res) => {
        const roomsWithTags = res.data.map((room) => ({
          ...room,
          tags: getTagsByRoomName(room.name),
        }));
        setRooms(roomsWithTags);
        if (roomsWithTags.length > 0) setSelectedRoom(roomsWithTags[0]);
      })
      .catch((err) => console.error(err));
  }, []);

  // const fetchBookedRoomsForCurrentMonth = () => {
  //   const today = new Date();
  //   const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  //   const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  //   axios
  //     .get("http://localhost:5000/bookings", {
  //       params: { start: startOfMonth.toISOString(), end: endOfMonth.toISOString() },
  //     })
  //     .then((res) => setBookedRooms(res.data))
  //     .catch((err) => console.error(err));
  // };

  useEffect(() => {
    axios
      .get("http://localhost:5000/generate-session")
      .then((res) => setSession(res.data))
      .catch((err) => console.error(err));

    fetchRooms();
    //fetchBookedRoomsForCurrentMonth(); // Fetch bookings for the current month
  }, [fetchRooms]);

  const handleSearch = () => {
    if (!searchQuery) {
      fetchRooms(); // Fetch all rooms if search query is empty
      return;
    }

    axios
      .get(`http://localhost:5000/api/rooms/search?query=${searchQuery}`)
      .then((res) => {
        const roomsWithTags = res.data.map((room) => ({
          ...room,
          tags: getTagsByRoomName(room.name),
        }));
        setRooms(roomsWithTags);
        if (roomsWithTags.length > 0) setSelectedRoom(roomsWithTags[0]);
      })
      .catch((err) => console.error(err));
  };

  const handleBookRoom = (roomId, date, timeSlot) => {
    const bookingExists = selectedRoom.bookings.some(
      (b) => b.date === date && b.timeSlot === timeSlot
    );

    if (bookingExists) {
      setMessage("This slot is already booked.");
      return;
    }

    const currentTime = new Date();
    const bookingDate = new Date(`${date} ${timeSlot.split("-")[0]}`);

    if (bookingDate <= currentTime) {
      setMessage("Cannot book a slot in the past.");
      return;
    }

    const dayOfWeek = new Date(date).getDay();
    const isHoliday = holidays.some(
      (holiday) =>
        new Date(holiday).toDateString() === new Date(date).toDateString()
    );

    if (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday) {
      setMessage("Cannot book on weekends or holidays.");
      return;
    }

    axios
      .post(`http://localhost:5000/api/rooms/${roomId}/book`, {
        date,
        timeSlot,
        bookedBy: session.sessionId,
      })
      .then(() => {
        fetchRooms();
        setMessage("Booking successful!");
      })
      .catch((err) => console.error(err));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setMessage("");
    fetchAvailableTimeSlots(selectedRoom._id, date);
  };

  const fetchAvailableTimeSlots = (roomId, date) => {
    const timeSlots = [
      "9:00 - 9:30",
      "9:30 - 10:00",
      "10:00 - 10:30",
      "10:30 - 11:00",
      "11:00 - 11:30",
      "11:30 - 12:00",
      "12:00 - 12:30",
      "12:30 - 13:00",
      "14:00 - 14:30",
      "14:30 - 15:00",
      "15:00 - 15:30",
      "15:30 - 16:00",
      "16:00 - 16:30",
      "16:30 - 17:00",
      "17:00 - 17:30",
      "17:30 - 18:00",
    ];
    setAvailableTimeSlots(timeSlots);
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setMessage("");
  };

  // New functionality: Get current time slot and show when the room is available or not
  const isRoomAvailableNow = (room) => {
    const currentDate = new Date();
    const currentDateString = currentDate.toDateString();
    const currentTimeString = `${currentDate.getHours()}:${currentDate.getMinutes()}`;

    let nextAvailableSlot = null;

    const bookedSlot = room.bookings.find(
      (booking) =>
        booking.date === currentDateString &&
        booking.timeSlot.split(" - ")[0] <= currentTimeString &&
        booking.timeSlot.split(" - ")[1] >= currentTimeString
    );

    if (bookedSlot) {
      // If room is booked, find the next available slot
      const nextBooking = room.bookings.find(
        (booking) =>
          booking.date === currentDateString &&
          booking.timeSlot.split(" - ")[0] > currentTimeString
      );

      if (nextBooking) {
        nextAvailableSlot = `Available after ${
          nextBooking.timeSlot.split(" - ")[1]
        }`;
      } else {
        nextAvailableSlot = "Available later today.";
      }
    } else {
      // If room is not booked, it is currently available
      nextAvailableSlot = "Available Now";
    }

    return nextAvailableSlot;
  };

  return (
    <div className="app">
      <header className="app-header">
        <input
          type="text"
          className="search-input"
          placeholder="Search Rooms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-search" onClick={handleSearch}>
          Search
        </button>
      </header>

      <div className="container">
        <div className="sidebar">
          {rooms.map((room) => (
            <div
              key={room._id}
              className={`room-card ${
                selectedRoom && selectedRoom._id === room._id ? "selected" : ""
              }`}
              onClick={() => setSelectedRoom(room)}
            >
              <div className="room-card-details flex ">
                <div>
                  <div className="room-name">{room.name}</div>
                  <div className="availability">{isRoomAvailableNow(room)}</div>
                </div>
                <div className="tags">
                  {room.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="details">
          {selectedRoom && (
            <div className="details-card">
              <div className="flex">
                <Calendar onChange={handleDateChange} value={selectedDate} />
                <div className="room-details">
                  <h2>{selectedRoom.name}</h2>
                  <div className="tags">
                    {getTagsByRoomName(selectedRoom.name).map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {selectedSlot && (
                    <button
                      className={`btn btn-book ${
                        new Date(selectedDate).getDay() === 0 || // Disable for weekends
                        new Date(selectedDate).getDay() === 6 ||
                        holidays.some(
                          (holiday) =>
                            new Date(holiday).toDateString() ===
                            new Date(selectedDate).toDateString()
                        ) || // Disable for holidays
                        (new Date(selectedDate).toDateString() ===
                          new Date().toDateString() && // If booking is for today
                          new Date(
                            `${selectedDate.toDateString()} ${
                              selectedSlot.split("-")[0]
                            }`
                          ) <= new Date()) // Disable past time slots today
                          ? "disabled"
                          : ""
                      }`}
                      onClick={() =>
                        handleBookRoom(
                          selectedRoom._id,
                          selectedDate.toDateString(),
                          selectedSlot
                        )
                      }
                      disabled={
                        new Date(selectedDate).getDay() === 0 || // Disable for weekends
                        new Date(selectedDate).getDay() === 6 ||
                        holidays.some(
                          (holiday) =>
                            new Date(holiday).toDateString() ===
                            new Date(selectedDate).toDateString()
                        ) || // Disable for holidays
                        (new Date(selectedDate).toDateString() ===
                          new Date().toDateString() && // If booking is for today
                          new Date(
                            `${selectedDate.toDateString()} ${
                              selectedSlot.split("-")[0]
                            }`
                          ) <= new Date()) // Disable past time slots today
                      }
                    >
                      Book Selected Slot
                    </button>
                  )}
                </div>
              </div>

              <div className="time-slots-grid">
                <h3>Available Time Slots on {selectedDate.toDateString()}</h3>
                <div className="grid-container">
                  {availableTimeSlots.map((slot) => {
                    const isBooked = selectedRoom.bookings.some(
                      (b) =>
                        b.date === selectedDate.toDateString() &&
                        b.timeSlot === slot
                    );

                    return (
                      <div
                        key={slot}
                        className={`time-slot ${
                          selectedSlot === slot ? "selected" : ""
                        } ${isBooked ? "booked" : ""}`}
                        onClick={() => !isBooked && handleSlotClick(slot)}
                      >
                        {slot}
                      </div>
                    );
                  })}
                </div>
              </div>

              {message && <div className="message">{message}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
