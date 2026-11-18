import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require(process.env.PORTFOLIO_SHARP_MODULE || 'sharp');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const stories = [
  {
    slug: 'wayauto', title: ['Designing the', 'WayAuto icon'],
    description: 'App icon design',
    image: 'work/wayauto/media/index-hover.webp',
  },
  {
    slug: 'catch', title: ['Designing', 'Catch'],
    description: 'A bus app for Singapore',
    image: 'media/catch-live-detail-4k.webp',
  },
  {
    slug: 'soja', title: ['Building', 'Soja'],
    description: 'A daily rhythm for better sleep',
    image: 'media/soja-recovery-4k.webp',
  },
];

for (const story of stories) {
  const artwork = await sharp(path.join(dist, story.image))
    .resize(920, 690, {fit: 'contain', background: '#faf9f6'})
    .png().toBuffer();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs><clipPath id="art"><rect x="672" y="142" width="460" height="345" rx="26"/></clipPath></defs>
    <rect width="1200" height="630" fill="#faf9f6"/>
    <g font-family="Helvetica Neue, Helvetica, Arial, sans-serif" fill="#202124">
      <text x="68" y="122" font-size="24">Aditya Arya</text>
      <text x="65" y="280" font-size="68" font-weight="600" letter-spacing="-2.6">${story.title[0]}</text>
      <text x="65" y="359" font-size="68" font-weight="600" letter-spacing="-2.6">${story.title[1]}</text>
      <text x="68" y="416" font-size="23" fill="#71717a">${story.description}</text>
      <text x="68" y="550" font-size="21" fill="#71717a">adiarya.com</text>
    </g>
    <image x="672" y="142" width="460" height="345" clip-path="url(#art)" href="data:image/png;base64,${artwork.toString('base64')}"/>
  </svg>`;
  const filename = path.join(dist, 'media', `${story.slug}-article-preview.jpg`);
  await sharp(Buffer.from(svg)).jpeg({quality:94, chromaSubsampling:'4:4:4'}).toFile(filename);
  console.log('Created', path.relative(root, filename));
}
