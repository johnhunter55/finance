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

const records = await pb.collection("userData").getFullList({
  sort: "-category",
});

function graph() {
  const categoryTotals = records.reduce((totals, record) => {
    if (record.transaction_type === "Expenses") {
      if (!totals[record.category]) {
        totals[record.category] = 0;
      }

      totals[record.category] += record.amount;
    }

    return totals;
  }, {});

  console.log("My Category Totals:", categoryTotals);

  const graphCon = document.getElementById("graph");

  graphCon.innerHTML = Object.entries(categoryTotals)
    .map(
      ([category, total]) => `
      <div class="flex justify-between items-center p-3 bg-olive-800 text-amber-50 rounded-xl mb-2 hover:bg-olive-700 transition-all shadow-md">
        <span class="font-bold text-lg">${category}</span>
        <span class="text-red-400 font-medium">-$${total.toFixed(2)}</span>
      </div>
    `,
    )
    .join("");
}

var Highcharts = require("highcharts");
// Load module after Highcharts is loaded
require("highcharts/modules/exporting");
// Create the chart
Highcharts.chart("container", {
  /*Highcharts options*/
});

graph();
