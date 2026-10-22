import fs from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve(import.meta.dirname, '../dist');
const home = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
const story = await fs.readFile(path.join(dist, 'work/catch/index.html'), 'utf8');
const toolbar = story.match(/<header class="reading-toolbar"[\s\S]*?<\/header>/)[0];
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
  <meta name="theme-color" content="#fbf8ef" />
  <link rel="icon" href="/media/aditya-arya-icon.png" />
  <link rel="canonical" href="https://adiarya.vercel.app/explorations" />
  <script src="/explorations/phone-only.js?v=20261022-v1"></script>
  <script src="/work/theme-init.js"></script>
  <link rel="preload" href="/fonts/space-grotesk-v22-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/typography.css?v=20261019-original-v20" />
  <link rel="stylesheet" href="/work/case-study.css?v=20261019-v25" />
  <link rel="stylesheet" href="/world-times.css?v=20261019-v17" />
  <link rel="stylesheet" href="/interface-controls.css?v=20261019-v26" />
  <link rel="stylesheet" href="/work/reading-toolbar.css?v=20261019-v25" />
  <link rel="stylesheet" href="/explorations/explorations.css?v=20261022-v3" />
  <link rel="stylesheet" href="/modal-glass.css?v=20261019-v22" />
  <script src="/media-sounds.js?v=20261021-v28" defer></script>
  <script src="/interface-sounds.js?v=20261021-v27" defer></script>
  <script src="/world-times.js?v=20261019-v17" defer></script>
  <script src="/explorations/explorations.js?v=20261022-v2" defer></script>
  <script src="/motion-gallery.js?v=20261022-v1" defer></script>
  <script src="/story-glass.js?v=20261019-v22" defer></script>
</head>
<body class="reading-page explorations-view">
  ${toolbar}
  <nav class="site-nav" aria-label="Main navigation"><a class="back-link" href="/"><span aria-hidden="true">←</span> Back to home</a></nav>
  <main id="explorations" class="explorations-page">
    <header class="explorations-header">
      <div class="explorations-identity"><img class="explorations-avatar" src="/media/aditya-arya-icon.png" width="44" height="44" alt="Aditya Arya" /><div><span class="explorations-author">Aditya Arya</span><h1>Explorations</h1></div></div>
      <p>Interfaces, websites and motion studies.</p>
    </header>
    <section class="explorations-feed" aria-label="Interfaces, websites and motion studies">
      ${feed}
    </section>
    <footer class="explorations-footer"><a class="back-link" href="/">← Back to home</a><a href="#explorations">Back to top ↑</a></footer>
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
