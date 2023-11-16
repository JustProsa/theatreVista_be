const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Riferimento al modello dell'utente che ha scritto la recensione
    required: true,
  },
  show: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Show", // Riferimento al modello dello spettacolo recensito
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model("Review", reviewSchema, "reviews");

module.exports = Review;
