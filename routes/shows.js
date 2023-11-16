const express = require("express");
const shows = express.Router();
const getShow = require("../middlewares/getShow");
const isAdmin = require("../middlewares/isAdmin");
// const moment = require("moment-timezone");
require("dotenv").config();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const crypto = require("crypto");

const ShowModel = require("../models/show");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}); // diamo a cloudinary le sue chiavi salvate in .env

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "TheatreVistaShowsFolder", //nome della cartella su cloudinary
    format: async (req, file) => "png", //formato del file
    public_id: (req, file) => file.name,
  },
});

const cloudUpload = multer({ storage: cloudStorage });

// POST a new user in the db
shows.post("/shows", isAdmin, async (req, res) => {
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);

  const newShow = new ShowModel({
    title: req.body.title,
    by: req.body.by,
    description: req.body.description,
    cover: req.body.cover,
    dramaturgy: req.body.dramaturgy,
    direction: req.body.direction,
    actors: req.body.actors,
    production: req.body.production,
    location: req.body.location,
    exhibition: req.body.exhibition,
    startDate: startDate,
    endDate: endDate,
    duration: req.body.duration,
  });

  try {
    const show = await newShow.save();

    res.status(201).send({
      statusCode: 201,
      message: "Show saved successfully",
      payload: show,
    });
  } catch (error) {
    res
      .status(500)
      .send({ statusCode: 500, message: "Internal server error", error });
  }
});

// POST the show cover on the cloud
shows.post(
  "/shows/cloudUpload",
  isAdmin,
  cloudUpload.single("cover"),
  async (req, res) => {
    try {
      res.status(200).json({ cover: req.file.path });
    } catch (error) {
      res
        .status(500)
        .send({ statusCode: 500, message: "Errore interno del server" });
    }
  }
);

// GET the shows in the db
shows.get("/shows", async (req, res) => {
  // logica del get

  const { page = 1, pageSize = 4 } = req.query;

  try {
    const shows = await ShowModel.find()
      .sort({ totalRating: -1 }) // Ordina in ordine decrescente per totalRating
      .limit(pageSize)
      .skip((page - 1) * pageSize);

    const totalShows = await ShowModel.count();

    res.status(200).send({
      statusCode: 200,
      currentPage: Number(page),
      totalPages: Math.ceil(totalShows / pageSize),
      totalShows,
      shows,
    });
  } catch (error) {
    res
      .status(500)
      .send({ statusCode: 500, message: "Errore interno del server" });
  }
});

// GET a specific show by id
shows.get("/shows/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const show = await ShowModel.findById(id);
    if (!show) {
      return res
        .status(404)
        .send({ statusCode: 404, message: "Show not found!" });
    }

    res
      .status(200)
      .send({ statusCode: 200, message: "That's the show!", show });
  } catch (error) {
    res
      .status(500)
      .send({ statusCode: 500, message: `Internal server error`, error });
  }
});

// PATCH (update) a specific show by ID
shows.patch("/shows/:id", getShow, async (req, res) => {
  if (req.body.title != null) {
    res.show.title = req.body.title;
  }
  if (req.body.by != null) {
    res.show.by = req.body.by;
  }
  if (req.body.description != null) {
    res.show.description = req.body.description;
  }
  if (req.body.cover != null) {
    res.show.cover = req.body.cover;
  }
  if (req.body.dramaturgy != null) {
    res.show.dramaturgy = req.body.dramaturgy;
  }
  if (req.body.direction != null) {
    res.show.direction = req.body.direction;
  }
  if (req.body.actors != null) {
    res.show.actors = req.body.actors;
  }
  if (req.body.production != null) {
    res.show.production = req.body.production;
  }
  if (req.body.location != null) {
    res.show.location = req.body.location;
  }
  if (req.body.exhibition != null) {
    res.show.exhibition = req.body.exhibition;
  }
  if (req.body.startDate != null) {
    res.show.startDate = req.body.startDate;
  }
  if (req.body.endDate != null) {
    res.show.endDate = req.body.endDate;
  }
  if (req.body.duration != null) {
    res.show.duration = req.body.duration;
  }
  // if (req.body.totalRating != null) {
  //   res.show.totalRating = req.body.totalRating;
  // }
  // if (req.body.totalVotes != null) {
  //   res.show.totalVotes = req.body.totalVotes;
  // }

  try {
    const updatedShow = await res.show.save();
    res.json(updatedShow);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a specific show by ID
shows.delete("/shows/:showId", isAdmin, async (req, res) => {
  const { showId } = req.params;

  try {
    // Usa findOneAndDelete per trovare e eliminare lo spettacolo
    const deletedShow = await ShowModel.findOneAndDelete({ _id: showId });

    if (!deletedShow) {
      return res.status(404).json({ message: "Show not found" });
    }

    res.status(200).json({ message: "Show deleted successfully" });
  } catch (error) {
    console.error("Error deleting show", error);
    res.status(500).json({ statusCode: 500, message: "Internal server error" });
  }
});

module.exports = shows;
