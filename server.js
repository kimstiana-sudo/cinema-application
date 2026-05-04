const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const sequelize = require("./config/db");
const db = require("./models");
const createRoles = require("./utilisateurs/createRoles");
const authRoutes = require("./routes/authRoutes");
const filmRoutes = require("./routes/filmRoutes");
const seanceRoutes = require("./routes/seanceRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const salleRoutes = require("./routes/salleRoutes");
const categorieRoutes = require("./routes/categorieRoutes");
const placeRoutes = require("./routes/placeRoutes");
const paiementRoutes = require("./routes/paiementRoutes");
const billetRoutes = require("./routes/billetRoutes");
const userRoutes = require("./routes/userRoutes");

app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "frontend")));
app.use("/api", authRoutes);
app.use("/api", filmRoutes);
app.use("/api", seanceRoutes);
app.use("/api", reservationRoutes);
app.use("/api", salleRoutes);
app.use("/api", categorieRoutes);
app.use("/api", placeRoutes);
app.use("/api", paiementRoutes);
app.use("/api", billetRoutes);
app.use("/api", userRoutes);

// Debug middleware
app.use('/api', (req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "auth.html"));
});

app.get("/test", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "auth.html"));
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connexion à MySQL réussie");
     return db.sequelize;
  })
  .then(() => {
    // Synchroniser les tables d'abord
    return db.sequelize.sync();
  })
  .then(() => {
    console.log("Tables synchronisées avec succès");
    return createRoles();
  })
  .then(() => {
    app.listen(3000, () => {
      console.log("Serveur démarré sur http://localhost:3000");
    });
  })
  .catch((error) => {
    console.error("Erreur de connexion à MySQL :", error);
  });