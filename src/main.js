import { pb, handleLogout } from "./auth.js";

if (!pb.authStore.isValid) {
  window.location.href = "/index.html";
}

const currentUser = pb.authStore.model;
console.log("Logged in as:", currentUser.name);

document.getElementById("welcome-text").textContent =
  currentUser.name.charAt(0).toUpperCase() +
  currentUser.name.slice(1) +
  "'s transactions";

const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    handleLogout();
  });
}

// const data = {
//   type: "expense",
//   category: "Food",
//   amount: 15.5,
//   date: "2026-03-02 10:00:00.000Z",
//   notes: "Lunch at McDonald's",
// };
