import { pb } from "./auth.js";
import Toastify from "toastify-js";
import { renderHeader } from "./header.js";
import { getMonthlyData } from "./calc.js";

renderHeader();

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

  const inputAmount = parseFloat(financeForm.querySelector("#Amount").value);

  if (inputAmount <= 0) {
    Toastify({
      text: "Amount cannot be $0.00 or less!",
      duration: 3000,
      close: false,
      gravity: "top",
      position: "center",
      style: {
        padding: "5px 24px",
        background: "#ef4444",
        color: "#ffffff",
      },
    }).showToast();

    return;
  }

  try {
    const data = {
      user: pb.authStore.record.id,
      transaction_type: document.getElementById("transaction_type").value,
      category: document.getElementById("category").value,
      amount: parseFloat(document.getElementById("transactionAmount").value),
      date: new Date(document.getElementById("date").value).toISOString(),
      notes: document.getElementById("notes").value,
      recurring: document.getElementById("recurring").checked,
    };

    const record = await pb.collection("userData").create(data);
    financeForm.reset();

    Toastify({
      text: "Success! Record created.",
      duration: 3000,
      close: false,
      gravity: "top",
      position: "center",
      stopOnFocus: true,
      style: {
        padding: "5px 24px",
        color: "#fffbeb",
        background:
          "linear-gradient(to right, oklch(22.8% 0.013 107.4), oklch(73.7% 0.021 106.9))",
      },
    }).showToast();
  } catch (err) {
    console.error("Error creating record:", err.message);
    console.error(
      "Validation Details:",
      JSON.stringify(err.response?.data, null, 2),
    );
  }
});
