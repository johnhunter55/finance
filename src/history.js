import { pb, handleLogout } from "./auth.js";

if (!pb.authStore.isValid) {
  window.location.href = "/index.html";
}

const currentUser = pb.authStore.record;
const records = await pb.collection("userData").getFullList({
  sort: "-created",
});

document.getElementById("welcome-text").textContent =
  currentUser.name.charAt(0).toUpperCase() +
  currentUser.name.slice(1) +
  "'s history";

const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    handleLogout();
  });
}

// Grab the single container
const listContainer = document.getElementById("transaction-list");

// Clear it out so it doesn't duplicate if the function runs twice
listContainer.innerHTML = "";

// Loop through the array exactly once
records.forEach((record) => {
  // Determine if it's an expense or income for styling
  const isIncome = record.transaction_type === "Income";
  const amountColor = isIncome ? "text-green-400" : "text-red-400";
  const amountSign = isIncome ? "+" : "-";

  // Build the HTML row for this specific record using your Tailwind olive theme
  const rowHTML = `
    <div class="bg-olive-900 p-4 rounded-2xl flex justify-between items-center text-amber-50 border border-transparent hover:border-olive-800 transition-all">
      <div class="flex flex-col">
        <span class="font-bold text-lg">${record.category}</span>
        <span class="text-sm text-olive-300/80">${new Date(record.date).toLocaleDateString()}</span>
        ${record.notes ? `<span class="text-xs text-olive-300 mt-1 italic">${record.notes}</span>` : ""}
      </div>
      
      <div class="flex flex-col text-right">
        <span class="text-xl font-bold ${amountColor}">
          ${amountSign}$${record.amount.toFixed(2)}
        </span>
        <span class="text-sm text-olive-300">${record.transaction_type}</span>
      </div>
    </div>
  `;

  // Inject this new row into the bottom of the container
  listContainer.insertAdjacentHTML("beforeend", rowHTML);
});
