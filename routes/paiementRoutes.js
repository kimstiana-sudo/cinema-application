const express = require("express");
const router = express.Router();
const paiementController = require("../controllers/paiementController");
const verifyToken = require("../middlewares/authMiddleware");

// Middleware pour vérifier les rôles agent/admin
const requireAgentOrAdmin = (req, res, next) => {
  if (req.user.role !== 'agent' && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès refusé. Rôle requis: agent ou admin" });
  }
  next();
};

// Routes pour utilisateurs authentifiés
router.post("/paiements", verifyToken, paiementController.createPaiement);
router.get("/paiements/user", verifyToken, paiementController.getPaiementsByUser);

// Routes admin seulement - stats AVANT /:id pour éviter conflit
router.get("/paiements/stats", verifyToken, requireAgentOrAdmin, paiementController.getStatistiquesPaiements);
router.get("/paiements/:id", verifyToken, requireAgentOrAdmin, paiementController.getPaiementById);
router.put("/paiements/:id/status", verifyToken, requireAgentOrAdmin, paiementController.updatePaiementStatus);
router.put("/paiements/:id/rembourser", verifyToken, requireAgentOrAdmin, paiementController.rembourserPaiement);

module.exports = router;