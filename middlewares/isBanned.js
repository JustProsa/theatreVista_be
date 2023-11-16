const isBanned = (req, res, next) => {
  const token = req.header("Authorization").split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.isBanned) {
      return res.status(403).json({
        statusCode: 403,
        message: "Accesso negato. L'utente è stato bannato.",
      });
    }

    // Se l'utente non è bannato, procedi alla prossima funzione middleware o alla gestione della richiesta.
    next();
  } catch (error) {
    res.status(401).json({ message: "Token non valido" });
  }
};

module.exports = isBanned;
