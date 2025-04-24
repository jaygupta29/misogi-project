import './developer.js';
import './manager.js';

const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");
const developerSection = document.getElementById("developerSection");
const managerSection = document.getElementById("managerSection");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const showRegisterBtn = document.getElementById("showRegisterBtn");
const showLoginBtn = document.getElementById("showLoginBtn");

const logoutBtns = document.querySelectorAll(".logoutBtn");

// Simulated token with expiry
function createToken(username, role) {
  const payload = { username, role, exp: Date.now() + 60 * 60 * 1000 };
  return btoa(JSON.stringify(payload));
}

export function getToken() {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  try {
    const decoded = JSON.parse(atob(token));
    if (Date.now() > decoded.exp) {
      localStorage.removeItem("auth_token");
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

function loadDashboard(role) {
  loginSection.classList.add("hidden");
  registerSection.classList.add("hidden");

  if (role === "developer") {
    developerSection.classList.remove("hidden");
  } else {
    managerSection.classList.remove("hidden");
  }
}

loginBtn.addEventListener("click", () => {
  const username = document.getElementById("loginUsername").value.trim();
  const role = document.getElementById("loginRole").value;

  const users = JSON.parse(localStorage.getItem("devlog_users")) || [];
  const userExists = users.find(u => u.username === username && u.role === role);
  if (!userExists) return alert("Invalid credentials");

  const token = createToken(username, role);
  localStorage.setItem("auth_token", token);
  loadDashboard(role);
});

registerBtn.addEventListener("click", () => {
  const username = document.getElementById("registerUsername").value.trim();
  const role = document.getElementById("registerRole").value;

  if (!username) return alert("Enter a username");

  const users = JSON.parse(localStorage.getItem("devlog_users")) || [];
  const exists = users.find(u => u.username === username);
  if (exists) return alert("Username already exists");

  users.push({ username, role });
  localStorage.setItem("devlog_users", JSON.stringify(users));

  alert("Account created! You can now log in.");
  registerSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
});

logoutBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    localStorage.removeItem("auth_token");
    location.reload();
  });
});

showRegisterBtn.addEventListener("click", () => {
  loginSection.classList.add("hidden");
  registerSection.classList.remove("hidden");
});

showLoginBtn.addEventListener("click", () => {
  registerSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
});

// On load
const token = getToken();
if (!token) {
  document.getElementById("loginSection").classList.remove("hidden");
} else {
  loadDashboard(token.role); // your existing function
}
