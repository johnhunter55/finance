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
  if (!pb.authStore.isValid || !pb.authStore.record) {
    return null;
  }

  const userId = pb.authStore.record.id;
  const now = new Date();

  // 1. Fix the Timezone Trap by building exact UTC strings
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const firstDayOfThisMonth = `${year}-${month}-01 00:00:00.000Z`;

  const nextMonthDate = new Date(year, now.getMonth() + 1, 1);
  const nextYear = nextMonthDate.getFullYear();
  const nextMonth = String(nextMonthDate.getMonth() + 1).padStart(2, "0");
  const firstDayOfNextMonth = `${nextYear}-${nextMonth}-01 00:00:00.000Z`;

  try {
    const thisMonthRecords = await pb.collection("userData").getFullList({
      filter: `user = "${userId}" && date >= "${firstDayOfThisMonth}" && date < "${firstDayOfNextMonth}"`,
    });

    const monthlySpent = thisMonthRecords.reduce((total, record) => {
      // 2. Fix Case Sensitivity
      const type = (record.transaction_type || "").toLowerCase();

      if (type === "expenses") {
        // 3. Fix negative number bugs by forcing absolute values
        return total + Math.abs(record.amount || 0);
      }
      return total;
    }, 0);

    let budgetLimit = 0;
    try {
      const budgetRecord = await pb
        .collection("budget")
        .getFirstListItem(`idB = "${userId}"`);
      budgetLimit = budgetRecord.number || 0;
    } catch (err) {
      // Safely ignore if no budget is found
    }

    console.log(
      `You have spent $${monthlySpent} out of your $${budgetLimit} budget this month.`,
    );

    return { monthlySpent, budgetLimit };
  } catch (error) {
    console.error("Error fetching monthly data from PocketBase:", error);
    return null;
  }
}

export async function syncRecurringTransactions() {
  // 1. Security Check
  if (!pb.authStore.isValid || !pb.authStore.record) return;
  const userId = pb.authStore.record.id;
  const now = new Date();

  // 2. Safely calculate the start and end of the current month
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const startOfMonth = `${year}-${month}-01 00:00:00.000Z`;

  const nextMonthDate = new Date(year, now.getMonth() + 1, 1);
  const nextYear = nextMonthDate.getFullYear();
  const nextMonthStr = String(nextMonthDate.getMonth() + 1).padStart(2, "0");
  const endOfMonth = `${nextYear}-${nextMonthStr}-01 00:00:00.000Z`;

  try {
    // 3. Find ONLY the "original" transactions where the user checked the recurring box
    const recurringBaseRecords = await pb.collection("userData").getFullList({
      filter: `user = "${userId}" && recurring = true`,
    });

    for (const baseRecord of recurringBaseRecords) {
      const baseDate = new Date(baseRecord.date);

      // If the original record was created THIS month, we don't need to copy it yet
      if (
        baseDate.getFullYear() === now.getFullYear() &&
        baseDate.getMonth() === now.getMonth()
      ) {
        continue;
      }

      // 4. Calculate the target date for this month (keeps the exact same day/time)
      const targetDate = new Date(
        Date.UTC(
          now.getFullYear(),
          now.getMonth(),
          baseDate.getUTCDate(),
          baseDate.getUTCHours(),
          baseDate.getUTCMinutes(),
        ),
      );
      const targetDateString = targetDate.toISOString().replace("T", " ");

      // 5. Look to see if we ALREADY generated this exact record for this month
      // We check for recurring = false so it doesn't trigger future loops
      const existingCopies = await pb.collection("userData").getFullList({
        filter: `user = "${userId}" && category = "${baseRecord.category}" && amount = ${baseRecord.amount} && recurring = false && date >= "${startOfMonth}" && date < "${endOfMonth}"`,
      });

      // 6. If no copy exists, create it silently in the background!
      if (existingCopies.length === 0) {
        console.log(
          `Generating recurring ${baseRecord.transaction_type} for ${baseRecord.category}...`,
        );

        await pb.collection("userData").create({
          user: userId,
          transaction_type: baseRecord.transaction_type,
          category: baseRecord.category,
          amount: baseRecord.amount,
          date: targetDateString,
          notes: `[Auto] ${baseRecord.notes}`,
          recurring: false, // CRITICAL: We set the clone to false!
        });
      }
    }
  } catch (error) {
    console.error("Failed to sync recurring transactions:", error);
  }
}
