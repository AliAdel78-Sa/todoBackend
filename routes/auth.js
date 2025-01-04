const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const router = express.Router();
const path = require("path");
// Email Transporter
const transporter = nodemailer.createTransport({
	service: "Gmail", // Use your email provider
	auth: {
		user: "alya70934@gmail.com", // Replace with your email
		pass: "ieuq dwxn vjds ydjm ", // Replace with your email password
	},
});

// Signup
router.post("/signup", async (req, res) => {
	const { email, password } = req.body;

	try {
		const userExists = await User.findOne({ email });
		if (userExists)
			return res
				.status(400)
				.json({ message: "Email already registered" });

		const confirmationToken = crypto.randomBytes(32).toString("hex");
		const newUser = new User({ ...req.body, confirmationToken });
		await newUser.save();
		const confirmationUrl = `http://192.168.1.100:5000/api/auth/confirm-email?token=${confirmationToken}&email=${encodeURIComponent(
			email
		)}`;
		const mailOptions = {
			from: "alya70934@gmail.com",
			to: email,
			subject: "Confirm Your Email",
			html: `<p>Please confirm your email by clicking <a href="${confirmationUrl}">here</a>.</p>`,
		};

		await transporter.sendMail(mailOptions);

		res.status(201).json({
			message:
				"User registered. Please check your email to confirm your account.",
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error });
	}
});

// Confirm Email
router.get("/confirm-email", async (req, res) => {
	const { token, email } = req.query;

	try {
		const user = await User.findOne({ email, confirmationToken: token });
		if (!user)
			return res
				.status(400)
				.json({ message: "Invalid or expired token." });

		user.verified = true;
		user.confirmationToken = undefined; // Clear the token after verification
		await user.save();

		res.render("email.ejs");
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
});

// Get User
router.get("/user/:token", async (req, res) => {
	const { token } = req.params;
	try {
		const user = await User.findOne({ token: token });
		if (user) {
			res.status(200).send(user);
		}
	} catch (e) {
		res.status(500).send({ message: "Server Error", error: e });
	}
});

// Save User Data
router.post("/save", async (req, res) => {
	const { token, userData } = req.body;
	try {
		const user = await User.findOne({ token: token });
		if (user) {
			user.userData = userData;
			await user.save();
			res.status(200).json({
				messege: "User Updated Successfully",
				userData: user,
			});
		} else {
			res.status(200).json({
				messege: "User Not Found",
				userData: user,
			});
		}
	} catch (e) {
		res.status(500).send({ message: "Server Error", error: e });
	}
});

// Login
router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: "User not found" });

		if (!user.verified) {
			return res.status(403).json({
				message: "Please verify your email before logging in.",
			});
		}

		const isMatch = await user.matchPassword(password);
		if (!isMatch)
			return res.status(401).json({ message: "Invalid credentials" });

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
		user.token = token;
		await user.save();
		res.status(200).json({ token: token, user: user });
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
});

