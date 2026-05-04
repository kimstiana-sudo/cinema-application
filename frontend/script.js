const loginForm = document.getElementById("loginForm");
const profileForm = document.getElementById("profileForm");
const logoutBtn = document.getElementById("logoutBtn");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:3000/api/connexion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "profil.html";
      } else {
        document.getElementById("message").textContent = data.message;
      }
    } catch (error) {
      document.getElementById("message").textContent = "Erreur serveur";
    }
  });
}

if (profileForm) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "connexion.html";
  }

  document.getElementById("nom").value = user.nom;
  document.getElementById("prenom").value = user.prenom;
  document.getElementById("email").value = user.email;
  document.getElementById("max_reservations").value = user.max_reservations || 5;

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nom = document.getElementById("nom").value;
    const prenom = document.getElementById("prenom").value;
    const email = document.getElementById("email").value;
    const max_reservations = document.getElementById("max_reservations").value;

    try {
      const response = await fetch(`http://localhost:3000/api/profile/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom,
          prenom,
          email,
          max_reservations: parseInt(max_reservations)
        }),
      });

      const data=await response.json();

      if(response.ok){
        localStorage.setItem("user",JSON.stringify(data.user));
        document.getElementById("message").textContent=data.message;
        }
    }catch(error){
        document.getElementById("message").textContent="Erreur de mise a jour";
    }
  });
}
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "connexion.html";
  });
}