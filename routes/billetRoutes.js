const express = require("express");
const router = express.Router();
const billetController = require("../controllers/billetController");
const verifyToken = require("../middlewares/authMiddleware");

// Middleware pour vérifier les rôles agent/admin
const requireAgentOrAdmin = (req, res, next) => {
  if (req.user.role !== 'agent' && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès refusé. Rôle requis: agent ou admin" });
  }
  next();
};

// Routes pour utilisateurs authentifiés
router.get("/billets/user", verifyToken, billetController.getBilletsByUser);
router.post("/billets/validate", verifyToken, billetController.validateBillet);

// Routes admin seulement - spécifiques avant /:id
router.get("/billets/code/:code", verifyToken, requireAgentOrAdmin, billetController.getBilletByCode);
router.post("/billets/reservation", verifyToken, requireAgentOrAdmin, billetController.createBilletsForReservation);
router.get("/billets/:id", verifyToken, requireAgentOrAdmin, billetController.getBilletById);
router.post("/billets", verifyToken, requireAgentOrAdmin, billetController.createBillet);
router.delete("/billets/:id", verifyToken, requireAgentOrAdmin, billetController.deleteBillet);

module.exports = router;