const fs = require('fs');

describe('static pages', () => {
  test('index.html contains the lead form and title', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    expect(html).toMatch(/<title>.*Moving 4U.*<\/title>/i);
    expect(html).toMatch(/<form[^>]*id=["']leadForm["'][^>]*>/i);
  });
});
