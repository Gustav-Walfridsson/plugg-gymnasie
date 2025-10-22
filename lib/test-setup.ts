/**
 * Test setup for Vitest
 * Configures mocks and global objects for testing
 */

import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

// Mock global objects
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
})

Object.defineProperty(global, 'window', {
  value: { localStorage: localStorageMock },
  writable: true
})

// Mock process.env
Object.defineProperty(process, 'env', {
  value: { NODE_ENV: 'test' },
  writable: true
})
