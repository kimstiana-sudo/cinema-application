const express = require("express");
const router = express.Router();
const placeController = require("../controllers/placeController");
const verifyToken = require("../middlewares/authMiddleware");

// Middleware pour vérifier les rôles agent/admin
const requireAgentOrAdmin = (req, res, next) => {
  if (req.user.role !== 'agent' && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès refusé. Rôle requis: agent ou admin" });
  }
  next();
};

// Routes publiques
router.get("/places/disponibles/:seance_id", placeController.getPlacesDisponibles);

// Routes protégées (agent/admin seulement)
router.get("/places/salle/:salle_id", verifyToken, requireAgentOrAdmin, placeController.getPlacesBySalle);
router.get("/places/:id", verifyToken, requireAgentOrAdmin, placeController.getPlaceById);
router.post("/places", verifyToken, requireAgentOrAdmin, placeController.createPlace);
router.post("/places/bulk", verifyToken, requireAgentOrAdmin, placeController.createPlacesForSalle);
router.put("/places/:id", verifyToken, requireAgentOrAdmin, placeController.updatePlace);
router.delete("/places/:id", verifyToken, requireAgentOrAdmin, placeController.deletePlace);


// Route pour voir les places d'une séance (utilisateurs authentifiés)
router.get("/places/seance/:seance_id", verifyToken, placeController.getPlacesDisponibles);

module.exports = router;// Allow authenticated users to see places for a seance
