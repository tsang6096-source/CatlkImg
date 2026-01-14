import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

import { miaodaDevPlugin } from "miaoda-sc-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr({
      svgrOptions: {
        icon: true, exportType: 'named', namedExport: 'ReactComponent', }, }), miaodaDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // 生产环境优化配置
    minify: 'terser', // 使用 terser 进行代码压缩和混淆
    terserOptions: {
      compress: {
        // 删除 console.log（保留 console.error 和 console.warn）
        drop_console: false,
        drop_debugger: true,
        pure_funcs: ['console.log'], // 只删除 console.log
      },
      mangle: {
        // 混淆变量名
        safari10: true,
      },
      format: {
        // 删除注释
        comments: false,
      },
    },
    // 代码分割
    rollupOptions: {
      output: {
        // 手动分割代码块
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            'lucide-react',
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
          ],
          'image-processor': ['browser-image-compression'],
        },
        // 混淆文件名
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // 启用源码映射（开发时使用，生产环境可关闭）
    sourcemap: false,
    // 设置代码分割的大小警告阈值
    chunkSizeWarningLimit: 1000,
  },
});
