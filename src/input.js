import { pb } from "./auth.js";
import Toastify from "toastify-js";
import { renderHeader } from "./header.js";
import { getMonthlyData, syncRecurringTransactions } from "./calc.js";

renderHeader();
syncRecurringTransactions();

const budgetInput = document.getElementById("budgetAmount");
const budgetToggle = document.getElementById("budgetToggle");

let currentBudgetId = null;

async function loadBudget() {
  if (!pb.authStore.isValid || !budgetInput) return;

  try {
    const existingBudget = await pb.collection("budget").getFullList({
      filter: `idB = "${pb.authStore.record.id}"`,
      requestKey: null,
    });

    if (existingBudget.length > 0) {
      const budget = existingBudget[0];
      currentBudgetId = budget.id;

      budgetInput.value = budget.number;
      budgetToggle.checked = budget.active;
    }
  } catch (error) {
    console.error("Failed to load budget", error);
  }
}

loadBudget();

budgetToggle.addEventListener("change", async (e) => {
  const isChecked = e.target.checked;
  const amount = parseFloat(budgetInput.value);
  if (isChecked && (!amount || amount <= 0)) {
    alert("Please enter a valid budget amount first!");
    budgetToggle.checked = false;
    return;
  }

  const data = {
    number: amount,
    idB: pb.authStore.record.id,
    active: isChecked,
  };

  try {
    if (currentBudgetId) {
      await pb.collection("budget").update(currentBudgetId, data);
    } else {
      const newBudget = await pb.collection("budget").create(data);
      currentBudgetId = newBudget.id;
    }
  } catch (error) {
    console.error("Failed to save budget", error);
    alert("Failed to save. Check the console.");
    budgetToggle.checked = !isChecked;
  }
});

budgetInput.addEventListener("change", async () => {
  if (budgetToggle.checked && currentBudgetId) {
    await pb.collection("budget").update(currentBudgetId, {
      number: parseFloat(budgetInput.value),
    });
  }
});

const financeForm = document.getElementById("finance-form");

document.getElementById("notes").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    financeForm.requestSubmit();
  }
});

financeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const amountValue = parseFloat(document.getElementById("Amount").value);
  const dateValue = document.getElementById("date").value;

  if (isNaN(amountValue) || amountValue <= 0) {
    Toastify({
      text: "Amount cannot be $0.00 or less!",
      duration: 3000,
      close: false,
      gravity: "top",
      position: "center",
      style: { padding: "5px 24px", background: "#ef4444", color: "#ffffff" },
    }).showToast();
    return; // Stop here if invalid
  }

  if (!dateValue) {
    Toastify({
      text: "Please select a valid date!",
      duration: 3000,
      gravity: "top",
      position: "center",
      style: { padding: "5px 24px", background: "#ef4444", color: "#ffffff" },
    }).showToast();
    return;
  }

  try {
    const data = {
      user: pb.authStore.record.id,
      transaction_type: document.getElementById("transaction_type").value,
      category: document.getElementById("category").value,
      amount: amountValue,
      date: new Date(dateValue).toISOString(),
      notes: document.getElementById("notes").value,
      recurring: document.getElementById("recurring").checked,
    };

    await pb.collection("userData").create(data);

    financeForm.reset();

    const totals = await getMonthlyData();

    if (
      totals &&
      totals.budgetLimit > 0 &&
      data.transaction_type === "Expenses"
    ) {
      const { monthlySpent, budgetLimit } = totals;
      const percentageSpent = (monthlySpent / budgetLimit) * 100;

      if (monthlySpent > budgetLimit) {
        Toastify({
          text: `🚨 Over Budget! You are $${(monthlySpent - budgetLimit).toFixed(2)} over your limit.`,
          duration: 5000,
          gravity: "top",
          position: "center",
          style: {
            background: "#dc2626",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
          },
        }).showToast();
        return;
      } else if (percentageSpent >= 85) {
        Toastify({
          text: `⚠️ Heads up: You've used ${percentageSpent.toFixed(0)}% of your monthly budget.`,
          duration: 5000,
          gravity: "top",
          position: "center",
          style: {
            background: "#f97316",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
          },
        }).showToast();
        return;
      }
    }

    // 8. Normal Success Message
    Toastify({
      text: "Success! Record created.",
      duration: 3000,
      close: false,
      gravity: "top",
      position: "center",
      style: {
        padding: "5px 24px",
        color: "#fffbeb",
        background:
          "linear-gradient(to right, oklch(22.8% 0.013 107.4), oklch(73.7% 0.021 106.9))",
      },
    }).showToast();
  } catch (err) {
    console.error("Error creating record:", err);
    // Show a popup if the database fails so you don't have to check the console
    Toastify({
      text: `Error: ${err.message || "Failed to save to database."}`,
      duration: 4000,
      gravity: "top",
      position: "center",
      style: {
        background: "#ef4444",
        color: "#ffffff",
        padding: "12px 24px",
        borderRadius: "8px",
      },
    }).showToast();
  }
});
