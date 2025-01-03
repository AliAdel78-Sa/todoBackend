require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const path = require("path");
const User = require("./models/User");
const app = express();
connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Ensure this points to your views directory
// Middleware
app.use(cors({ origin: "http://127.0.0.1:5500" }));
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);

app.get("/hello", (req, res) => {
	res.send({ messege: "Hello World!!" });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
