const express = require("express");
const reports = express.Router();
const Report = require("../models/report");
const getUser = require("../middlewares/getUser");

// Endpoint per ottenere tutti i report ordinati per data (dal più recente al più vecchio)
reports.get("/reports", async (req, res) => {
  const { sortBy = "createdAt" } = req.query;
  try {
    // Trova tutti i report nel database, ordinati per data (dal più recente al più vecchio)
    const reports = await Report.find()
      .sort({ [sortBy]: -1 }) // Utilizza -1 per l'ordinamento discendente (dal più recente al più vecchio)
      .populate("user");

    res.json(reports);
  } catch (error) {
    console.error("Errore durante il recupero dei report:", error);
    res.status(500).json({ message: "Errore durante il recupero dei report." });
  }
});

// Endpoint per creare un nuovo report
reports.post("/reports", async (req, res) => {
  try {
    const { user, object, text, name, email } = req.body;

    // Crea un nuovo report
    const newReport = new Report({
      user: user,
      object: object,
      text: text,
      name: name,
      email: email,
    });

    // Salva il report nel database
    const savedReport = await newReport.save();

    res.status(201).json(savedReport);
  } catch (error) {
    console.error("Errore durante la creazione del report:", error);
    res
      .status(500)
      .json({ message: "Errore durante la creazione del report." });
  }
});

// Endpoint per eliminare un report
reports.delete("/reports/:id", async (req, res) => {
  const reportId = req.params.id;

  try {
    // Trova il report nel database
    const report = await Report.findByIdAndDelete(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report non trovato." });
    }

    res.json({ message: "Report eliminato con successo." });
  } catch (error) {
    console.error("Errore durante l'eliminazione del report:", error);
    res
      .status(500)
      .json({ message: "Errore durante l'eliminazione del report." });
  }
});

module.exports = reports;
