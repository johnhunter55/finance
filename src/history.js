import { pb, handleLogout } from "./auth.js";
import "material-symbols/outlined.css";
import { renderHeader } from "./header.js";
import { getTotalIncome, getTotalExpense } from "./calc.js";

renderHeader();

const currentUser = pb.authStore.record;
const records = await pb.collection("userData").getFullList({
  sort: "-date",
  requestKey: null,
});

async function hStats() {
  const stats = document.getElementById("stats");

  const income = await getTotalIncome();
  const expense = await getTotalExpense();

  stats.innerHTML = `
  
      <div><h1>Income <span class="text-green-400">$${income.toFixed(2)}</span></h1></div>
      <div><h1>Expenses <span class="text-red-400">-$${expense.toFixed(2)}</span></h1></div>
    `;
}

hStats();

function historyList() {
  const listContainer = document.getElementById("transaction-list");
  listContainer.innerHTML = "";

  records.forEach((record) => {
    const isIncome = record.transaction_type === "Income";
    const amountColor = isIncome ? "text-green-400" : "text-red-400";
    const amountSign = isIncome ? "+" : "-";

    const rowHTML = `
      <div class="row-container bg-olive-900 p-4 py-3 odd:bg-olive-950/20 flex justify-between text-amber-50 border border-transparent hover:border-olive-800 transition-all hover:shadow-2xl relative hover:z-10" data-id="${record.id}">      
        <div class="flex flex-col gap-1">
          <span class="category-text w-fit font-bold text-xl/normal" data-val="${record.category}">${record.category}</span>
          <span class="date-text text-base/tight text-olive-300/80" data-val="${record.date.substring(0, 10)}">${new Date(record.date).toLocaleDateString()}</span>
          <span class="note-text text-sm/tight text-olive-300 italic" data-val="${record.notes || ""}">${record.notes || "No notes"}</span>
        </div>
        
        <div class="flex flex-col text-right">
          <span class="amount-text text-xl font-bold ${amountColor}" data-val="${record.amount}">
            ${amountSign}$${record.amount.toFixed(2)}
          </span>
          <span class="type-text text-sm text-olive-300 mb-1" data-val="${record.transaction_type}">${record.transaction_type}</span>
          <div>
            <button class="pt-1 text-right edit-btn text-olive-400 hover:text-white transition-all cursor-pointer">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button class="pt-1 text-right delete-btn text-olive-400 hover:text-red-400 transition-all cursor-pointer" data-id="${record.id}">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>
    `;

    listContainer.insertAdjacentHTML("beforeend", rowHTML);
  });
}

historyList();

