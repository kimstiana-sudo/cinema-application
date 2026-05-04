const seancesList = document.getElementById("seancesList");
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "auth.html";
}

// récupérer filmId dans l'URL ou depuis le dashboard si nécessaire
const params = new URLSearchParams(window.location.search);
let filmId = params.get("film_id");
if (!filmId) {
  filmId = localStorage.getItem("selectedFilmId");
}

const loadSeances = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "auth.html";
    return;
  }

  try {
    const response = await fetch("/api/seances", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur réseau lors du chargement des séances");
    }

    const seances = await response.json();

    // filtrer par film si filmId est fourni
    let filtered = seances;
    if (filmId) {
      filtered = seances.filter(s => s.film_id == filmId);
    }

    seancesList.innerHTML = "";

    if (filtered.length === 0) {
      seancesList.innerHTML = "<p>Aucune séance disponible</p>";
      return;
    }

    filtered.forEach(seance => {
      const div = document.createElement("div");
      div.classList.add("seance-card");

      div.innerHTML = `
        <div class="film-card">
          <h3>${seance.film ? seance.film.titre : 'Film inconnu'}</h3>
          <p><strong>Salle:</strong> ${seance.salle ? seance.salle.nom : 'Salle inconnue'}</p>
          <p><strong>Date:</strong> ${new Date(seance.dateHeure).toLocaleString('fr-FR')}</p>
          <p><strong>Prix:</strong> CA$ ${seance.prix}</p>
          <button onclick="reserver(${seance.id})" class="action-btn">🎫 Réserver</button>
        </div>
        <hr>
      `;

      seancesList.appendChild(div);
    });

  } catch (error) {
    console.error(error);
    seancesList.innerHTML = `<p>Erreur de chargement des séances: ${error.message}</p>`;
  }
};

const reserver = (seanceId) => {
  localStorage.setItem("selectedSeanceId", seanceId);
  window.location.href = `reservation-simple.html`;
};

const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "auth.html";
};

loadSeances();