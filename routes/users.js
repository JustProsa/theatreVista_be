const express = require("express");
const users = express.Router();
const getUser = require("../middlewares/getUser");
const isAdmin = require("../middlewares/isAdmin");
const isBanned = require("../middlewares/isBanned");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const crypto = require("crypto");

const UserModel = require("../models/user");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}); // diamo a cloudinary le sue chiavi salvate in .env

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "TheatreVistaUsersFolder", //nome della cartella su cloudinary
    format: async (req, file) => "png", //formato del file
    public_id: (req, file) => file.name,
  },
});

const cloudUpload = multer({ storage: cloudStorage });

// Endpoint per ottenere i dettagli dell'utente
users.get("/users/details", async (req, res) => {
  const token = req.header("Authorization").split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded.id);
    res.status(200).send(user);
  } catch (error) {
    res.status(401).send({ message: "Token non valido" });
  }
});

// GET the users from the database
users.get("/users", async (req, res) => {
  try {
    const users = await UserModel.find();
    res
      .status(200)
      .send({ statusCode: 200, message: "Users find correctly", users });
  } catch (error) {
    res
      .status(500)
      .send({ statusCode: 500, message: "Internal server error", error });
  }
});

// POST the user avatar on the cloud
users.post(
  "/users/cloudUpload",

  cloudUpload.single("avatar"),
  async (req, res) => {
    try {
      res.status(200).json({ avatar: req.file.path });
    } catch (error) {
      res
        .status(500)
        .send({ statusCode: 500, message: "Errore interno del server" });
    }
  }
);

// POST a new user in the db
users.post("/users", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const newUser = new UserModel({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    role: req.body.role,
    avatar: req.body.avatar,
  });

  try {
    const user = await newUser.save();

    res.status(201).send({
      statusCode: 201,
      message: "User saved successfully",
      payload: user,
    });
  } catch (error) {
    res
      .status(500)
      .send({ statusCode: 500, message: "Internal server error", error });
  }
});

// PATCH (update) a specific user by ID
users.patch("/users/update/:id", getUser, async (req, res) => {
  if (req.body.firstName != null) {
    res.user.firstName = req.body.firstName;
  }
  if (req.body.lastName != null) {
    res.user.lastName = req.body.lastName;
  }
  if (req.body.birthDay != null) {
    res.user.birthDay = req.body.birthDay;
  }
  if (req.body.avatar != null) {
    res.user.avatar = req.body.avatar;
  }
  if (req.body.email != null) {
    res.user.email = req.body.email;
  }
  if (req.body.password != null) {
    res.user.password = req.body.password;
  }
  if (req.body.role != null) {
    res.user.role = req.body.role;
  }

  try {
    const updatedUser = await res.user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH (ban) a specific user by ID
users.patch("/users/:id/ban", isAdmin, getUser, async (req, res) => {
  if (res.user.isBanned) {
    return res.status(400).json({ message: "Utente già bannato" });
  }

  res.user.isBanned = true;

  try {
    const updatedUser = await res.user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH (unban) a specific user by ID
users.patch("/users/:id/unban", isAdmin, getUser, async (req, res) => {
  try {
    if (!res.user.isBanned) {
      return res.status(400).json({ message: "Utente non bannato" });
    }

    res.user.isBanned = false;

    const updatedUser = await res.user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a specific user by ID
users.delete("/users/:id", getUser, async (req, res) => {
  try {
    await res.user.remove();
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = users;
