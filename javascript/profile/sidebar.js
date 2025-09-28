const user = JSON.parse(localStorage.getItem("user"));

const welcomeMessage = document.getElementById("welcome-message");
const authButtons = document.getElementById("auth-buttons");

if (user && user.accessToken) {
  welcomeMessage.textContent = `Welcome, ${user.name || "User"}!`;

  authButtons.innerHTML = `<button id="logout-btn" class="button-blue">Logout</button>`;

  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.reload(); 
  });
} else {
  welcomeMessage.textContent = ""; 
  authButtons.innerHTML = ""; 
}
