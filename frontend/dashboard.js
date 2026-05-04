// Dashboard - Page d'accueil simple
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!user || !token) {
  window.location.href = "auth.html";
}

// Éléments DOM
const filmsCount = document.getElementById("filmsCount");
const seancesCount = document.getElementById("seancesCount");
const reservationsCount = document.getElementById("reservationsCount");
const recentFilms = document.getElementById("recentFilms");

// Fonction de déconnexion
function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "auth.html";
}

// Charger les statistiques
async function loadStats() {
  const token = localStorage.getItem("token");

  try {
    const filmsResponse = await fetch("/api/films");
    const films = await filmsResponse.json();
    filmsCount.textContent = films.length;

    const seancesResponse = await fetch("/api/seances", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const seances = await seancesResponse.json();
    seancesCount.textContent = seances.length;

    const reservationsResponse = await fetch("/api/reservations/user", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const reservations = await reservationsResponse.json();
    reservationsCount.textContent = reservations.length;

  } catch (error) {
    console.error("Erreur chargement stats:", error);
    filmsCount.textContent = "Erreur";
    seancesCount.textContent = "Erreur";
    reservationsCount.textContent = "Erreur";
  }
}

// Afficher les films récents
async function loadRecentFilms() {
  try {
    const response = await fetch("http://localhost:3000/api/films");
    const films = await response.json();

    // Prendre les 3 derniers films
    const recent = films.slice(-3).reverse();

    recentFilms.innerHTML = recent.map(film => `
      <div class="film-card">
        <h4>${film.titre}</h4>
        <p>${film.genre}</p>
        <button onclick="voirSeances(${film.id})">Voir séances</button>
      </div>
    `).join("");

  } catch (error) {
    console.error("Erreur chargement films:", error);
    recentFilms.innerHTML = "<p>Erreur de chargement</p>";
  }
}

function voirSeances(filmId) {
  window.location.href = `seances.html?film_id=${filmId}`;
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadRecentFilms();
});