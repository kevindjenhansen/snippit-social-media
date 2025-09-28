const form = document.getElementById("registerForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    message.textContent = "Name can only contain letters, numbers, and underscores.";
    message.style.color = "red";
    return;
  }

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
    const response = await fetch("https://v2.api.noroff.dev/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      message.textContent = `Welcome, ${data.data.name}! The account was created successfully. Redirecting you to login...`;
      message.style.color = "green";

      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);

      form.reset();
    } else {
      const errorData = await response.json();
      message.textContent = errorData.errors?.[0]?.message || "Registration failed.";
      message.style.color = "red";
    }
  } catch (error) {
    message.textContent = "Network error. Please try again.";
    message.style.color = "red";
  }
});

