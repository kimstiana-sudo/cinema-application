const filmsList = document.getElementById("filmsList");
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "auth.html";
}

const roleId = user.roleId ?? user.role?.id;

const loadFilms = async () => {
  try {
    const response = await fetch("/api/films");
    const films = await response.json();

    filmsList.innerHTML = "";

    films.forEach(film => {
      const div = document.createElement("div");
      div.classList.add("film-card");

      let html = `
        <h3>${film.titre}</h3>
        <p>${film.genre}</p>
      `;

      if (roleId == 1) {
        html += `
          <button onclick="voirSeances(${film.id})">Voir séances</button>
          <button onclick="voirDetail(${film.id})">Voir détail</button>
        `;
      }

      if (roleId == 2 || roleId == 3) {
        html += `
          <button onclick="modifier(${film.id})">Modifier</button>
          <button onclick="supprimer(${film.id})">Supprimer</button>
        `;
      }

      div.innerHTML = html;
      filmsList.appendChild(div);
    });

  } catch (error) {
    console.log(error);
  }
};

const voirDetail = (id) => {
  window.location.href = `film-detail.html?id=${id}`;
};
const voirSeances = (id) => {
  window.location.href = `seances.html?film_id=${id}`;
};
const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "auth.html";
};

loadFilms();