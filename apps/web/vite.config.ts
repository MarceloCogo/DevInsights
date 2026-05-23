import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [".up.railway.app"],
    host: "0.0.0.0",
    port: Number(process.env.WEB_PORT ?? 3000)
  },
  preview: {
    allowedHosts: [".up.railway.app"],
    host: "0.0.0.0",
    port: Number(process.env.PORT ?? process.env.WEB_PORT ?? 3000)
  }
});
