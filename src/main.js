import { pb, handleLogout } from "./auth.js";
import { getTotalIncome, getTotalExpense } from "./calc.js";
import { renderHeader } from "./header.js";
import Highcharts from "highcharts";

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
      if (!totals[record.category]) totals[record.category] = 0;

      totals[record.category] += parseFloat(record.amount);
    }
    return totals;
  }, {});

  // 2. Format the data perfectly for Highcharts
  const chartData = Object.entries(categoryTotals).map(
    ([categoryName, totalAmount]) => {
      return {
        name: categoryName,
        y: totalAmount,
      };
    },
  );

  Highcharts.chart("expense-chart", {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
    },
    title: {
      text: "Expenses by Category",
      style: { color: "#fef3c7" },
    },
    plotOptions: {
      pie: {
        innerSize: "35%",
        borderWidth: 3,
        borderColor: "#273123",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>: ${point.y:.2f}",
          color: "#fef3c7",
        },
      },
    },
    series: [
      {
        name: "Amount Spent",
        data: chartData,
      },
    ],
  });
}

graph();
