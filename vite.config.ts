import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths"; // ✅ เพิ่มปลั๊กอินนี้
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // ✅ ปลั๊กอินอ่าน alias จาก tsconfig.json
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // ✅ ให้ @ ชี้ไปที่ src/
    },
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  },
  build: {
    target: "esnext",
    outDir: "build",
  },
  server: {
    port: 3000,
    open: true,
  },
});
