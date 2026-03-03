import { pb, handleLogout } from "./auth.js";
import { getTotalIncome, getTotalExpense } from "./calc.js";

if (!pb.authStore.isValid) {
  window.location.href = "/index.html";
}

const currentUser = pb.authStore.record;

document.getElementById("welcome-text").textContent =
  currentUser.name.charAt(0).toUpperCase() +
  currentUser.name.slice(1) +
  "'s dashboard";

const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    handleLogout();
  });
}

const income = document.getElementById("income");
const expenses = document.getElementById("expenses");
const balance = document.getElementById("balance");

income.textContent = "$ " + (await getTotalIncome());
expenses.textContent = "$ " + (await getTotalExpense());
balance.textContent =
  "$ " + ((await getTotalIncome()) - (await getTotalExpense()));
