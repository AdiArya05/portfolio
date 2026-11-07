import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const dist = path.resolve(import.meta.dirname, '../dist');
const catalog = await fs.readFile(new URL('./gallery-cards.html', import.meta.url), 'utf8');
const story = await fs.readFile(path.join(dist, 'work/catch/index.html'), 'utf8');
const toolbar = story.match(/<header class="reading-toolbar"[\s\S]*?<\/header>/)[0];
const cards = [...catalog.matchAll(/<article class="card"[\s\S]*?<\/article>/g)].map(match => match[0]);
const attribute = (card, name) => card.match(new RegExp(`${name}="([^"]*)"`))?.[1] || '';
// Phone visitors start with motion, then Catch's Live Activity. The desktop reel keeps its own order.
const phoneLeadTitles = ['Income slider', 'Catch Live Activity'];
const phoneCards = [
  ...phoneLeadTitles.map(title => cards.find(card => attribute(card, 'data-title') === title)),
  ...cards.filter(card => !phoneLeadTitles.includes(attribute(card, 'data-title'))),
];
const caption = (title, route) => {
  const control = route
    ? `<a class="catalog-title" href="${route}">${title}</a>`
    : `<button class="catalog-title preview-label" type="button" aria-haspopup="dialog">${title}</button>`;
  return `<div class="catalog-caption">${control}<time datetime="2026">2026</time></div>`;
};
const motionTile = (title, attributes, video, route = '') => `<article class="exploration" ${attributes}>
        <div class="motion-stage">
          <button class="preview-open" type="button" aria-haspopup="dialog" aria-label="Open ${title} preview">${video}<img class="motion-poster" src="${attribute(video, 'poster')}" alt="" loading="${title === 'Income Slider' ? 'eager' : 'lazy'}" decoding="async" /></button>
          <button class="motion-toggle" type="button" aria-label="Play ${attribute(video, 'data-name')} preview" data-playing="false"><svg class="motion-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5.5c0-1.1 1.2-1.8 2.15-1.23l11 6.5a1.43 1.43 0 0 1 0 2.46l-11 6.5C8.2 20.3 7 19.6 7 18.5v-13Z" fill="currentColor" /></svg><svg class="motion-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4h2.25c.83 0 1.5.67 1.5 1.5v13c0 .83-.67 1.5-1.5 1.5H6.5c-.83 0-1.5-.67-1.5-1.5v-13c0-.83.67-1.5 1.5-1.5Zm8.75 0h2.25c.83 0 1.5.67 1.5 1.5v13c0 .83-.67 1.5-1.5 1.5h-2.25c-.83 0-1.5-.67-1.5-1.5v-13c0-.83.67-1.5 1.5-1.5Z" fill="currentColor" /></svg></button>
        </div>
        ${caption(title, route)}
      </article>`;
const catalogFeed = phoneCards.map((card, index) => {
  const title = attribute(card, 'data-title').replace(/\b[a-z]/g, letter => letter.toUpperCase());
  const description = attribute(card, 'data-description');
  const route = attribute(card, 'data-case-study');
  const destination = route ? '' : attribute(card, 'data-link');
  const label = attribute(card, 'data-link-label');
  const attributes = `data-title="${title}" data-description="${description}" data-destination="${destination}" data-action="${label}"${route ? ` data-case-study="${route}"` : ''}`;
  if (card.includes('data-motion=')) {
    const video = card.match(/<video[^>]+><\/video>/)[0];
    return motionTile(title, attributes, video, route);
  }
  let image = card.match(/<img class="card-media"[^>]+>/)[0].replaceAll('="media/', '="/media/');
  if (index < 2) image = image.replace('loading="lazy"', 'loading="eager" fetchpriority="high"');
  return `<article class="exploration" ${attributes}>
        <button class="preview-open" type="button" aria-haspopup="dialog" aria-label="Open ${title} preview">${image}</button>
        ${caption(title, route)}
      </article>`;
});

