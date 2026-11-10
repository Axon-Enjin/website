import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  publicDir: false,
  build: isSsrBuild
    ? undefined
    : {
        rollupOptions: {
          input: {
            main: fileURLToPath(new URL("./index.html", import.meta.url)),
            admin: fileURLToPath(
              new URL("./admin/index.html", import.meta.url),
            ),
          },
        },
      },
}));
