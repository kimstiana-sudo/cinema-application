// LOGIN
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/connexion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      window.location.href = "index.html";
    } else {
      document.getElementById("message").textContent = data.message || "Erreur de connexion";
      document.getElementById("message").style.color = "red";
    }
  } catch (error) {
    console.error("Erreur connexion:", error);
    document.getElementById("message").textContent = "Erreur de réseau";
    document.getElementById("message").style.color = "red";
  }
});

// REGISTER
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nom = document.getElementById("nom").value;
  const prenom = document.getElementById("prenom").value;
  const email = document.getElementById("emailRegister").value;
  const password = document.getElementById("passwordRegister").value;

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nom, prenom, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById("message").textContent = "✅ Compte créé avec succès ! Vous pouvez maintenant vous connecter.";
      document.getElementById("message").style.color = "green";
      document.getElementById("registerForm").reset();
    } else {
      document.getElementById("message").textContent = data.message || "Erreur lors de l'inscription";
      document.getElementById("message").style.color = "red";
    }
  } catch (error) {
    console.error("Erreur inscription:", error);
    document.getElementById("message").textContent = "Erreur de réseau";
    document.getElementById("message").style.color = "red";
  }
});