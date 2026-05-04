const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController.js");
const verifyToken = require("../middlewares/authMiddleware");

// Middleware pour vérifier le rôle admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès refusé. Rôle requis: admin" });
  }
  next();
};

// Middleware pour vérifier les rôles agent/admin
const requireAgentOrAdmin = (req, res, next) => {
  if (req.user.role !== 'agent' && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès refusé. Rôle requis: agent ou admin" });
  }
  next();
};

router.post("/reservations", verifyToken, reservationController.createReservation);
router.get("/reservations/user", verifyToken, reservationController.getReservationsByUser);
router.get("/reservations", verifyToken, requireAgentOrAdmin, reservationController.getAllReservations);
router.get("/reservations/stats", verifyToken, requireAdmin, reservationController.getReservationStatistics);
router.get("/reservations/:id", verifyToken, reservationController.getReservationById);
router.put("/reservations/:id/cancel", verifyToken, reservationController.cancelReservation);
router.put("/reservations/:id/statut", verifyToken, requireAgentOrAdmin, reservationController.updateReservationStatus);
router.put("/reservations/:id/status", verifyToken, requireAgentOrAdmin, reservationController.updateReservationStatus);
router.put("/reservations/:id/modify", verifyToken, reservationController.modifyReservation);
router.delete("/reservations/:id", verifyToken, reservationController.deleteReservation);

module.exports = router;
