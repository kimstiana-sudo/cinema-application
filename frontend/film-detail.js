const filmDetail = document.getElementById("filmDetail");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const loadFilm = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/films/${id}`);
    const film = await response.json();

    filmDetail.innerHTML = `
      <h2>${film.titre}</h2>
      <p><strong>Genre :</strong> ${film.genre}</p>
      <p><strong>Durée :</strong> ${film.duree_min} min</p>
      <p><strong>Classification :</strong> ${film.classification}</p>
      <p>${film.sommaire}</p>
    `;
  } catch (error) {
    console.log(error);
  }
};

const deleteFilm = async () => {
  if (!confirm("Supprimer ce film ?")) return;

  try {
    await fetch(`http://localhost:3000/api/films/${id}`, {
      method: "DELETE",
    });

    alert("Film supprimé");
    window.location.href = "films.html";
  } catch (error) {
    console.log(error);
  }
};

loadFilm();