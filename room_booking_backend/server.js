const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const roomRoutes = require("./routes/roomRoutes");
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); 

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());


// Generate a session ID and token
app.get("/generate-session", (req, res) => {
  const sessionId = uuidv4();
  const token = jwt.sign({ sessionId }, "your_secret_key", { expiresIn: "1h" });
  res.json({ sessionId, token });
});


app.use("/api", roomRoutes); 

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
