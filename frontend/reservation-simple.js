const seanceInfo = document.getElementById("seanceInfo");
const placesContainer = document.getElementById("placesContainer");
const reservationForm = document.getElementById("reservationForm");
const messageDiv = document.getElementById("message");

const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");
const selectedSeanceId = localStorage.getItem("selectedSeanceId");

if (!user || !token) {
  window.location.href = "auth.html";
}

if (!selectedSeanceId) {
  window.location.href = "seances.html";
}

const showMessage = (text, isError = true) => {
  messageDiv.textContent = text;
  messageDiv.style.color = isError ? "red" : "green";
};

const loadSeance = async () => {
  try {
    const [seanceResponse, placesResponse] = await Promise.all([
      fetch(`/api/seances/${selectedSeanceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      fetch(`/api/places/disponibles/${selectedSeanceId}`),
    ]);

    if (!seanceResponse.ok) {
      const errorData = await seanceResponse.json().catch(() => ({}));
      throw new Error(errorData.message || "Impossible de charger la séance");
    }

    if (!placesResponse.ok) {
      const errorData = await placesResponse.json().catch(() => ({}));
      throw new Error(errorData.message || "Impossible de charger les places disponibles");
    }

    const seance = await seanceResponse.json();
    const places = await placesResponse.json();

    seanceInfo.innerHTML = `
      <h2>${seance.film ? seance.film.titre : "Séance"}</h2>
      <p><strong>Salle :</strong> ${seance.salle ? seance.salle.nom : "Inconnue"}</p>
      <p><strong>Date :</strong> ${new Date(seance.dateHeure).toLocaleString('fr-FR')}</p>
      <p><strong>Prix :</strong> CA$ ${seance.prix}</p>
    `;

    if (!places || places.length === 0) {
      placesContainer.innerHTML = "<p>Aucune place disponible pour cette séance.</p>";
      return;
    }

    placesContainer.innerHTML = "";
    places.forEach(place => {
      const label = document.createElement("label");
      label.className = "place-item";
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "place";
      checkbox.value = place.id;
      
      if (!place.disponible) {
        checkbox.disabled = true;
        label.classList.add("reserved");
      }
      
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(` Rang ${place.rang} - N°${place.numero}`));
      
      if (!place.disponible) {
        label.appendChild(document.createTextNode(" (Réservée)"));
      }
      
      placesContainer.appendChild(label);
    });
  } catch (error) {
    console.error(error);
    showMessage(error.message);
    seanceInfo.innerHTML = "";
    placesContainer.innerHTML = "";
  }
};

reservationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const selectedPlaces = Array.from(document.querySelectorAll("input[name=place]:checked")).map(input => Number(input.value));

  if (selectedPlaces.length === 0) {
    showMessage("Veuillez choisir au moins une place.");
    return;
  }

  try {
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        seance_id: Number(selectedSeanceId),
        place_ids: selectedPlaces,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Erreur lors de la réservation");
    }

    localStorage.removeItem("selectedSeanceId");
    showMessage("Réservation réussie !", false);
    setTimeout(() => {
      window.location.href = "reservation.html";
    }, 1200);
  } catch (error) {
    console.error(error);
    showMessage(error.message);
  }
});

const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "auth.html";
};

loadSeance();