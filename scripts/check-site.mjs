import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import sharp from 'sharp';

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
assert(html.includes('href="https://drive.google.com/file/d/16-1kgD510pvwfmND5SYUP0pWbivKd8OM/view?usp=sharing"'), 'Keep the public-facing Maritime Fusion destination');
assert(!html.includes('href="https://github.com/Rajsuthan/maritime-fusion"'), 'Do not restore the private repository destination');
assert(html.includes('grid-template-columns:44px 44px; width:104px; height:52px; padding:4px; border:0; border-radius:999px; gap:8px;'));
assert(html.includes('top:4px; left:4px; width:44px; height:44px;'));
assert(html.includes('html[data-theme="dark"] .theme-toggle::before { transform:translateX(52px); }'));
assert(html.includes('aria-label="Close project preview"'));
assert(html.includes('gallery.contains(document.activeElement)'), 'Pause moving gallery for keyboard users');
assert(!html.includes('fonts.googleapis.com') && !html.includes('fonts.gstatic.com'), 'Keep the original font self-hosted');
assert(fs.readFileSync(path.join(dist, 'fonts/space-grotesk-v22-latin.woff2')).subarray(0,4).toString() === 'wOF2');
assert(fs.readFileSync(path.join(dist, 'fonts/Space-Grotesk-OFL.txt'), 'utf8').includes('SIL OPEN FONT LICENSE'));
for (const card of cards) {
  assert(card.includes('media="(max-width:700px)"'), 'Hidden phone gallery must not fetch desktop images');
  const file = card.match(/srcset="(media\/[^\"]+\.webp)"/)[1];
  const original = file.replace('.webp', '.png');
  const before = await sharp(path.join(dist, original)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const after = await sharp(path.join(dist, file)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.deepEqual(before.info, after.info, 'Do not resize gallery images');
  assert(before.data.equals(after.data), `Pixel quality changed: ${file}`);
  assert(fs.statSync(path.join(dist, file)).size < fs.statSync(path.join(dist, original)).size);
}
const footerLoader = fs.readFileSync(path.join(dist, 'footer-loader.js'), 'utf8');
assert(footerLoader.includes('!desktop.matches') && footerLoader.includes('requestIdleCallback'), 'Prepare footer effects in desktop idle time only');
assert(footerLoader.includes("classList.contains('is-page-scrolling')"), 'Do not build footer effects during scrolling');
const config = JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
assert(config.redirects.some(rule => rule.destination === `${origin}/:path*` && rule.permanent && rule.has.some(condition => condition.type === 'host' && condition.value === 'portfolio-template-ochre-rho.vercel.app')));
const discovery = fs.readFileSync(path.join(dist, 'footer-discovery.js'), 'utf8');
assert(!discovery.includes('preventDefault') && !/addEventListener\(['"](?:wheel|pointerdown)/.test(discovery),
  'Footer discovery must not intercept scrolling or require a hold gesture');
assert(!html.includes('progress-ring') && !html.includes('--pull'), 'Do not restore the hold-progress ring');
assert(html.includes('Scroll down'));
assert(!discovery.includes('portfolio-footer-reveal') && !html.includes('playFooterRevealSound'),
  'Footer scrolling must remain silent');
assert(html.includes('html.is-page-scrolling .skyline-motion * { animation-play-state:paused; }'));
assert(html.includes("window.addEventListener('portfolio-scroll-settled', resumeGallery)"));
// Exercise the real discovery controller with deterministic scroll events.
const handlers = new Map();
const buttonHandlers = new Map();
const classes = new Set();
const toggles = {toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); }, add(name) {classes.add(name);}, remove(name) {classes.delete(name);}};
const scrollCalls = [];
const signals = [];
const timers = new Map();
let nextTimer = 0;
const controller = {
  document: {documentElement:{classList:toggles},querySelector: selector => selector === '#footer-discover' ? {classList:toggles,addEventListener:(name,fn)=>buttonHandlers.set(name,fn)} : {scrollIntoView:options=>scrollCalls.push(options)}},
  matchMedia: query => ({matches:!query.includes('reduced-motion'),addEventListener(){}}),
  window:{addEventListener:(name,fn)=>handlers.set(name,fn),dispatchEvent:event=>signals.push(event.type)},
  setTimeout:fn=>{timers.set(++nextTimer,fn);return nextTimer;},clearTimeout:id=>timers.delete(id),
  Event,scrollY:0,innerHeight:900
};
vm.runInNewContext(discovery,controller);
buttonHandlers.get('click')();
assert.equal(scrollCalls[0].behavior,'smooth');
assert(classes.has('is-page-scrolling'));
handlers.get('scroll')();
assert.equal(signals.filter(name=>name==='portfolio-scroll-start').length,1,'Start scroll work only once per gesture');
handlers.get('scrollend')({target:{}});
assert(classes.has('is-page-scrolling'),'Ignore nested gallery scrollend events');
handlers.get('scrollend')({target:controller.document});
assert(!classes.has('is-page-scrolling'));
assert.equal(signals.at(-1),'portfolio-scroll-settled');
handlers.get('scroll')();
[...timers.values()].forEach(fn=>fn());
assert(!classes.has('is-page-scrolling'),'Restore effects when scrollend is unsupported');
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
console.log('PASS: lossless image pixel equality, smaller assets, self-hosted original font/license, phone media guards, deferred footer, keyboard gallery pause, close control and canonical-host redirect.');
