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
assert(cards.every(card => pieces.some(piece => title(piece) === title(card))), 'Work must include all catalog media');
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
assert.equal(title(pieces[0]),'Income slider','Lead with the recording on phone');
assert.equal(title(cards[1]),'Income slider','Keep the recording second on desktop');
assert.equal(title(pieces[1]),'Catch Live Activity');
assert(pieces.every(piece => piece.includes('class="catalog-title') && piece.includes('<time datetime=')), 'Each Work tile has a preview title and year');
const toolbar = page.match(/<header class="reading-toolbar"[\s\S]*?<\/header>/)?.[0];
assert(toolbar?.includes('class="portfolio-nav"') && toolbar.includes('id="time-zones"'), 'Use the case studies opaque reading toolbar');
assert(page.includes('/typography.css') && page.includes('/work/reading-toolbar.css') && page.includes('/interface-controls.css'));
assert(page.includes('/interface-sounds.js') && page.includes('/world-times.js'));
assert(page.includes('Back to home') && page.includes('Back to top'));
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
  } else assert(piece.includes('muted loop playsinline') && piece.includes('preload="none"'));
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