const extraMedia = [
  ['Scroll Controls', '/media/scroll-controls.webp', '', 'Glass Back to top and Scroll down buttons'],
  ['Codex Usage Menu Bar', '/media/codex-usage-menu-bar.webp', '', 'Codex Usage in the macOS menu bar, showing weekly usage and reset credits in a glass popover'],
  ['Soja Onboarding', '/media/soja-welcome-framed-4k.webp', '/work/soja/', 'Soja onboarding on an iPhone, with an amber background and an Apple sign-in button'],
  ['Soja Recovery Overview', '/work/soja/media/final-overview.webp', '/work/soja/', 'Soja’s daily recovery timeline with scheduled wake-up, bright light and first meal times'],
  ['Soja Welcome Screen', '/work/soja/media/final-welcome.webp', '/work/soja/', 'Soja’s welcome screen with the app name, sleep tagline and sign-in options']
];
const extraFeed = await Promise.all(extraMedia.map(async ([title, src, route, alt = title]) => {
  const {width, height} = await sharp(path.join(dist, src)).metadata();
  return `<article class="exploration" data-title="${title}"${route ? ` data-case-study="${route}"` : ''}>
    <button class="preview-open" type="button" aria-haspopup="dialog" aria-label="Open ${title} preview"><img class="card-media" src="${src}" width="${width}" height="${height}" alt="${alt}" loading="lazy" decoding="async"></button>
    ${caption(title, route)}
  </article>`;
}));

const recoveryIndex = phoneCards.findIndex(card => attribute(card, 'data-title') === 'Soja Recovery');
const [scrollControls, codexUsage, onboarding, overview, welcome] = extraFeed;
const [worldClock, musicPlayer] = [['World Clock', 'world-clock-motion'], ['Music Player', 'spotify-player-motion']].map(([title, filename]) => {
  const video = `<video class="card-media" width="3840" height="2880" poster="/media/${filename}.webp?v=4k-stream" data-src="/media/${filename}.mp4?v=4k-stream" data-name="${title}" preload="none" muted loop playsinline disablepictureinpicture tabindex="-1" aria-hidden="true"></video>`;
  return motionTile(title, `data-title="${title}"`, video);
});
const workFeed = catalogFeed.filter((_, index) => index !== recoveryIndex);
const sailorfyIndex = workFeed.findIndex(card => attribute(card, 'data-title') === 'Sailorfy');
workFeed.splice(sailorfyIndex, 0, worldClock, codexUsage, scrollControls, musicPlayer);
workFeed.push(onboarding, catalogFeed[recoveryIndex], overview, welcome);

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Work — Aditya Arya</title>
  <link rel="preload" as="image" href="/media/income-slider-iphone17pro.webp" />
  <meta name="description" content="Interfaces, websites and motion studies by Aditya Arya." />
  <meta name="theme-color" content="#fafafa" />
  <link rel="icon" href="/media/aditya-arya-icon.png" />
  <link rel="canonical" href="https://adiarya.vercel.app/work" />
  <script src="/media-motion.js?v=20261105-tabs" defer></script>
  <script src="/media-dialog.js?v=20261107-shared-preview" defer></script>
  <link rel="stylesheet" href="/typography.css?v=20261107-cursor" />
  <link rel="stylesheet" href="/work/case-study.css?v=20261104-neutral" />
  <link rel="stylesheet" href="/world-times.css?v=20261019-v17" />
  <link rel="stylesheet" href="/interface-controls.css?v=20261019-v26" />
  <link rel="stylesheet" href="/work/reading-toolbar.css?v=20261019-v25" />
  <link rel="stylesheet" href="/explorations/explorations.css?v=20261107-poster" />
  <script src="/media-sounds.js?v=20261021-v28" defer></script>
  <script src="/interface-sounds.js?v=20261022-v28" defer></script>
  <script src="/world-times.js?v=20261107-spotify-profile" defer></script>
  <script src="/explorations/explorations.js?v=20261107-shared-preview" defer></script>
  <script src="/motion-gallery.js?v=20261107-poster" defer></script>
  <script src="/story-glass.js?v=20261019-v22" defer></script>
  <link rel="stylesheet" href="/media-dialog.css?v=20261022-v1" />
  <link rel="stylesheet" href="/media-motion.css?v=20261105-escape" />
  <link rel="stylesheet" href="/portfolio-pages.css?v=62" />
  <script src="/back-to-top.js?v=3" defer></script>
  <script src="/portfolio-nav.js?v=4" defer></script>
