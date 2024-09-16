import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// 压缩插件
import viteCompression from "vite-plugin-compression";
// 保证代码风格
import eslintPlugin from "vite-plugin-eslint";
// 禁止console.log
import removeConsolePlugin from "./src/plugins/vite-plugin-remove-console";

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      // 使用 gzip 压缩输出
      algorithm: "gzip",
    }),
    eslintPlugin(),
    removeConsolePlugin(),
  ],
});
