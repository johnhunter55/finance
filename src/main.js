import { pb, handleLogout } from "./auth.js";
import { getTotalIncome, getTotalExpense } from "./calc.js";
import { renderHeader } from "./header.js";

renderHeader();

const income = document.getElementById("income");
const expenses = document.getElementById("expenses");
const balance = document.getElementById("balance");

income.textContent = "$ " + (await getTotalIncome());
expenses.textContent = "$ " + (await getTotalExpense());
balance.textContent =
  "$ " + ((await getTotalIncome()) - (await getTotalExpense()));