</head>
<body class="reading-page explorations-view">
  ${toolbar.replace('href="/work/">Work', 'href="/work/" aria-current="page">Work').replace('href="/stories/" aria-current="page"','href="/stories/"')}
  <main id="explorations" class="explorations-page">
    <header class="explorations-header">
      <h1>Work</h1>
    </header>
    <section class="explorations-feed" aria-label="Interfaces, websites and motion studies">
      ${workFeed.join('\n      ')}
    </section>
    <footer class="explorations-footer"><a class="back-link" data-liquid-glass href="/"><svg class="glass-symbol" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="currentColor"/><path d="M17 12H7m4-4-4 4 4 4" fill="none" stroke="white" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>Back to home</a></footer>
  </main>
  <dialog id="media-viewer" aria-label="Media preview">
    <div class="viewer-stage"><img id="modal-image" alt="" hidden /><video id="modal-video" controls muted loop playsinline hidden aria-label="Animation playback"></video></div>
    <button class="modal-close" data-liquid-glass type="button" aria-label="Close project preview"><span class="dismiss-key" aria-hidden="true">Esc to cancel</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg></button>
  </dialog>
</body>
</html>
`;

await fs.mkdir(path.join(dist, 'explorations'), {recursive:true});
await fs.writeFile(path.join(dist, 'work/index.html'), html);
console.log(`Built Work gallery with ${workFeed.length} media tiles.`);

await fs.writeFile(path.join(dist, 'explorations/index.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=/work/"><title>Work — Aditya Arya</title></head>
<body><a href="/work/">Continue to Work</a></body></html>\n`);

// The home document owns the tabs. Keep the individual documents as direct-link fallbacks.
const indexPath = path.join(dist, 'index.html');
const index = await fs.readFile(indexPath, 'utf8');
const panels = await Promise.all([
  ['work', html],
  ['stories', await fs.readFile(path.join(dist, 'stories/index.html'), 'utf8')],
  ['icons', await fs.readFile(path.join(dist, 'icons/index.html'), 'utf8')],
].map(async ([name, page]) => {
  const main = page.match(/<main\b[\s\S]*?<\/main>/)[0]
    .replace('<main ', `<main data-portfolio-panel="${name}" aria-label="${name === 'stories' ? 'Explorations' : name[0].toUpperCase() + name.slice(1)}" hidden `)
    .replace(/<header class="explorations-header">[\s\S]*?<\/header>\s*/, '')
    .replace(/<h1>[^<]+<\/h1>\s*/, '')
    .replace('data-liquid-glass href="/">','data-liquid-glass href="#index">')
    .replaceAll('loading="eager" fetchpriority="high"', 'loading="lazy"');
  if (name !== 'work') return main;
  const dialog = page.match(/<dialog\b[\s\S]*?<\/dialog>/)[0].replaceAll('id="modal-', 'id="work-modal-');
  return `${main}\n    ${dialog}`;
}));
await fs.writeFile(indexPath, index.replace(
  /<!-- portfolio-tabs:start -->[\s\S]*?<!-- portfolio-tabs:end -->/,
  `<!-- portfolio-tabs:start -->\n    ${panels.join('\n    ')}\n    <!-- portfolio-tabs:end -->`
));
