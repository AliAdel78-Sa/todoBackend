const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true, unique: false },
	firstName: { type: String, required: true, unique: false },
	lastName: { type: String, required: true, unique: false },
	lists: { type: Array, required: false, default: [] },
	settings: { type: mongoose.Schema.Types.Mixed, default: { test: "value" } },
	verified: { type: Boolean, default: false },
	confirmationToken: { type: String },
	token: { type: String, default: null },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
