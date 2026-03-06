import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        // Just use the relative file names directly
        main: "index.html",
        dashboard: "dashboard.html",
        transactions: "transactions.html",
        history: "history.html",
      },
    },
  },
});
