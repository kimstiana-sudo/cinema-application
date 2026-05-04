const reservationsList = document.getElementById("reservationsList");
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!user || !token) {
  window.location.href = "auth.html";
}

const loadReservations = async () => {
  try {
    const response = await fetch("/api/reservations/user", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Impossible de charger les réservations");
    }

    const reservations = await response.json();

    reservationsList.innerHTML = "";

    if (reservations.length === 0) {
      reservationsList.innerHTML = "<p>Vous n'avez aucune réservation</p>";
      return;
    }

    reservations.forEach(reservation => {
      const div = document.createElement("div");
      div.classList.add("reservation-card");

      const dateReservation = new Date(reservation.date_reservation).toLocaleString('fr-FR');
      const dateSeance = new Date(reservation.seance.dateHeure).toLocaleString('fr-FR');

      let buttonsHtml = '';

      if (reservation.statut === 'CONFIRMEE') {
        buttonsHtml += `<button onclick="payer(${reservation.id})" class="action-btn">Payer</button>`;
        buttonsHtml += `<button onclick="modifier(${reservation.id})" class="action-btn">Modifier</button>`;
        buttonsHtml += `<button onclick="supprimer(${reservation.id})" class="action-btn delete-btn">Supprimer</button>`;
      } else if (reservation.statut === 'PAYEE') {
        buttonsHtml += `<span class="paid-badge">Payé</span>`;
      }

      div.innerHTML = `
        <div class="film-card">
          <h3>${reservation.seance.film.titre}</h3>
          <p><strong>Salle:</strong> ${reservation.seance.salle.nom}</p>
          <p><strong>Date de la séance:</strong> ${dateSeance}</p>
          <p><strong>Réservé le:</strong> ${dateReservation}</p>
          <p><strong>Places:</strong> ${reservation.places ? reservation.places.map(p => `Rang ${p.rang} - N°${p.numero}`).join(', ') : 'N/A'}</p>
          <p><strong>Statut:</strong> ${reservation.statut}</p>
          <div class="reservation-actions">
            ${buttonsHtml}
          </div>
        </div>
      `;

      reservationsList.appendChild(div);
    });

  } catch (error) {
    console.error("Erreur chargement réservations:", error);
    reservationsList.innerHTML = "<p>Erreur de chargement des réservations</p>";
  }
};

const payer = async (reservationId) => {
  // Rediriger vers la page de paiement
  window.location.href = `paiement.html?reservationId=${reservationId}`;
};

const modifier = async (reservationId) => {
  // Rediriger vers la page de modification
  window.location.href = `modifier-reservation.html?reservationId=${reservationId}`;
};

const supprimer = async (reservationId) => {
  // Rediriger vers la page de suppression
  window.location.href = `supprimer-reservation.html?reservationId=${reservationId}`;
};

const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "auth.html";
};

// Charger les réservations au démarrage
document.addEventListener("DOMContentLoaded", loadReservations);