function editHistory(button) {
  const row = button.closest(".row-container");

  const catSpan = row.querySelector(".category-text");
  const dateSpan = row.querySelector(".date-text");
  const noteSpan = row.querySelector(".note-text");
  const amountSpan = row.querySelector(".amount-text");
  const typeSpan = row.querySelector(".type-text");

  // Prevent double-clicking
  if (catSpan.querySelector("select")) return;

  // Grab the RAW values from our new data-val attributes
  const cat = catSpan.dataset.val;
  const date = dateSpan.dataset.val;
  const note = noteSpan.dataset.val;
  const amount = amountSpan.dataset.val;
  const type = typeSpan.dataset.val;

  // Swap everything into Inputs & Selects!
  catSpan.innerHTML = `
    <select class="edit-cat w-32 bg-olive-800 rounded px-1 focus:outline-none focus:ring-2 focus:ring-olive-500">
      <option value="Food" ${cat === "Food" ? "selected" : ""}>Food</option>
      <option value="Salary" ${cat === "Salary" ? "selected" : ""}>Salary</option>
      <option value="Rent" ${cat === "Rent" ? "selected" : ""}>Rent</option>
      <option value="Utilities" ${cat === "Utilities" ? "selected" : ""}>Utilities</option>
      <option value="Savings" ${cat === "Savings" ? "selected" : ""}>Savings</option>
      <option value="Transportation" ${cat === "Transportation" ? "selected" : ""}>Transportation</option>
      <option value="Entertainment" ${cat === "Entertainment" ? "selected" : ""}>Entertainment</option>
      <option value="Healthcare" ${cat === "Healthcare" ? "selected" : ""}>Healthcare</option>
      <option value="Shopping" ${cat === "Shopping" ? "selected" : ""}>Shopping</option>
      <option value="Insurance" ${cat === "Insurance" ? "selected" : ""}>Insurance</option>
      <option value="Education" ${cat === "Education" ? "selected" : ""}>Education</option>
      <option value="Debt" ${cat === "Debt" ? "selected" : ""}>Debt</option>
      <option value="Investments" ${cat === "Investments" ? "selected" : ""}>Investments</option>
      <option value="Other" ${cat === "Other" ? "selected" : ""}>Other</option>
    </select>`;

  dateSpan.innerHTML = `<input type="date" class="edit-date bg-olive-800 rounded px-1 focus:outline-none text-amber-50" value="${date}">`;
  noteSpan.innerHTML = `<input type="text" class="edit-note bg-olive-800 rounded px-1 w-full focus:outline-none text-amber-50" value="${note}" placeholder="Notes...">`;
  amountSpan.innerHTML = `<input type="number" step="0.01" class="edit-amount bg-olive-800 rounded px-1 w-24 text-right focus:outline-none text-amber-50" value="${amount}">`;

  typeSpan.innerHTML = `
    <select class="edit-type bg-olive-800 rounded px-1 focus:outline-none text-right">
      <option value="Expenses" ${type === "Expenses" ? "selected" : ""}>Expense</option>
      <option value="Income" ${type === "Income" ? "selected" : ""}>Income</option>
    </select>`;

  // Change button to Save
  button.classList.remove("edit-btn");
  button.classList.add("save-btn");
  button.innerHTML = `<span class="material-symbols-outlined text-green-400">check_circle</span>`;

  // Cancel button right next to the Save button
  button.insertAdjacentHTML(
    "afterend",
    `
    <button class="pt-1 text-right cancel-btn text-red-400 hover:text-red-600 transition-all cursor-pointer">
      <span class="material-symbols-outlined">cancel</span>
    </button>
  `,
  );
}
async function saveHistory(button) {
  const row = button.closest(".row-container");
  const recordId = row.dataset.id;

  // 1. Grab the original values from the hidden data-val attributes
  const catSpan = row.querySelector(".category-text");
  const dateSpan = row.querySelector(".date-text");
  const noteSpan = row.querySelector(".note-text");
  const amountSpan = row.querySelector(".amount-text");
  const typeSpan = row.querySelector(".type-text");

  const oldCat = catSpan.dataset.val;
  const oldDate = dateSpan.dataset.val;
  const oldNote = noteSpan.dataset.val;
  const oldAmount = parseFloat(amountSpan.dataset.val);
  const oldType = typeSpan.dataset.val;

  const newCat = row.querySelector(".edit-cat").value;
  const newDate = row.querySelector(".edit-date").value;
  const newNote = row.querySelector(".edit-note").value;
  const newAmount = parseFloat(row.querySelector(".edit-amount").value);
  const newType = row.querySelector(".edit-type").value;

  const updates = {};

  if (newCat !== oldCat) updates.category = newCat;
  if (newDate !== oldDate) updates.date = newDate + "T12:00:00.000Z";
  if (newNote !== oldNote) updates.notes = newNote;
  if (newAmount !== oldAmount) updates.amount = newAmount;
  if (newType !== oldType) updates.transaction_type = newType;

  // 4. Check if anything actually changed before talking to the database
  if (Object.keys(updates).length > 0) {
    try {
      // Send ONLY the specific fields inside our 'updates' package
      await pb.collection("userData").update(recordId, updates);
    } catch (error) {
      console.error("Full error:", error);

      // This is the magic line that asks PocketBase exactly what failed!
      console.error("PocketBase says:", error.response?.data);

      alert(
        "Save failed! Open your console to see which field PocketBase rejected.",
      );
      return;
    }
  }

  // 5. Update the UI back to normal text
  catSpan.dataset.val = newCat;
  catSpan.innerHTML = newCat;

  dateSpan.dataset.val = newDate;
  dateSpan.innerHTML = new Date(newDate + "T12:00:00Z").toLocaleDateString();

  noteSpan.dataset.val = newNote;
  noteSpan.innerHTML = newNote || "No notes";

  amountSpan.dataset.val = newAmount;
  const isIncome = newType === "Income";
  amountSpan.className = `amount-text text-xl font-bold ${isIncome ? "text-green-400" : "text-red-400"}`;
  amountSpan.innerHTML = `${isIncome ? "+" : "-"}$${newAmount.toFixed(2)}`;

  typeSpan.dataset.val = newType;
  typeSpan.innerHTML = newType;

  // Change button back to Edit
  button.classList.remove("save-btn");
  button.classList.add("edit-btn");
  button.innerHTML = `<span class="material-symbols-outlined">edit</span>`;

  const cancelBtn = row.querySelector(".cancel-btn");
  if (cancelBtn) cancelBtn.remove();
}

