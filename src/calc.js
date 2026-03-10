import { pb } from "./auth.js";

const currentUserId = pb.authStore.record.id;

export async function getTotalIncome() {
  try {
    const incomeRecords = await pb.collection("userData").getFullList({
      filter: `transaction_type = "Income" && user = "${currentUserId}"`,
    });

    const total = incomeRecords.reduce((sum, record) => {
      return sum + record.amount;
    }, 0);
    return total;
  } catch (err) {
    console.error("Error calculating income:", err.message);
  }
}

export async function getTotalExpense() {
  try {
    const expenseRecords = await pb.collection("userData").getFullList({
      filter: `transaction_type = "Expenses" && user = "${currentUserId}"`,
    });

    const total = expenseRecords.reduce((sum, record) => {
      return sum + record.amount;
    }, 0);
    return total;
  } catch (err) {
    console.error("Error calculating expenses:", err.message);
  }
}
