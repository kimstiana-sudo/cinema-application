const express = require("express");
const router = express.Router();
const seanceController = require("../controllers/seanceController.js");
const verifyToken = require("../middlewares/authMiddleware");

// Middleware pour vérifier les rôles agent/admin
const requireAgentOrAdmin = (req, res, next) => {
  if (req.user.role !== 'agent' && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès refusé. Rôle requis: agent ou admin" });
  }
  next();
};

// Routes publiques
router.get("/seances/film/:film_id", seanceController.getSeancesByFilm);
router.get("/seances/:id/places", seanceController.getPlacesDisponibles);

// Routes protégées (lecture pour tous, écriture pour agent/admin)
router.get("/seances", seanceController.getAllSeances);
router.get("/seances/:id", verifyToken, seanceController.getSeanceById);
router.post("/seances", verifyToken, requireAgentOrAdmin, seanceController.createSeance);
router.put("/seances/:id", verifyToken, requireAgentOrAdmin, seanceController.updateSeance);
router.delete("/seances/:id", verifyToken, requireAgentOrAdmin, seanceController.deleteSeance);

module.exports = router;