import PocketBase from "pocketbase";
export const pb = new PocketBase("https://fpocketbase.john5bb.com");

if (
  pb.authStore.isValid &&
  (window.location.pathname === "/" ||
    window.location.pathname === "/index.html")
) {
  window.location.href = "/transactions.html";
}

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const showSignup = document.getElementById("show-signup");
const showLogin = document.getElementById("show-login");

// --- UI TOGGLES ---
if (loginForm && signupForm) {
  showSignup.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    signupForm.style.display = "flex";
  });

  showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    signupForm.style.display = "none";
    loginForm.style.display = "flex";
  });

  // --- FORM SUBMISSIONS ---
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("login-name").value;
    const pass = document.getElementById("login-password").value;
    await handleLogin(name, pass);
  });

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signup-name").value;
    const pass = document.getElementById("signup-password").value;
    const confirm = document.getElementById("signup-confirm").value;
    await handleSignup(name, pass, confirm);
  });
}
async function handleSignup(name, pass, confirm) {
  const signUpError = document.getElementById("signup-error");
  if (signUpError) signUpError.style.display = "none";

  // 1. Check if passwords match before calling the database
  if (pass !== confirm) {
    if (signUpError) {
      signUpError.innerText = "Passwords do not match!";
      signUpError.style.display = "block";
    }
    return; // Stop the function here
  }

  try {
    const dummyEmail = name.replace(/\s/g, "").toLowerCase() + "@app.local";

    const data = {
      name: name,
      email: dummyEmail,
      password: pass,
      passwordConfirm: confirm,
    };

    await pb.collection("users").create(data);
    await handleLogin(name, pass);
  } catch (error) {
    if (signUpError) {
      signUpError.innerText =
        error.message || "Signup failed. Please try again.";
      signUpError.style.display = "block";
    }
  }
}

async function handleLogin(name, password) {
  const loginError = document.getElementById("login-error");
  if (loginError) loginError.style.display = "none";

  try {
    const dummyEmail = name.replace(/\s/g, "").toLowerCase() + "@app.local";
    const authData = await pb
      .collection("users")
      .authWithPassword(dummyEmail, password);

    window.location.href = "/transactions.html";
  } catch (error) {
    if (loginError) loginError.style.display = "block";
  }
}

export function handleLogout() {
  pb.authStore.clear();
  window.location.href = "/index.html";
}
