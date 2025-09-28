const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email.endsWith("@stud.noroff.no")) {
    message.textContent = "Email must be a valid stud.noroff.no address.";
    message.style.color = "red";
    return;
  }

  if (password.length < 8) {
    message.textContent = "Password must be at least 8 characters.";
    message.style.color = "red";
    return;
  }

  try {
    const response = await fetch("https://v2.api.noroff.dev/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      message.textContent = `Welcome back, ${data.data.name}! Redirecting...`;
      message.style.color = "green";

      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.data));

      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);

      form.reset();
    } else {
      const errorData = await response.json();
      message.textContent = errorData.errors?.[0]?.message || "Login failed.";
      message.style.color = "red";
    }
  } catch (error) {
    message.textContent = "Network error. Please try again.";
    message.style.color = "red";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.getElementById("registerBtn");
  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      window.location.href = "register.html";
    });
  }
});
