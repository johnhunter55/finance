import PocketBase from "pocketbase";
export const pb = new PocketBase("https://fpocketbase.john5bb.com");

if (pb.authStore.isValid) {
  window.location.href = "/transactions.html";
}

export async function handleSignup(name, password, passwordConfirm) {
  try {
    const data = {
      name: name,
      password: password,
      passwordConfirm: passwordConfirm,
    };
    const record = await pb.collection("users").create(data);
    await handleLogin(name, password);
  } catch (error) {
    console.error("Signup failed:", error.data);
  }
}

export async function handleLogin(name, password) {
  const loginError = document.getElementById("login-error");
  if (loginError) loginError.style.display = "none";

  try {
    const authData = await pb
      .collection("users")
      .authWithPassword(name, password);
    window.location.href = "/transactions.html";
  } catch (error) {
    if (loginError) loginError.style.display = "block";
  }
}
