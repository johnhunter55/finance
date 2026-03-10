import { pb, handleLogout } from "./auth.js";
import Toastify from "toastify-js";
import { renderHeader } from "./header.js";

renderHeader();

const financeForm = document.getElementById("finance-form");

financeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputAmount = parseFloat(document.getElementById("Amount").value);

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
      amount: inputAmount,
      date: new Date(document.getElementById("date").value).toISOString(),
      notes: document.getElementById("notes").value,
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
