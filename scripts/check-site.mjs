import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const origin = 'https://adiarya.com';
for (const route of ['index.html', 'work/index.html', 'stories/index.html', 'icons/index.html', 'work/catch/index.html', 'work/soja/index.html']) {
  const page = fs.readFileSync(path.join(dist, route), 'utf8');
  assert(!page.includes('id="theme-toggle"') && !page.includes('theme-init.js'), route + ' must remain light only');
  for (const href of ['/', '/work/', '/stories/', '/icons/']) assert(page.includes('href="' + href + '"'), route + ' missing navigation to ' + href);
}
assert(html.includes('<article class="card"') && !html.includes('class="project-note"'), 'Keep the Index reel without case study cards');
const catalog = fs.readFileSync(path.join(root, 'scripts/gallery-cards.html'), 'utf8');
const work = fs.readFileSync(path.join(dist, 'work/index.html'), 'utf8');
const cards = [...catalog.matchAll(/<article class="card"[\s\S]*?<\/article>/g)].map(match => match[0]);
assert.equal(cards.length, 7, 'Keep six stills plus the income motion study');
assert.equal(new Set(cards.map(card => card.match(/data-title="([^"]+)"/)[1])).size, 7);
assert(cards[1].includes('income-slider-motion'), 'Keep the income recording second');
assert(!html.includes('catch-live-board-motion') && !html.includes('media/soja-welcome.'), 'Keep removed Catch recording and Soja welcome out of the reel');
assert(!html.includes('data-framing=') && !html.includes('--media-zoom'), 'Keep stills at their original framing');
assert(!html.includes('Previous Portfolio') && !html.includes('media/portfolio-showcase.'), 'Keep the old portfolio out of the reel');
assert(!html.includes('soja-recovery-motion'), 'Keep the removed Soja video out of the gallery');
assert(!html.includes('media/soja-overview.'), 'Do not restore the removed homepage Soja overview image');
for (const [index, card] of cards.entries()) {
  if (card.includes('data-motion=')) {
    const video = card.match(/<video[^>]+>/)[0];
    assert(video.includes('muted loop playsinline'), 'Motion previews stay silent and inline');
    assert(video.includes('preload="none"') && !/\ssrc=/.test(video), 'Load video only when visible');
    for (const attr of ['data-src','poster']) {
      const file = path.join(dist, video.match(new RegExp(`${attr}="([^"]+)"`))[1]);
      assert(fs.existsSync(file), `Missing motion asset ${file}`);
      assert(fs.statSync(file).size < (attr === 'data-src' ? 4_000_000 : 2_000_000), 'Keep motion assets light');
    }
    assert(card.includes('class="motion-toggle"'), 'Allow pausing looping motion');
    assert(card.includes('aria-haspopup="dialog"'), 'Offer a full preview');
    continue;
  }
  const destination = card.match(/data-link="([^"]+)"/)[1];
  assert.equal(new URL(destination).protocol, 'https:');
  const story = card.match(/data-case-study="([^"]+)"/)?.[1];
  if (story) {
    assert(card.includes(`href="${story}"`), 'Project media must link to its case study');
    assert(fs.existsSync(path.join(dist, story, 'index.html')), 'Case study must exist');
  } else assert(card.includes(`href="${destination}"`), 'Preview and original destinations must match');
  assert(/loading="lazy"/.test(card), 'Offscreen gallery images should load lazily');
  const image = card.match(/<img[^>]+>/)[0];
  const file = await sharp(path.join(dist, image.match(/src="([^"]+)"/)[1])).metadata();
  assert.equal(Number(image.match(/width="(\d+)"/)[1]), file.width);
  assert.equal(Number(image.match(/height="(\d+)"/)[1]), file.height);
  assert.equal(file.width, 3840, 'Use the full 4K image in the reel and expanded preview');
  assert(!card.includes('data-link-label="App Store"') ||
    !cards[(index + 1) % cards.length].includes('data-link-label="App Store"'),
  'Keep App Store screenshots separated, including the loop boundary');
}

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
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Keep the shared intro heading');
assert(html.includes('<html lang="en">'));
assert(html.includes(`<link rel="canonical" href="${origin}/"`));
assert(/name="description"\s+content="[^"]+"/.test(html));
assert(!/content="[^"]*\bnoindex\b/.test(html));
assert(work.includes('aria-label="Media preview"'));
assert(work.includes('id="modal-video"'));
assert(html.includes('href="https://drive.google.com/file/d/16-1kgD510pvwfmND5SYUP0pWbivKd8OM/view?usp=sharing"'), 'Keep the public-facing Maritime Fusion destination');
assert(!html.includes('href="https://github.com/Rajsuthan/maritime-fusion"'), 'Do not restore the private repository destination');
assert(work.includes('aria-label="Close project preview"'));
assert(!html.includes('fonts.googleapis.com') && !html.includes('fonts.gstatic.com'), 'Typography must not depend on remote fonts');
assert(/href="\/typography\.css\?v=[^"]+"/.test(html));
assert(fs.readFileSync(path.join(dist, 'typography.css'), 'utf8').includes("--font-sans:ui-sans-serif,system-ui"));
assert(!html.includes('class="contact-shine"'), 'Keep the homepage contact prompt removed');
assert(fs.readFileSync(path.join(dist,'fonts/space-grotesk-v22-latin.woff2')).subarray(0,4).toString() === 'wOF2');
assert(fs.readFileSync(path.join(dist,'fonts/Space-Grotesk-OFL.txt'),'utf8').includes('SIL OPEN FONT LICENSE'));
for (const card of cards) {
  if (card.includes('data-motion=')) continue;
  const exportFile = card.match(/srcset="(media\/[^\"]+\.webp)"/)[1];
  const file = exportFile.replace('-4k.webp', '.webp');
  const original = file.replace('.webp', '.png');
  const before = await sharp(path.join(dist, original)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const after = await sharp(path.join(dist, file)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.deepEqual(before.info, after.info, 'Do not resize gallery images');
  assert(before.data.equals(after.data), `Pixel quality changed: ${file}`);
  assert(fs.statSync(path.join(dist, file)).size < fs.statSync(path.join(dist, original)).size);
}
const config = JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
assert(config.redirects.some(rule => rule.destination === `${origin}/:path*` && rule.permanent && rule.has.some(condition => condition.type === 'host' && condition.value === 'portfolio-template-ochre-rho.vercel.app')));
assert(config.redirects.some(rule => rule.destination === `${origin}/:path*` && rule.permanent && rule.has.some(condition => condition.type === 'host' && condition.value === 'adiarya.vercel.app')));
const discovery = fs.readFileSync(path.join(dist, 'footer-discovery.js'), 'utf8');
assert(!discovery.includes('preventDefault') && !/addEventListener\(['"](?:wheel|pointerdown)/.test(discovery),
  'Footer discovery must not intercept scrolling or require a hold gesture');
assert(!html.includes('progress-ring') && !html.includes('--pull'), 'Do not restore the hold-progress ring');
assert(html.includes('Scroll down'));
assert(!discovery.includes('portfolio-footer-reveal') && !html.includes('playFooterRevealSound'),
  'Footer scrolling must remain silent');
assert(html.includes('class="rainbow-bands" aria-hidden="true"'));
// Exercise the real discovery controller with deterministic scroll events.
const handlers = new Map();
const buttonHandlers = new Map();
const classes = new Set();
const toggles = {toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); }, add(name) {classes.add(name);}, remove(name) {classes.delete(name);}};
const scrollCalls = [];
const signals = [];
const timers = new Map();
let nextTimer = 0;
let footerVisibility;
const controller = {
  document: {documentElement:{classList:toggles},querySelector: selector => selector === '#footer-discover' ? {classList:toggles,addEventListener:(name,fn)=>buttonHandlers.set(name,fn)} : {scrollIntoView:options=>scrollCalls.push(options)}},
  matchMedia: query => ({matches:!query.includes('reduced-motion'),addEventListener(){}}),
  window:{IntersectionObserver:true,addEventListener:(name,fn)=>handlers.set(name,fn),dispatchEvent:event=>signals.push(event.type)},
  IntersectionObserver:class { constructor(callback) { footerVisibility=callback; } observe() {} },
  setTimeout:fn=>{timers.set(++nextTimer,fn);return nextTimer;},clearTimeout:id=>timers.delete(id),
  Event,scrollY:0,innerHeight:900
};
vm.runInNewContext(discovery,controller);
footerVisibility([{isIntersecting:true,intersectionRatio:0}]);
assert(!classes.has('is-footer-visible'),'Do not fade the reel before the footer enters');
footerVisibility([{isIntersecting:true,intersectionRatio:.5}]);
assert(classes.has('is-footer-visible'),'Soften the reel boundary while the footer is visible');
footerVisibility([{isIntersecting:false,intersectionRatio:0}]);
assert(!classes.has('is-footer-visible'),'Restore the original reel when returning to the top');
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
const social = fs.readFileSync(path.join(dist, 'media/aditya-arya-building-with-intent.jpg'));
assert.equal(social.readUInt16BE(0), 0xffd8, 'Social preview must be a JPEG');
const cached = JSON.parse(fs.readFileSync(path.join(dist, 'github-contributions.json'), 'utf8'));
assert.equal(cached.username, 'AdiArya05');
assert(cached.days.length >= 350 && Number.isInteger(cached.total));
const require = createRequire(import.meta.url);
const { parseContributions } = require('../lib/github-contributions.js');
assert.throws(() => parseContributions('<html>Temporarily unavailable</html>'), /Incomplete/);
// Follow every story entry point to a real document and verify its local dependencies.
const storyCards = cards.filter(card => card.includes('data-case-study='));
assert.equal(storyCards.length, 5, 'Keep remaining project media story links');
for (const project of ['soja', 'catch']) {
  const route = `/work/${project}/`;
  assert.equal(storyCards.filter(card => card.includes(`data-case-study="${route}"`)).length, project === 'catch' ? 3 : 2);
  const story = fs.readFileSync(path.join(dist, route, 'index.html'), 'utf8');
  const readingToolbar = story.match(/<header class="reading-toolbar"[\s\S]*?<\/header>/)?.[0];
  assert(readingToolbar?.includes('class="portfolio-nav"') && readingToolbar.includes('id="time-zones"'), 'Keep reading controls in one header so content cannot scroll between them');
  assert(story.includes('viewport-fit=cover'), 'Account for iPhone safe areas in the story header');
  assert(!story.includes('class="icon-mockup"'), 'Remove phone icon mockups from case studies');
  if (project === 'soja') assert.equal((story.match(/src="\/work\/article-media\/soja-final-home-1200.webp"/g) || []).length, 1, 'Show the final home screen only once');
  assert.equal((story.match(/<h1\b/g) || []).length, 1);
  assert(!story.includes('noindex'), 'Approved published stories must be indexable');
  assert(story.includes(`<link rel="canonical" href="${origin}/work/${project}"`));
  assert(story.includes('property="og:image"'));
  assert(fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').includes(`<loc>${origin}/work/${project}</loc>`));
  assert(!story.includes('Draft copy') && !story.includes('TEMPLATE:'), 'Use personal project stories rather than sample writing');
  assert(!story.includes('figma-space') && !story.includes('project-facts') && !story.includes('contact-note'), 'Keep story pages minimal');
  for (const match of story.matchAll(/<(?:img|script|link|a)\b[^>]*?\b(?:src|href)="([^"]+)"/g)) {
    const url = new URL(match[1], origin + route);
    if (url.origin !== origin || url.pathname.startsWith('/_vercel/')) continue;
    const target = path.join(dist, decodeURIComponent(url.pathname));
    assert(fs.existsSync(target), `Missing story destination or asset: ${url.pathname}`);
    if (fs.statSync(target).isDirectory()) assert(fs.existsSync(path.join(target, 'index.html')));
  }
  for (const match of story.matchAll(/<img\b[^>]+\bsrc="([^"]+)"[^>]*>/g)) {
    const metadata = await sharp(path.join(dist, match[1])).metadata();
    assert.equal(Number(match[0].match(/width="(\d+)"/)[1]), metadata.width);
    assert.equal(Number(match[0].match(/height="(\d+)"/)[1]), metadata.height);
    assert(/alt="[^"]*"/.test(match[0]), 'Every story image needs an alt attribute');
    if (!match[1].startsWith('/work/article-media/')) continue;
    assert(/alt="[^"]+"/.test(match[0]), 'Describe project images');
    const candidates = match[0].match(/srcset="([^"]+)"/)?.[1].split(', ') ?? [];
    assert.equal(candidates.length, 2, 'Provide two responsive sizes for each article image');
    for (const candidate of candidates) {
      const [url, width] = candidate.split(' ');
      const image = await sharp(path.join(dist, url)).metadata();
      assert.equal(image.width, Number.parseInt(width, 10));
      assert(Math.abs(image.width / image.height - metadata.width / metadata.height) < 0.01, 'Keep the same framing across sizes');
    }
  }
}
for (const filename of ['case-study.js']) {
  new vm.Script(fs.readFileSync(path.join(dist, 'work', filename), 'utf8'), { filename });
}
console.log('PASS: five previewable gallery story links, personal Soja and Catch stories, local routes/assets, original image dimensions, image descriptions and shared script syntax.');
console.log(`PASS: seven gallery cards, destinations, image dimensions, local assets, ${inlineCount} inline scripts, external scripts, SEO metadata, structured data, sitemap, robots, modal labels and calendar fallback.`);
console.log('PASS: lossless image pixel equality, smaller assets, system typography, phone media guards, deferred footer, close control and canonical-host redirect.');
