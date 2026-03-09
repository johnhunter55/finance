import { pb, handleLogout } from "./auth.js";
import "material-symbols/outlined.css";
import { renderHeader } from "./header.js";

renderHeader();

const currentUser = pb.authStore.record;
const records = await pb.collection("userData").getFullList({
  sort: "-created",
});

function historyList() {
  const listContainer = document.getElementById("transaction-list");
  listContainer.innerHTML = ""; // Clear out any old data first

  // Loop through every single record in the array
  records.forEach((record) => {
    // Note: We use 'record' (singular) here, not 'records'
    const isIncome = record.transaction_type === "Income";
    const amountColor = isIncome ? "text-green-400" : "text-red-400";
    const amountSign = isIncome ? "+" : "-";

    const rowHTML = `
      <div class="row-container bg-olive-900 p-4 py-3 odd:bg-olive-950/20 flex justify-between text-amber-50 border border-transparent hover:border-olive-800 transition-all hover:shadow-2xl relative hover:z-10" data-id="${record.id}">      
        <div class="flex flex-col">
          <span class="category-text w-fit font-bold text-xl/normal cursor-pointer hover:text-olive-300">${record.category}</span>
          <span class="cursor-pointer date-text text-base/tight text-olive-300/80">${new Date(record.date).toLocaleDateString()}</span>
          ${record.notes ? `<span class="note-text text-sm/tight text-olive-300 mt-1 italic">${record.notes}</span>` : ""}
        </div>
        
        <div class="flex flex-col text-right">
          <span class="text-xl font-bold ${amountColor}">
            ${amountSign}$${record.amount.toFixed(2)}
          </span>
          <span class="text-sm text-olive-300">${record.transaction_type}</span>
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

function editHistory() {
  const listContainer = document.getElementById("transaction-list");
}

const deleteModal = document.getElementById("doubleCheck");
let deleteId = null;
let deleteRow = null;

document.addEventListener("click", async (e) => {
  const editBtn = e.target.closest(".edit-btn");
  if (editBtn) {
    const row = editBtn.closest(".row-container");
    const categorySpan = row.querySelector(".category-text");

    const currentCategory = categorySpan.innerText.trim();
    categorySpan.innerHTML = `
      <select class="category-select w-32 cursor-pointer bg-olive-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-800 focus:border-transparent transition-all text-amber-50 p-1">
        <option value="Food" ${currentCategory === "Food" ? "selected" : ""}>Food</option>
        <option value="Salary" ${currentCategory === "Salary" ? "selected" : ""}>Salary</option>
        <option value="Rent" ${currentCategory === "Rent" ? "selected" : ""}>Rent</option>
        <option value="Utilities" ${currentCategory === "Utilities" ? "selected" : ""}>Utilities</option>
        <option value="Savings" ${currentCategory === "Savings" ? "selected" : ""}>Savings</option>
      </select>
    `;

    editBtn.classList.remove("edit-btn");
    editBtn.classList.add("save-btn");
    editBtn.innerHTML = `<span class="material-symbols-outlined text-green-400">check_circle</span>`;
  }

  const saveBtn = e.target.closest(".save-btn");
  if (saveBtn) {
    const row = saveBtn.closest(".row-container");
    const recordId = row.dataset.id;
    const selectDropdown = row.querySelector(".category-select");

    const newCategory = selectDropdown.value;

    try {
      await pb
        .collection("userData")
        .update(recordId, { category: newCategory });
      const categorySpan = row.querySelector(".category-text");
      categorySpan.innerHTML = newCategory;
      saveBtn.classList.remove("save-btn");
      saveBtn.classList.add("edit-btn");
      saveBtn.innerHTML = `<span class="material-symbols-outlined">edit</span>`;
    } catch (error) {
      console.error("Failed to update:", error);
      alert("Failed to save changes. Check console for details.");
    }
  }
  //   if (dateSpan) {
  //     if (dateSpan.querySelector("input")) return;

  //     const row = dateSpan.closest(".row-container");
  //     const recordId = row.dataset.id;
  //     const originalDate = dateSpan.innerText;

  //     dateSpan.innerHTML = `
  //      <input
  //        type="datetime-local"
  //        id="date"
  //        class="cursor-text w-55 px-1 bg-olive-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-800 focus:border-transparent transition-all scheme-dark"
  //        required
  //      />`;
  //     const date = dateSpan.querySelector("input");
  //     date.focus();

  //     date.addEventListener("change", async () => {
  //       try {
  //         const newDateObj = new Date(date.value);
  //         const newDateISO = newDateObj.toISOString();

  //         dateSpan.innerHTML = newDateObj.toLocaleDateString();

  //         // Update Database
  //         await pb.collection("userData").update(recordId, { date: newDateISO });
  //       } catch (error) {
  //         console.error("Failed to update:", error);
  //         // Revert on failure
  //         dateSpan.innerHTML = originalDate;
  //       }
  //     });
  //   }

  //    if (noteSpan) {
  //     if (noteSpan.querySelector("select")) return;

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

  // Note: Fixed the 'cancle' typo to 'cancel' here and in the HTML above!
  if (e.target.id === "cancel") {
    deleteModal.classList.add("hidden");
  }

  if (e.target.id === "delete" && deleteId) {
    await pb.collection("userData").delete(deleteId); // Added await
    if (deleteRow) deleteRow.remove();
    deleteModal.classList.add("hidden");
  }
});
