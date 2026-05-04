const express = require("express");
const router = express.Router();
const filmController = require("../controllers/filmController");
const verifyToken = require("../middlewares/authMiddleware");

// Middleware pour vérifier les rôles agent/admin
const requireAgentOrAdmin = (req, res, next) => {
  if (req.user.role !== 'agent' && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès refusé. Rôle requis: agent ou admin" });
  }
  next();
};

// Routes publiques
router.get("/films", filmController.getAllFilms);
router.get("/films/:id", filmController.getFilmById);

// Routes protégées (agent/admin seulement)
router.post("/films", verifyToken, requireAgentOrAdmin, filmController.createFilm);
router.put("/films/:id", verifyToken, requireAgentOrAdmin, filmController.updateFilm);
router.delete("/films/:id", verifyToken, requireAgentOrAdmin, filmController.deleteFilm);

module.exports = router;