const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middlewares/authMiddleware");

router.post("/register", authController.register);
router.post("/connexion", authController.login);
router.post("/auth/login", authController.login);
router.get("/profile/:id", verifyToken, authController.getProfile);
router.put("/modifierProfil/:id", verifyToken, authController.updateProfile);
router.put("/profile/:id", verifyToken, authController.updateProfile);

module.exports = router;