/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    include: ["tests/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    environment: "jsdom",  // React 컴포넌트 테스트용
    setupFiles: ["tests/setup.ts"],
    globals: true,
    // 콘솔 출력을 더 깔끔하게 설정
    silent: false,
    reporters: ['verbose'],
    logHeapUsage: false,
  },
  resolve: {
    alias: {
      '@components': resolve(__dirname, './components'),
      '@lib': resolve(__dirname, './lib'),
      '@app': resolve(__dirname, './app'),
      '@': resolve(__dirname, '.'),
    },
  },
  // Node.js 호환성 개선
  optimizeDeps: {
    include: ['@testing-library/react', '@testing-library/jest-dom']
  },
  define: {
    global: 'globalThis',
  }
}) 