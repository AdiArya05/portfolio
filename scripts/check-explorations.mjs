import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import sharp from 'sharp';

const dist = path.resolve(import.meta.dirname, '../dist');
const read = file => fs.readFileSync(path.join(dist,file),'utf8');
const home = read('index.html');
const page = read('explorations/index.html');
const cards = [...home.matchAll(/<article class="card"[\s\S]*?<\/article>/g)].map(m => m[0]);
const pieces = [...page.matchAll(/<article class="exploration"[\s\S]*?<\/article>/g)].map(m => m[0]);
const title = html => html.match(/data-title="([^"]+)"/)[1];
assert.deepEqual(pieces.map(title).sort(),cards.map(title).sort(),'Phone and desktop must contain the same selected work');
assert.equal(title(pieces[0]),'Income slider','Lead with the recording on phone');
assert.equal(title(cards[2]),'Income slider','Keep the recording third on desktop');
assert.equal(title(pieces[1]),'Catch Live Activity');
assert(!page.includes('exploration-caption'), 'Keep labels and descriptions out of the media feed');
assert(home.includes('class="mobile-explorations-link" href="/explorations/"'),'Give phone visitors a discoverable entry point');
assert(read('motion-gallery.css').includes('.shell > .gallery-wrap { display:none !important; }'),'Keep the reel off the phone homepage');
assert(!read('motion-gallery.css').includes('display:block !important; height:auto'),'Do not restore the phone reel');
const toolbar = page.match(/<header class="reading-toolbar"[\s\S]*?<\/header>/)?.[0];
assert(toolbar?.includes('id="theme-toggle"') && toolbar.includes('id="time-zones"'), 'Use the case studies opaque reading toolbar');
assert(page.includes('src="/media/aditya-arya-icon.png" width="44" height="44"'), 'Restore the original profile portrait');
assert(!page.includes('aditya-profile.jpg') && !page.includes('section-nav'), 'Use the portfolio identity rather than the reference layout');
assert(page.includes('/typography.css') && page.includes('/work/reading-toolbar.css') && page.includes('/interface-controls.css'));
assert(page.includes('/interface-sounds.js') && page.includes('/world-times.js'));
assert(page.includes('Back to home') && page.includes('Back to top'));
assert(page.includes('<dialog') && page.includes('aria-labelledby="modal-title"') && page.includes('aria-describedby="modal-description"'));
assert(page.includes('viewport-fit=cover'));
assert(!page.includes('Previous Portfolio') && !page.includes('catch-live-board-motion') && !page.includes('soja-welcome.'));
assert(read('explorations/phone-only.js').includes('(hover:hover) and (pointer:fine)') && read('explorations/phone-only.js').includes("location.replace('/')"),'Desktop visitors return to the original homepage; phone landscape stays supported');
for (const piece of pieces) {
  assert(piece.includes('aria-haspopup="dialog"'));
  const image = piece.match(/<img class="card-media"[^>]+>/)?.[0];
  if (image) {
    const metadata = await sharp(path.join(dist,image.match(/src="([^"]+)"/)[1])).metadata();
    assert.equal(metadata.width,3840);
    assert.equal(Number(image.match(/width="(\d+)"/)[1]),metadata.width);
    assert.equal(Number(image.match(/height="(\d+)"/)[1]),metadata.height);
    assert(!piece.includes('max-width:700px'),'Visible phone images must load real media');
  } else assert(piece.includes('muted loop playsinline') && piece.includes('preload="none"'));
}
for (const match of page.matchAll(/<(?:img|script|link|a|video)\b[^>]*?\b(?:src|href|data-src|poster)="([^"]+)"/g)) {
  if (!match[1].startsWith('/')) continue;
  const file = path.join(dist,match[1].split('?')[0]);
  assert(fs.existsSync(file),`Missing phone-page destination ${file}`);
}
for (const file of ['explorations/phone-only.js','explorations/explorations.js']) new vm.Script(read(file),{filename:file});
assert(read('explorations/explorations.js').includes("PortfolioSounds?.play('image'"));
assert(read('explorations/explorations.js').includes('preventScroll:true'),'Closing a preview must retain the reading position');
console.log('PASS: phone-only explorations, complete gallery parity, 4K stills, silent recording, live destinations, preview accessibility and shared sounds.');
