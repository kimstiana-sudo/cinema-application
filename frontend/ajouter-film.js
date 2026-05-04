const form = document.getElementById("filmForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titre = document.getElementById("titre").value;
  const genre = document.getElementById("genre").value;
  const duree_min = document.getElementById("duree").value;
  const classification = document.getElementById("classification").value;
  const sommaire = document.getElementById("resume").value;

  try {
    const response = await fetch("http://localhost:3000/api/films", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        titre,
        genre,
        duree_min,
        classification,
        sommaire,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      document.getElementById("message").textContent = "Film ajouté ✅";
      form.reset();
    } else {
      document.getElementById("message").textContent = data.message;
    }

  } catch (error) {
    document.getElementById("message").textContent = "Erreur serveur";
  }
});