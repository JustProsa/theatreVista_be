// const express = require("express");
// const reviews = express.Router();
// const ReviewModel = require("../models/review");
// const ShowModel = require("../models/show");
// const getShow = require("../middlewares/getShow");
// const getUser = require("../middlewares/getUser");
// const isAdmin = require("../middlewares/isAdmin");
// const isBanned = require("../middlewares/isBanned");
// const getUserFromToken = require("../middlewares/getUserFromToken");

// // Creare una review
// reviews.post("/reviews", async (req, res) => {
//   const { rating, comment, showId } = req.body;
//   const userId = req.userId;

//   try {
//     const newReview = new ReviewModel({
//       user: userId, // Usa l'utente ottenuto dal middleware
//       show: showId,
//       rating: rating,
//       comment: comment,
//     });

//     const review = await newReview.save();

//     // Aggiornare totalRating e totalVotes dello spettacolo associato
//     const show = await ShowModel.findById(showId);

//     if (!show) {
//       return res
//         .status(404)
//         .send({ statusCode: 404, message: "Show not found" });
//     }

//     show.totalRating += rating;
//     show.totalVotes += 1;
//     await show.save();

//     res.status(201).send({
//       statusCode: 201,
//       message: "Review saved successfully",
//       payload: review,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ statusCode: 500, message: "Internal server error" });
//   }
// });

// // Eliminare una review
// reviews.delete("/reviews/:id", getUser, async (req, res) => {
//   const { user } = req;
//   const { id } = req.params;

//   try {
//     const review = await ReviewModel.findById(id);
//     if (!review) {
//       return res
//         .status(404)
//         .send({ statusCode: 404, message: "Review not found" });
//     }

//     const show = await ShowModel.findById(review.show);

//     // Verifica se l'utente è l'autore della review o è un admin
//     if (user.role === "admin" || review.user.equals(user._id)) {
//       // Aggiornare totalRating e totalVotes dello spettacolo associato
//       show.totalRating -= review.rating;
//       show.totalVotes -= 1;
//       await show.save();

//       await review.remove();
//       res.json({ message: "Review deleted successfully" });
//     } else {
//       res.status(403).send({ statusCode: 403, message: "Permission denied" });
//     }
//   } catch (error) {
//     res.status(500).send({ statusCode: 500, message: "Internal server error" });
//   }
// });

// // Ottenere tutte le recensioni di uno specifico show
// reviews.get("/reviews/show/:showId", async (req, res) => {
//   const { showId } = req.params;

//   try {
//     const reviews = await ReviewModel.find({ show: showId }).populate("user");

//     res.status(200).send({
//       statusCode: 200,
//       message: "Reviews retrieved successfully",
//       reviews,
//     });
//   } catch (error) {
//     res.status(500).send({ statusCode: 500, message: "Internal server error" });
//   }
// });

// module.exports = reviews;

const express = require("express");
const reviews = express.Router();
const ReviewModel = require("../models/review");
const ShowModel = require("../models/show");

// Ottieni tutte le recensioni
reviews.get("/reviews", async (req, res) => {
  try {
    const allReviews = await ReviewModel.find()
      .populate("user")
      .populate("show");
    res.status(200).json(allReviews);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Ottieni una singola recensione
reviews.get("/reviews/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const review = await ReviewModel.findById(id)
      .populate("user")
      .populate("show");
    if (review) {
      res.status(200).json(review);
    } else {
      res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Ottieni tutte le recensioni di uno spettacolo
reviews.get("/reviews/show/:showId", async (req, res) => {
  const { showId } = req.params;
  console.log(showId);

  try {
    const reviews = await ReviewModel.find({ show: showId })
      .populate("user")
      .populate("show");
    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res
      .status(500)
      .json({ message: "Error fetching reviews", error: error.message });
  }
});

// Ottieni tutte le recensioni di un utente
reviews.get("/reviews/user/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log(userId);

  try {
    const reviews = await ReviewModel.find({ user: userId })
      .populate("user")
      .populate("show");
    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res
      .status(500)
      .json({ message: "Error fetching reviews", error: error.message });
  }
});

// Crea una nuova recensione
reviews.post("/reviews", async (req, res) => {
  const { rating, comment, showId, userId } = req.body;

  try {
    const show = await ShowModel.findById(showId);
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    const newReview = new ReviewModel({
      user: userId,
      show: showId,
      rating: rating,
      comment: comment,
    });

    await newReview.save();

    // Aggiorna le informazioni dello show con la nuova recensione
    show.totalRating += rating;
    show.totalVotes += 1;
    await show.save();

    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Modifica una recensione esistente
reviews.patch("/reviews/:id", async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    const review = await ReviewModel.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Elimina una recensione
reviews.delete("/reviews/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const review = await ReviewModel.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Aggiorna le informazioni dello show dopo la rimozione della recensione
    const show = await ShowModel.findById(review.show);
    if (show) {
      show.totalRating -= review.rating;
      show.totalVotes -= 1;
      await show.save();
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = reviews;
