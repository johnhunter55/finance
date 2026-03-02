import { pb } from "./auth.js";

// const data = {
//   type: "expense",
//   category: "Food",
//   amount: 15.5,
//   date: "2026-03-02 10:00:00.000Z",
//   notes: "Lunch at McDonald's",
// };

import { handleLogin, handleSignup } from "./auth.js";

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const showSignup = document.getElementById("show-signup");
const showLogin = document.getElementById("show-login");

// --- UI TOGGLES ---
showSignup.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.style.display = "none";
  signupForm.style.display = "flex";
});

showLogin.addEventListener("click", (e) => {
  e.preventDefault();
  signupForm.style.display = "none";
  loginForm.style.display = "flex";
});

// --- FORM SUBMISSIONS ---
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("login-name").value; // Using your 'name' field as email
  const pass = document.getElementById("login-password").value;
  await handleLogin(name, pass);
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signup-name").value;
  const pass = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  if (pass !== confirm) return alert("Passwords do not match!");
  await handleSignup(name, email, pass, confirm);
});
