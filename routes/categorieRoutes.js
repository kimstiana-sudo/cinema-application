const express = require("express");
const router = express.Router();
const categorieController = require("../controllers/categorieController");
const verifyToken = require("../middlewares/authMiddleware");

// Middleware pour vérifier les rôles agent/admin
const requireAgentOrAdmin = (req, res, next) => {
  if (req.user.role !== 'agent' && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès refusé. Rôle requis: agent ou admin" });
  }
  next();
};

// Routes publiques
router.get("/categories", categorieController.getAllCategories);

// Routes protégées (agent/admin seulement)
router.get("/categories/:id", verifyToken, requireAgentOrAdmin, categorieController.getCategorieById);
router.post("/categories", verifyToken, requireAgentOrAdmin, categorieController.createCategorie);
router.put("/categories/:id", verifyToken, requireAgentOrAdmin, categorieController.updateCategorie);
router.delete("/categories/:id", verifyToken, requireAgentOrAdmin, categorieController.deleteCategorie);

module.exports = router;