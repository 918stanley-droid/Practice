// Suppress noisy console.error output from app during tests
// Tests may intentionally trigger error paths; use a mock to keep test output clean
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  if (console.error.mockRestore) console.error.mockRestore();
});
