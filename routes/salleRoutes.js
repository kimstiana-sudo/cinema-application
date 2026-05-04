const express = require("express");
const router = express.Router();
const salleController = require("../controllers/salleController");
const verifyToken = require("../middlewares/authMiddleware");

// Middleware pour vérifier les rôles agent/admin
const requireAgentOrAdmin = (req, res, next) => {
  if (req.user.role !== 'agent' && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès refusé. Rôle requis: agent ou admin" });
  }
  next();
};

// Routes publiques
router.get("/salles", salleController.getSalles);

// Routes protégées (agent/admin seulement)
router.get("/salles/:id", verifyToken, requireAgentOrAdmin, salleController.getSalleById);
router.post("/salles", verifyToken, requireAgentOrAdmin, salleController.createSalle);
router.put("/salles/:id", verifyToken, requireAgentOrAdmin, salleController.updateSalle);
router.delete("/salles/:id", verifyToken, requireAgentOrAdmin, salleController.deleteSalle);

module.exports = router;