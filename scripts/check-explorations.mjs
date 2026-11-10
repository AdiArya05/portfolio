import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import sharp from 'sharp';

const dist = path.resolve(import.meta.dirname, '../dist');
const read = file => fs.readFileSync(path.join(dist,file),'utf8');
const catalog = fs.readFileSync(new URL('./gallery-cards.html', import.meta.url), 'utf8');
const page = read('work/index.html');
const cards = [...catalog.matchAll(/<article class="card"[\s\S]*?<\/article>/g)].map(m => m[0]);
const pieces = [...page.matchAll(/<article class="exploration"[\s\S]*?<\/article>/g)].map(m => m[0]);
const title = html => html.match(/data-title="([^"]+)"/)[1];
assert(cards.every(card => pieces.some(piece => title(piece).toLowerCase() === title(card).toLowerCase())), 'Work must include all catalog media');
assert(pieces.length > cards.length && !page.includes('class="work-icon-grid"'), 'Work is a media-only collage');
assert(!page.includes('/work/catch/media/current-home.webp') && !page.includes('/work/soja/media/onboarding.webp'));
assert(page.includes('/media/soja-welcome-framed-4k.webp'));
const iconsPage = read('icons/index.html');
const iconFiles = [...iconsPage.matchAll(/<figure class="work-icon"><div><img src="([^"]+)"/g)].map(match => match[1]);
assert.deepEqual([...iconFiles].sort(), [
  '/media/catch-icon.webp',
  '/media/soja-icon-1024.webp',
  '/work/soja/media/icon-peach.webp',
  '/work/soja/media/icon-blue.webp',
  '/work/catch/media/icon-painted-blue.webp',
  '/work/catch/media/icon-painted-orange.webp',
].sort());
for (const icon of iconFiles) assert(fs.existsSync(path.join(dist, icon)), 'Missing icon ' + icon);
assert.deepEqual(pieces.slice(0, 7).map(title), [
  'Dot In The Dynamic Island',
  'Catch Live Activity',
  'World Clock',
  'Scroll Controls',
  'Income Slider',
  'Codex Usage Menu Bar',
  'Music Player',
]);
assert(!page.includes('Download for Mac'), 'Codex Usage should link to its repository release options');
assert(pieces[0].includes('width="3840" height="2880"') && pieces[0].includes('/media/dot-iphone-assistant-4k.mp4'));
assert.equal(title(cards[1]),'Income slider','Keep the separate desktop reel order');
assert(pieces.every(piece => piece.includes('class="catalog-title') && piece.includes('<time datetime=')), 'Each Work tile has a preview title and year');
const portfolioRepo = 'https://github.com/AdiArya05/portfolio';
const catchApp = 'https://apps.apple.com/sg/app/catch-sg-buses/id6777373130';
const sojaSite = 'https://soja.framer.website/';
const destinations = {
  'Dot In The Dynamic Island': 'https://github.com/AdiArya05/dot-prototype',
  'Catch Live Activity': catchApp,
  'World Clock': portfolioRepo,
  'Codex Usage Menu Bar': 'https://github.com/AdiArya05/codex-usage-menu-bar',
  'Scroll Controls': `${portfolioRepo}/blob/main/dist/media/scroll-controls.webp`,
  'Music Player': `${portfolioRepo}/blob/main/dist/world-times.js`,
  'Sailorfy': 'https://sailorfy.framer.website/',
  'Catch Live Board': catchApp,
  'Soja Website': sojaSite,
  'Catch Nearby': catchApp,
  'Soja Onboarding': sojaSite,
  'Soja Recovery': sojaSite,
  'Soja Recovery Overview': sojaSite,
  'Soja Welcome Screen': sojaSite,
};
for (const piece of pieces) {
  const name = title(piece);
  if (name === 'Income Slider') {
    assert(piece.includes('<button class="catalog-title preview-label"'));
  } else {
    const link = piece.match(/<a class="catalog-title" href="([^"]+)"/)?.[1];
    assert.equal(link, destinations[name], `Wrong title link for ${name}`);
    assert(link, `Missing title link for ${name}`);
  }
  assert(piece.includes('<button class="preview-open"'), `Keep the media preview for ${name}`);
}
const toolbar = page.match(/<header class="reading-toolbar"[\s\S]*?<\/header>/)?.[0];
assert(toolbar?.includes('class="portfolio-nav"') && toolbar.includes('id="time-zones"'), 'Use the case studies opaque reading toolbar');
assert(page.includes('/typography.css') && page.includes('/work/reading-toolbar.css') && page.includes('/interface-controls.css'));
assert(page.includes('/interface-sounds.js') && page.includes('/world-times.js'));
const footer = page.match(/<footer class="explorations-footer"[^>]*>.*?<\/footer>/s)?.[0];
assert(footer?.includes('Back to home') && !footer.includes('Back to top') && page.includes('/back-to-top.js'));
assert(page.includes('<dialog') && page.includes('aria-label="Media preview"') && page.includes('id="modal-video"'));
assert(page.includes('viewport-fit=cover'));
assert(!page.includes('Previous Portfolio') && !page.includes('catch-live-board-motion') && !page.includes('soja-welcome.'));
for (const piece of pieces) {
  assert(piece.includes('aria-haspopup="dialog"'));
  const image = piece.match(/<img class="card-media"[^>]+>/)?.[0];
  if (image) {
    const metadata = await sharp(path.join(dist,image.match(/src="([^"]+)"/)[1])).metadata();
    if (image.includes('-4k.webp')) assert.equal(metadata.width,3840);
    assert.equal(Number(image.match(/width="(\d+)"/)[1]),metadata.width);
    assert.equal(Number(image.match(/height="(\d+)"/)[1]),metadata.height);
    assert(!piece.includes('max-width:700px'),'Visible phone images must load real media');
  } else {
    assert(piece.includes('muted loop playsinline') && piece.includes('preload="none"'));
    const video = piece.match(/<video[^>]+>/)[0];
    if (video.includes('width="3840" height="2880"')) {
      const poster = video.match(/poster="([^"]+)"/)[1];
      const {width, height} = await sharp(path.join(dist, poster)).metadata();
      assert.deepEqual([width, height], [3840, 2880], `${title(piece)} should have a native 4K poster`);
    }
  }
}
for (const match of page.matchAll(/<(?:img|script|link|a|video)\b[^>]*?\b(?:src|href|data-src|poster)="([^"]+)"/g)) {
  if (!match[1].startsWith('/') || match[1].startsWith('/_vercel/')) continue;
  const file = path.join(dist,match[1].split('?')[0]);
  assert(fs.existsSync(file),`Missing phone-page destination ${file}`);
}
for (const file of ['explorations/explorations.js']) new vm.Script(read(file),{filename:file});
assert(read('explorations/explorations.js').includes("PortfolioSounds?.play('image'"));
assert(read('explorations/explorations.js').includes('preventScroll:true'),'Closing a preview must retain the reading position');
console.log('PASS: responsive Work gallery, complete catalog parity, 4K stills, silent recording, live destinations, preview accessibility and shared sounds.');