function cancelEdit(cancelBtn) {
  const row = cancelBtn.closest(".row-container");

  // Target all 5 spans
  const catSpan = row.querySelector(".category-text");
  const dateSpan = row.querySelector(".date-text");
  const noteSpan = row.querySelector(".note-text");
  const amountSpan = row.querySelector(".amount-text");
  const typeSpan = row.querySelector(".type-text");

  // Restore the original HTML using our hidden data-val attributes
  catSpan.innerHTML = catSpan.dataset.val;
  dateSpan.innerHTML = new Date(
    dateSpan.dataset.val + "T12:00:00Z",
  ).toLocaleDateString();
  noteSpan.innerHTML = noteSpan.dataset.val || "No notes";

  const amount = parseFloat(amountSpan.dataset.val);
  const type = typeSpan.dataset.val;
  const isIncome = type === "Income";

  amountSpan.innerHTML = `${isIncome ? "+" : "-"}$${amount.toFixed(2)}`;
  typeSpan.innerHTML = type;

  const saveBtn = row.querySelector(".save-btn");
  saveBtn.classList.remove("save-btn");
  saveBtn.classList.add("edit-btn");
  saveBtn.innerHTML = `<span class="material-symbols-outlined">edit</span>`;

  // Delete the Cancel button from the screen
  cancelBtn.remove();
}

const deleteModal = document.getElementById("doubleCheck");
let deleteId = null;
let deleteRow = null;

document.addEventListener("click", async (e) => {
  // Check for Edit
  const editBtn = e.target.closest(".edit-btn");
  if (editBtn) {
    editHistory(editBtn);
  }

  const saveBtn = e.target.closest(".save-btn");
  if (saveBtn) {
    await saveHistory(saveBtn);
    hStats();
  }

  //delete stuff
  const deleteBtn = e.target.closest(".delete-btn");
  if (deleteBtn) {
    deleteId = deleteBtn.dataset.id;
    deleteRow = deleteBtn.closest(".bg-olive-900");
    deleteModal.classList.remove("hidden");
    deleteModal.classList.add("flex");
    deleteModal.innerHTML = `
      <div class='bg-olive-800 p-10 rounded-xl shadow-2xl'>
        <h1 class='mb-8 font-bold text-lg text-amber-50'>Are you sure? This will permanently delete the entry.</h1>
        <div class='flex items-center'>
          <button id='cancel' class='cursor-pointer hover:bg-mist-950/80 hover:shadow-2xl p-2 px-4 bg-mist-900 rounded-2xl mr-5 text-amber-50'>Cancel</button>
          <button id='delete' class='cursor-pointer text-red-500 hover:text-red-800 text-lg font-medium'>Delete</button>
        </div>
      </div>`;
  }

  const cancelBtn = e.target.closest(".cancel-btn");
  if (cancelBtn) {
    cancelEdit(cancelBtn);
  }

  if (e.target.id === "cancel") {
    deleteModal.classList.add("hidden");
  }

  if (e.target.id === "delete" && deleteId) {
    await pb.collection("userData").delete(deleteId);
    if (deleteRow) deleteRow.remove();
    deleteModal.classList.add("hidden");
    hStats();
  }
});
