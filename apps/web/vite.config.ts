import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
};

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [".up.railway.app"],
    headers: securityHeaders,
    host: "0.0.0.0",
    port: Number(process.env.WEB_PORT ?? 3000)
  },
  preview: {
    allowedHosts: [".up.railway.app"],
    headers: securityHeaders,
    host: "0.0.0.0",
    port: Number(process.env.PORT ?? process.env.WEB_PORT ?? 3000)
  }
});
