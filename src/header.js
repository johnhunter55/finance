import { pb, handleLogout } from "./auth.js";

export function renderHeader() {
  if (!pb.authStore.isValid) {
    window.location.href = "/index.html";
    return;
  }

  const currentUser = pb.authStore.record;

  const header = document.querySelector("header");
  header.innerHTML = `
    <div class="flex justify-between items-center bg-olive-950/50">
      <h1 id="welcome-text" class="text-2xl pl-5">Loading...</h1>
      <button
        id="logout-btn"
        class="ml-auto bg-olive-800/50 p-2 px-6 m-2 rounded-2xl text-xl hover:bg-olive-800 hover:shadow-2xl cursor-pointer transition-all duration-200"
      >
        Logout
      </button>
    </div>
    <div class="p-3 flex gap-2">
      <a id="nav-dashboard" href="dashboard.html" class="bg-olive-800 p-1 px-4 rounded-2xl text-lg hover:bg-olive-700/50 hover:shadow-lg cursor-pointer transition-all duration-200">Dashboard</a>
      <a id="nav-transactions" href="transactions.html" class="bg-olive-800 p-1 px-4 rounded-2xl text-lg hover:bg-olive-700/50 hover:shadow-lg cursor-pointer transition-all duration-200">Transactions</a>
      <a id="nav-history" href="history.html" class="bg-olive-800 p-1 px-4 rounded-2xl text-lg hover:bg-olive-700/50 hover:shadow-lg cursor-pointer transition-all duration-200">History</a>
    </div>
  `;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleLogout();
    });
  }

  const currentPath = window.location.pathname;
  const welcomeText = document.getElementById("welcome-text");

  const formattedName =
    currentUser.name.charAt(0).toUpperCase() + currentUser.name.slice(1);

  function highlightNav(linkId) {
    const activeLink = document.getElementById(linkId);
    if (activeLink) {
      activeLink.classList.remove("bg-olive-800", "hover:bg-olive-700/50");
      activeLink.classList.add("bg-olive-400", "text-mauve-900");
    }
  }

  if (currentPath.includes("dashboard.html")) {
    welcomeText.textContent = `${formattedName}'s Dashboard`;
    highlightNav("nav-dashboard");
  } else if (currentPath.includes("history.html")) {
    welcomeText.textContent = `${formattedName}'s History`;
    highlightNav("nav-history");
  } else if (currentPath.includes("transactions.html")) {
    welcomeText.textContent = "Update Records";
    highlightNav("nav-transactions");
  }
}
