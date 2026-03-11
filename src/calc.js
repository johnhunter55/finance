import { pb } from "./auth.js";

export async function getTotalIncome() {
  try {
    const currentUserId = pb.authStore.record?.id;
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
    const currentUserId = pb.authStore.record?.id;
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

export async function getMonthlyData() {
  const userId = pb.authStore.record.id;

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastDay = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).toISOString();

  const thisMonthRecords = await pb.collection("userData").getFullList({
    filter: `user = "${userId}" && date >= "${firstDay}" && date <= "${lastDay}"`,
  });

  const monthlySpent = thisMonthRecords.reduce((total, record) => {
    return record.transaction_type === "Expenses"
      ? total + record.amount
      : total;
  }, 0);

  const budgetRecord = await pb
    .collection("budget")
    .getFullList({ filter: `idB = "${userId}"` });
  const budgetLimit = budgetRecord.length > 0 ? budgetRecord[0].number : 0;

  console.log(
    `You have spent $${monthlySpent} out of your $${budgetLimit} budget this month.`,
  );
}
