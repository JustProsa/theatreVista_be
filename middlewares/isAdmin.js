// Middleware per verificare il ruolo dell'utente

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const isAdmin = (req, res, next) => {
  const token = req.header("Authorization").split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        statusCode: 403,
        message:
          "Accesso negato. Solo gli amministratori possono eseguire questa azione.",
      });
    }

    // Se l'utente ha il ruolo di admin, procedi alla prossima funzione middleware o alla gestione della richiesta.
    next();
  } catch (error) {
    res.status(401).json({ message: "Token non valido" });
  }
};

module.exports = isAdmin;
