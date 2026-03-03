import { pb } from "./auth.js";

const form = document.getElementById("finance-form");

// form.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const data = {
//     type: document.getElementById("type").value,
//     category: document.getElementById("category").value,
//     amount: parseFloat(document.getElementById("amount").value),
//     date: new Date(document.getElementById("date").value).toISOString(),
//     notes: document.getElementById("notes").value,
//   };

//   await pb.collection("userData").create(data);

//   console.log("Sending to PocketBase:", data);
// });

const records = await pb.collection("userData").getFullList({
  sort: "-created",
});

export async function getTotalIncome() {
  try {
    const incomeRecords = await pb.collection("userData").getFullList({
      filter: 'transaction_type = "Income"',
    });

    const total = incomeRecords.reduce((sum, record) => {
      return sum + record.Amount;
    }, 0);

    console.log(`Total Income: $${total.toFixed(2)}`);
    return total;
  } catch (err) {
    console.error("Error calculating income:", err.message);
  }
}

export async function getTotalExpense() {
  try {
    const expenseRecords = await pb.collection("userData").getFullList({
      filter: 'transaction_type = "expenses"',
    });

    const total = expenseRecords.reduce((sum, record) => {
      return sum + record.Amount;
    }, 0);

    console.log(`Total expense: $${total.toFixed(2)}`);
    return total;
  } catch (err) {
    console.error("Error calculating income:", err.message);
  }
}

export function income() {}
