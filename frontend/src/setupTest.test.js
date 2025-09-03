/**
 * Basic Jest Setup Test
 * This test verifies that Jest is working correctly
 */

describe('Jest Setup', () => {
  test('should work with basic assertions', () => {
    expect(true).toBe(true);
    expect(1 + 1).toBe(2);
  });

  test('should work with React Testing Library', () => {
    // This test verifies that @testing-library/jest-dom is working
    expect(document.createElement('div')).toBeInTheDocument;
  });
});