const mongoose = require("mongoose");

const showSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  by: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  cover: {
    type: String,
    required: true,
    default: "",
  },
  dramaturgy: {
    type: String,
    required: true,
  },
  direction: {
    type: String,
    required: true,
  },
  actors: {
    type: String,
    required: true,
  },
  production: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  exhibition: {
    type: String,
    required: false,
    default: "N/D",
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: String,
    required: false,
  },
  totalRating: {
    type: Number,
    required: true,
    default: 0,
  },
  totalVotes: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

showSchema.virtual("averageRating").get(function () {
  return this.totalVotes > 0
    ? (this.totalRating / this.totalVotes).toFixed(1)
    : 0;
});

const Show = mongoose.model("Show", showSchema, "shows");

module.exports = Show;
