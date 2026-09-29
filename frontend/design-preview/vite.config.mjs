import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  publicDir: fileURLToPath(new URL("../public", import.meta.url)),
  plugins: [react()],
  resolve: { alias: {
    "@": fileURLToPath(new URL("../src", import.meta.url)),
    "next/navigation": fileURLToPath(new URL("./navigation.jsx", import.meta.url)),
    "next/link": fileURLToPath(new URL("./link.jsx", import.meta.url)),
  } },
  server: { host: "127.0.0.1", port: 3101, strictPort: true },
});
