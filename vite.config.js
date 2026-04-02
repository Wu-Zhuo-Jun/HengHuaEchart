import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  logLevel: "info", // 显示详细的HMR日志
  plugins: [
    react(),
    visualizer({
      filename: "dist/stats.html", // 分析文件输出路径
      open: false, // 在构建完成后自动在浏览器中打开
      gzipSize: true, // 显示 gzip 后的大小
      brotliSize: true, // 显示 brotli 后的大小
    }),
    // // gzip压缩插件
    // viteCompression({
    //   verbose: true, // 是否在控制台输出压缩结果
    //   disable: false, // 是否禁用
    //   threshold: 10240, // 超过10kb的文件才压缩
    //   algorithm: 'gzip', // 压缩算法
    //   ext: '.gz', // 压缩文件后缀
    // }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1",
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      overlay: true,
      // // 只对特定文件进行热重载
      // include: ["**/*.jsx", "**/*.tsx", "**/*.css"],
      // 排除 context 文件
      exclude: ["**/src/context/**"],
    },
  },
  build: {
    outDir: "build",
    sourcemap: true,
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  optimizeDeps: {
    include: ["jquery"],
  },
});
