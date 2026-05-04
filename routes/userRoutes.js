const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middlewares/authMiddleware");

// Middleware pour vérifier le rôle admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès refusé. Rôle requis: admin" });
  }
  next();
};

// Routes admin seulement
// Spécifiques avant /:id pour éviter conflits de routing
router.get("/users", verifyToken, requireAdmin, userController.getAllUsers);
router.get("/users/search", verifyToken, requireAdmin, userController.searchUsers);
router.get("/users/stats", verifyToken, requireAdmin, userController.getUserStatistics);
router.get("/users/role/:roleName", verifyToken, requireAdmin, userController.getUsersByRole);
router.get("/users/:id", verifyToken, requireAdmin, userController.getUserById);
router.put("/users/:id/role", verifyToken, requireAdmin, userController.changeUserRole);
router.put("/users/:id", verifyToken, requireAdmin, userController.updateUser);
router.delete("/users/:id", verifyToken, requireAdmin, userController.deleteUser);

module.exports = router;