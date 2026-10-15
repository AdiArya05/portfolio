import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const origin = 'https://adiarya.vercel.app';
const cards = [...html.matchAll(/<article class="card"[\s\S]*?<\/article>/g)].map(match => match[0]);
assert.equal(cards.length, 8, 'Preserve all eight gallery cards');
assert.equal(new Set(cards.map(card => card.match(/data-title="([^"]+)"/)[1])).size, 8);
cards.forEach((card, index) => {
  const destination = card.match(/data-link="([^"]+)"/)[1];
  assert.equal(new URL(destination).protocol, 'https:');
  assert(card.includes(`href="${destination}"`), 'Preview and original destinations must match');
  assert(/loading="lazy"/.test(card), 'Offscreen gallery images should load lazily');
  const image = card.match(/<img[^>]+>/)[0];
  const file = fs.readFileSync(path.join(dist, image.match(/src="([^"]+)"/)[1]));
  assert.equal(Number(image.match(/width="(\d+)"/)[1]), file.readUInt32BE(16));
  assert.equal(Number(image.match(/height="(\d+)"/)[1]), file.readUInt32BE(20));
  assert(!card.includes('data-link-label="App Store"') ||
    !cards[(index + 1) % cards.length].includes('data-link-label="App Store"'),
  'Keep App Store screenshots separated, including the loop boundary');
});

for (const match of html.matchAll(/<(?:img|script|link)\b[^>]*?\b(?:src|href)="([^"]+)"/g)) {
  const url = new URL(match[1], origin);
  if (url.origin !== origin || url.pathname.startsWith('/_vercel/')) continue;
  assert(fs.existsSync(path.join(dist, decodeURIComponent(url.pathname))), `Missing asset: ${url.pathname}`);
}
let inlineCount = 0;
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
  if (match[1].includes('application/ld+json')) {
    const schema = JSON.parse(match[2]);
    assert.equal(schema['@context'], 'https://schema.org');
    assert(schema['@graph'].some(entity => entity['@type'] === 'Person'));
  } else if (!match[1].includes('src=')) {
    new vm.Script(match[2], { filename: `inline-${++inlineCount}.js` });
  }
}
for (const filename of fs.readdirSync(dist).filter(name => name.endsWith('.js'))) {
  new vm.Script(fs.readFileSync(path.join(dist, filename), 'utf8'), { filename });
}
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Keep one main heading');
assert(html.includes('<html lang="en">'));
assert(html.includes(`<link rel="canonical" href="${origin}/"`));
assert(/name="description"\s+content="[^"]+"/.test(html));
assert(!/content="[^"]*\bnoindex\b/.test(html));
assert(html.includes('aria-labelledby="modal-title"'));
assert(html.includes('aria-describedby="modal-description"'));
const discovery = fs.readFileSync(path.join(dist, 'footer-discovery.js'), 'utf8');
assert(!discovery.includes('preventDefault') && !/addEventListener\(['"](?:wheel|pointerdown)/.test(discovery),
  'Footer discovery must not intercept scrolling or require a hold gesture');
assert(!html.includes('progress-ring') && !html.includes('--pull'), 'Do not restore the hold-progress ring');
assert(html.includes('Scroll down'));
assert(!discovery.includes('portfolio-footer-reveal') && !html.includes('playFooterRevealSound'),
  'Footer scrolling must remain silent');
assert(fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8').includes(`Sitemap: ${origin}/sitemap.xml`));
assert(fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').includes(`<loc>${origin}/</loc>`));
const social = fs.readFileSync(path.join(dist, 'media/aditya-arya-social.jpg'));
assert.equal(social.readUInt16BE(0), 0xffd8, 'Social preview must be a JPEG');
const cached = JSON.parse(fs.readFileSync(path.join(dist, 'github-contributions.json'), 'utf8'));
assert.equal(cached.username, 'AdiArya05');
assert(cached.days.length >= 350 && Number.isInteger(cached.total));
const require = createRequire(import.meta.url);
const { parseContributions } = require('../lib/github-contributions.js');
assert.throws(() => parseContributions('<html>Temporarily unavailable</html>'), /Incomplete/);
console.log(`PASS: eight gallery cards, destinations, image dimensions, local assets, ${inlineCount} inline scripts, external scripts, SEO metadata, structured data, sitemap, robots, modal labels and calendar fallback.`);
