const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

describe('client form (app.js)', () => {
  let initLeadForm;

  beforeEach(() => {
    document.documentElement.innerHTML = html;
    // require here so the module can attach/export after DOM is set
    const mod = require('../app');
    initLeadForm = mod.initLeadForm || window.initLeadForm;
    if (typeof initLeadForm === 'function') initLeadForm();
  });

  afterEach(() => {
    jest.resetModules();
    // clean up any mocks
    if (global.fetch && global.fetch.mockRestore) global.fetch.mockRestore();
  });

  test('sets current year in footer', () => {
    const yearEl = document.getElementById('year');
    expect(yearEl).toBeTruthy();
    const expected = new Date().getFullYear().toString();
    expect(yearEl.textContent).toBe(expected);
  });

  test('successful form submission shows success message and resets form', async () => {
    const mockFetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'success' }) }));
    global.fetch = mockFetch;

    const form = document.getElementById('leadForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const nameInput = form.querySelector('[name="name"]');
    const emailInput = form.querySelector('[name="email"]');
    nameInput.value = 'Test User';
    emailInput.value = 'test@example.com';
    const msg = document.getElementById('formMessage');

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // button should be disabled while submitting
    expect(submitBtn.getAttribute('aria-disabled')).toBe('true');

    // wait for promise microtasks to complete
    await new Promise((r) => setTimeout(r, 0));

    expect(mockFetch).toHaveBeenCalled();
    expect(msg.textContent).toMatch(/Thanks/i);
    expect(msg.classList.contains('success')).toBe(true);
    expect(nameInput.value).toBe('');
  });

  test('failed form submission shows error message', async () => {
    const mockFetch = jest.fn(() => Promise.reject(new Error('network')));
    global.fetch = mockFetch;

    const form = document.getElementById('leadForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const nameInput = form.querySelector('[name="name"]');
    const emailInput = form.querySelector('[name="email"]');
    nameInput.value = 'Test User';
    emailInput.value = 'test@example.com';
    const msg = document.getElementById('formMessage');

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // button should be disabled while submitting
    expect(submitBtn.getAttribute('aria-disabled')).toBe('true');

    // wait for promise microtasks to complete
    await new Promise((r) => setTimeout(r, 0));

    expect(mockFetch).toHaveBeenCalled();
    expect(msg.textContent).toMatch(/could not submit|Sorry/i);
    expect(msg.classList.contains('error')).toBe(true);
  });

  test('honeypot filled is treated as spam and not sent', async () => {
    const mockFetch = jest.fn(() => Promise.resolve({ ok: true }));
    global.fetch = mockFetch;

    const form = document.getElementById('leadForm');
    const nameInput = form.querySelector('[name="name"]');
    const emailInput = form.querySelector('[name="email"]');
    nameInput.value = 'Test User';
    emailInput.value = 'test@example.com';
    const hp = form.querySelector('input[name="website"]');
    hp.value = 'http://spam.example';

    const msg = document.getElementById('formMessage');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // wait for microtasks
    await new Promise((r) => setTimeout(r, 0));

    expect(mockFetch).not.toHaveBeenCalled();
    expect(msg.textContent).toMatch(/Thanks/i);
    expect(msg.classList.contains('success')).toBe(true);
  });

});