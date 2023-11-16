const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");

const getUserIdFromToken = async (req, res, next) => {
  try {
    // Ottieni il token dalla richiesta
    const token = req.header("Authorization").split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res
        .status(401)
        .json({ message: "Invalid Authorization header format" });
    }

    // Verifica e decodifica il token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    // Ottieni l'ID dell'utente dal token
    const userId = decoded.id;

    // Ottieni l'utente dal database usando l'ID
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Aggiungi l'ID dell'utente alla richiesta
    req.userId = userId;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = getUserIdFromToken;
