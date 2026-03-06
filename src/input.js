import { pb, handleLogout } from "./auth.js";
import Toastify from "toastify-js";
import { renderHeader } from "./header.js";

renderHeader();

const financeForm = document.getElementById("finance-form");

financeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const data = {
      user: pb.authStore.record.id,
      transaction_type: document.getElementById("transaction_type").value,
      category: document.getElementById("category").value,
      amount: parseFloat(document.getElementById("Amount").value), // Number conversion
      date: new Date(document.getElementById("date").value).toISOString(), // UTC format
      notes: document.getElementById("notes").value,
    };
    const record = await pb.collection("userData").create(data);
    financeForm.reset();
    Toastify({
      text: "Success! Record created.",
      duration: 3000,
      close: false, // Changed to true: Gives the user an "X" to click
      gravity: "top",
      position: "center",
      stopOnFocus: true,
      style: {
        padding: "5px 24px", // Increased from 2px so it doesn't look squished
        color: "#fffbeb", // amber-50 to match your text
        // FIXED: Added the missing closing parenthesis at the end of the gradient
        background:
          "linear-gradient(to right, oklch(22.8% 0.013 107.4), oklch(73.7% 0.021 106.9))",
      },
    }).showToast();
  } catch (err) {
    console.error("Error creating record:", err.message);
    // This will print the exact field errors in plain text:
    console.error(
      "Validation Details:",
      JSON.stringify(err.response.data, null, 2),
    );
  }
});
