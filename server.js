require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const path = require("path");
const User = require("./models/User");
const https = require("https");
const fs = require("fs");
const app = express();
connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Ensure this points to your views directory
// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
