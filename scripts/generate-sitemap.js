/*
 * Simple sitemap generator for static sites.
 * Usage: SITE_URL=https://moving4u.x10hub.net node scripts/generate-sitemap.js
 * If SITE_URL is not provided, it will use the default in this script.
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://moving4u.x10hub.net';
const ROOT = path.resolve(__dirname, '..');
const IGNORED = new Set(['node_modules', '.git', 'scripts', 'e2e', '__tests__']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (IGNORED.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else if (e.isFile() && path.extname(e.name).toLowerCase() === '.html') files.push(full);
  }
  return files;
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

const files = walk(ROOT).map((f) => {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  const stat = fs.statSync(f);
  return { path: rel, lastmod: fmtDate(stat.mtime) };
});

// Basic priority heuristics
function priorityFor(pathname) {
  if (pathname === 'index.html') return '0.8';
  if (pathname === 'privacy.html') return '0.4';
  return '0.5';
}

function changefreqFor(pathname) {
  if (pathname === 'index.html') return 'weekly';
  if (pathname === 'privacy.html') return 'yearly';
  return 'monthly';
}

const urlset = files
  .map((f) => {
    const loc = `${SITE_URL}/${f.path.replace(/index.html$/,'')}`.replace(/\/$/, '/').replace(/\/index.html$/, '/');
    const lastmod = f.lastmod;
    const changefreq = changefreqFor(f.path);
    const priority = priorityFor(f.path);
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>\n`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
console.log('sitemap.xml generated with', files.length, 'entries for', SITE_URL);