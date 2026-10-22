import fs from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve(import.meta.dirname, '../dist');
const home = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
const cards = [...home.matchAll(/<article class="card"[\s\S]*?<\/article>/g)].map(match => match[0]);
const attribute = (card, name) => card.match(new RegExp(`${name}="([^"]*)"`))?.[1] || '';
const feed = cards.map(card => {
  const title = attribute(card, 'data-title');
  const description = attribute(card, 'data-description');
  const route = attribute(card, 'data-case-study');
  const destination = route || attribute(card, 'data-link');
  const label = route ? 'Explore case study' : attribute(card, 'data-link-label');
  const attributes = `data-title="${title}" data-description="${description}" data-destination="${destination}" data-action="${label}"${route ? ` data-case-study="${route}"` : ''}`;
  if (card.includes('data-motion=')) {
    const video = card.match(/<video[^>]+><\/video>/)[0];
    const toggle = card.match(/<button class="motion-toggle"[\s\S]*?<\/button>/)[0];
    return `<article class="exploration" ${attributes}>
        <div class="motion-stage">
          <button class="preview-open" type="button" aria-haspopup="dialog" aria-label="Open ${title} preview">${video}</button>
          ${toggle}
        </div>
      </article>`;
  }
  const image = card.match(/<img class="card-media"[^>]+>/)[0].replaceAll('="media/', '="/media/');
  return `<article class="exploration" ${attributes}>
        <button class="preview-open" type="button" aria-haspopup="dialog" aria-label="Open ${title} preview">${image}</button>
      </article>`;
}).join('\n      ');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Explorations — Aditya Arya</title>
  <meta name="description" content="Interfaces, websites and motion studies by Aditya Arya." />
  <meta name="robots" content="noindex" />
  <meta name="theme-color" content="#ffffff" />
  <link rel="canonical" href="https://adiarya.vercel.app/explorations" />
  <script src="/explorations/phone-only.js?v=20261022-v1"></script>
  <script src="/work/theme-init.js"></script>
  <link rel="stylesheet" href="/explorations/explorations.css?v=20261022-v1" />
  <link rel="stylesheet" href="/modal-glass.css?v=20261019-v22" />
  <script src="/media-sounds.js?v=20261021-v28" defer></script>
  <script src="/explorations/explorations.js?v=20261022-v1" defer></script>
  <script src="/motion-gallery.js?v=20261022-v1" defer></script>
  <script src="/story-glass.js?v=20261019-v22" defer></script>
</head>
<body>
  <main id="explorations" class="explorations-page">
    <header class="profile">
      <a class="profile-avatar" href="/" aria-label="Back to the homepage"><img src="/media/aditya-profile.jpg" width="32" height="32" alt="" /></a>
      <h1>Aditya Arya</h1>
      <p>Designing and building apps.</p>
      <nav class="section-nav" aria-label="Portfolio sections">
        <a href="/">Work</a>
        <a href="/explorations/" aria-current="page">Explorations</a>
        <a href="/work/catch/">Catch</a>
        <a href="/work/soja/">Soja</a>
      </nav>
    </header>
    <section class="explorations-feed" aria-label="Interfaces, websites and motion studies">
      ${feed}
    </section>
    <footer class="explorations-footer"><a href="/">Back to work</a><button type="button" id="appearance">Dark appearance</button></footer>
  </main>
  <dialog class="modal-panel" id="media-viewer" aria-labelledby="modal-title" aria-describedby="modal-description">
    <div class="viewer-stage"><img id="modal-image" alt="" hidden /><video id="modal-video" controls muted loop playsinline hidden aria-label="Animation playback"></video></div>
    <div class="modal-details">
      <span class="modal-copy"><strong id="modal-title"></strong><span id="modal-description"></span></span>
      <span class="modal-actions"><a class="modal-link" data-liquid-glass id="modal-link" href="#" hidden></a><button class="modal-close" data-liquid-glass type="button" aria-label="Close project preview"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg></button></span>
    </div>
  </dialog>
</body>
</html>
`;

await fs.mkdir(path.join(dist, 'explorations'), {recursive:true});
await fs.writeFile(path.join(dist, 'explorations/index.html'), html);
console.log(`Built phone explorations from ${cards.length} current gallery pieces.`);
