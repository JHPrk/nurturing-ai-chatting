import { expect, afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import React from 'react'

// React JSX를 전역에서 사용 가능하게 설정
global.React = React

// 환경변수 설정
beforeEach(() => {
  process.env.GEMINI_API_KEY = "TEST_API_KEY";
});

// localStorage 모킹
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// fetch 모킹
global.fetch = vi.fn();

// DOM 메소드 모킹
Element.prototype.scrollIntoView = vi.fn();

// expect 확장
expect.extend(matchers);

// 각 테스트 후 정리
afterEach(() => {
  cleanup();
}); 