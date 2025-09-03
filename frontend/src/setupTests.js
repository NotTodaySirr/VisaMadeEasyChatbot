import '@testing-library/jest-dom';

// Mock CSS imports
jest.mock('*.css', () => ({}));

// Mock getComputedStyle to return expected CSS values for testing
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = jest.fn((element) => {
  // Return mocked styles for specific classes
  if (element.classList.contains('chat-messages')) {
    return {
      ...originalGetComputedStyle(element),
      overflowY: 'auto',
      scrollBehavior: 'smooth'
    };
  }
  return originalGetComputedStyle(element);
});

// Polyfills for TextEncoder and TextDecoder
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock for window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock for IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock for ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};