// Middleware per la ricerca degli spettacoli
const ShowModel = require("../models/show");
const getShow = async (req, res, next) => {
  try {
    const show = await ShowModel.findById(req.params.id);
    if (show == null) {
      return res.status(404).json({ message: "Show not found" });
    }
    res.show = show;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = getShow;
