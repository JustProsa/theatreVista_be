const express = require("express");
const login = express.Router();
const bcrypt = require("bcrypt");
const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();

login.post("/login", async (req, res) => {
  try {
    const user = await UserModel.findOne({ username: req.body.username });

    if (!user) {
      return res
        .status(404)
        .send({ statusCode: 404, message: "User NOT FOUND" });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).send({
        statusCode: 400,
        message: "Username o password errati",
      });
    }

    // Verifica se l'utente è bannato
    if (user.isBanned) {
      return res.status(403).send({
        statusCode: 403,
        message: "Accesso negato. L'utente è stato bannato.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "72h",
      }
    );

    res.header("Authorization", token).status(200).send({
      message: "Login effettuato con successo",
      statusCode: 200,
      token,
    });

    console.log(`Login effettuato con successo da ${user.username}`);
  } catch (error) {
    console.error("Errore durante il login:", error);
    res.status(500).send({
      statusCode: 500,
      message:
        "Errore durante il login. Controlla i log del server per ulteriori dettagli.",
    });
  }
});

module.exports = login;
