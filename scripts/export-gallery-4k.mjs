import path from 'node:path';
import sharp from 'sharp';

const media = path.resolve(import.meta.dirname, '../dist/media');
const names = ['sailorfy-showcase', 'soja-recovery', 'catch-live-board', 'catch-live-detail', 'soja-website', 'catch-map'];

// Preserve the supplied composition and pixels; these are upscaled exports,
// not new detail or a change to the original source files.
for (const name of names) {
  const output = await sharp(path.join(media, `${name}.png`))
    .resize({width:3840, kernel:'lanczos3'})
    .keepIccProfile()
    .webp({lossless:true, effort:6})
    .toFile(path.join(media, `${name}-4k.webp`));
  console.log(`${name}: ${output.width}×${output.height}, ${Math.round(output.size / 1024)}KB`);
}
