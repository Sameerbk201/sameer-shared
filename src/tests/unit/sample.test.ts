/**
 * @file sample.test.ts
 * @description
 *  Reference examples for writing clear, maintainable unit tests in
 * TypeScript + ESM using Vitest.
 *
 * This file is not tied to any production code — it serves as a living guide
 * for how contributors should structure and document their own test suites.
 *
 * It includes examples for:
 *  1. Simple function tests (unit testing basics)
 *  2. Async function tests
 *  3. Error handling (negative testing)
 *  4. Mocking & spying with vi
 *  5. Parameterized tests
 *  6. Best practices for naming, structure, and style
 *
 * ---------------------------------------------------------------------------
 * Tip:
 * Keep your tests deterministic, isolated, and explicit.
 * Each describe block should test one module or class.
 * Each it block should validate one behavior or scenario.
 * ---------------------------------------------------------------------------
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';

// -----------------------------------------------------------------------------
// Example functions to test (for demonstration)
// -----------------------------------------------------------------------------

/**
 * Adds two numbers together.
 * @param a - first number
 * @param b - second number
 * @returns Sum of a and b.
 */
function add(a: number, b: number): number {
  return a + b;
}

/**
 * Simulates fetching data asynchronously.
 * @param id - Mock ID
 * @returns Promise resolving to a mock object
 */
async function fetchUser(id: number): Promise<{ id: number; name: string }> {
  if (id <= 0) throw new Error('Invalid user ID');
  await new Promise((r) => setTimeout(r, 10));
  return { id, name: 'Sameer' };
}

/**
 * Example dependency function for mocking demonstration.
 */
function sendEmail(to: string, subject: string): boolean {
  console.log(`Sending email to ${to}: ${subject}`);
  return true;
}

// -----------------------------------------------------------------------------
// 🧩 Lifecycle hooks (shared across all examples)
// -----------------------------------------------------------------------------

beforeAll(() => {
  console.info('[Setup] Starting sample test suite...');
});

beforeEach(() => {
  // Reset all mocks before each test for isolation
  vi.restoreAllMocks();
});

afterEach(() => {
  // Optional: Clean up test-specific side effects
});

afterAll(() => {
  console.info('[Teardown] All sample tests completed ✅');
});

// -----------------------------------------------------------------------------
//  1. Basic synchronous tests
// -----------------------------------------------------------------------------

describe('Basic function tests', () => {
  it('should correctly add two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('should handle negative numbers', () => {
    expect(add(-1, -1)).toBe(-2);
  });

  it('should produce predictable output for zero', () => {
    expect(add(0, 5)).toBe(5);
  });
});

// -----------------------------------------------------------------------------
//  2. Async tests (Promise-based or async/await)
// -----------------------------------------------------------------------------

describe('Async function tests', () => {
  it('should resolve with valid user data', async () => {
    const user = await fetchUser(1);
    expect(user).toEqual({ id: 1, name: 'Sameer' });
  });

  it('should reject when user ID is invalid', async () => {
    await expect(fetchUser(0)).rejects.toThrow('Invalid user ID');
  });
});

// -----------------------------------------------------------------------------
//  3. Negative / Error path tests
// -----------------------------------------------------------------------------

describe('Error handling patterns', () => {
  it('should throw a descriptive error for invalid operations', () => {
    const badOp = () => {
      throw new Error('Operation not permitted');
    };
    expect(badOp).toThrow(/not permitted/);
  });
});

// -----------------------------------------------------------------------------
//  4. Mocking & Spying with Vitest
// -----------------------------------------------------------------------------

describe('Mocking and spying', () => {
  it('should spy on a function call', () => {
    const spy = vi.fn(sendEmail);

    spy('dev@sameer.io', 'Hello there');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith('dev@sameer.io', 'Hello there');
  });

  it('should mock implementation temporarily', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {
      /** empty */
    });
    sendEmail('mock@sameer.io', 'Mock Test');
    expect(spy).toHaveBeenCalledWith('Sending email to mock@sameer.io: Mock Test');
  });
});

// -----------------------------------------------------------------------------
//  5. Parameterized tests (table-driven testing)
// -----------------------------------------------------------------------------

describe('Parameterized examples', () => {
  /**
   * Use it.each for table-driven testing:
   * Each row defines an input → expected output case.
   */
  it.each([
    [1, 1, 2],
    [2, 5, 7],
    [-3, 3, 0],
  ])('should correctly add %i and %i → %i', (a, b, expected) => {
    expect(add(a, b)).toBe(expected);
  });
});

// -----------------------------------------------------------------------------
//  6. Async + Mock combo example
// -----------------------------------------------------------------------------

describe('Async + Mock combo example', () => {
  it('should mock async behavior for reliability', async () => {
    // Mock the async function
    const mockFetch = vi.fn().mockResolvedValue({ id: 99, name: 'MockUser' });

    const result = await mockFetch(99);
    expect(result.id).toBe(99);
    expect(result.name).toBe('MockUser');
  });
});
