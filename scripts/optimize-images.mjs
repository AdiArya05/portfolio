import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';

const media = path.resolve(import.meta.dirname, '../dist/media');
const names = ['sailorfy-showcase', 'soja-recovery', 'catch-live-board', 'portfolio-showcase', 'soja-welcome', 'catch-live-detail', 'soja-website', 'catch-map', 'catch-icon'];
let before = 0;
let after = 0;
for (const name of names) {
  const original = path.join(media, `${name}.png`);
  const output = path.join(media, `${name}.webp`);
  await sharp(original).keepIccProfile().webp({ lossless: true, effort: 6 }).toFile(output);
  const source = await sharp(original).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const result = await sharp(output).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.deepEqual(result.info, source.info, `${name}: dimensions and channels must stay identical`);
  assert(source.data.equals(result.data), `${name}: decoded pixels must stay identical`);
  const originalSize = (await fs.stat(original)).size;
  const outputSize = (await fs.stat(output)).size;
  assert(outputSize < originalSize, `${name}: optimized file must be smaller`);
  before += originalSize;
  after += outputSize;
  console.log(`${name}: ${originalSize} -> ${outputSize} bytes; identical decoded pixels`);
}
console.log(`TOTAL: ${before} -> ${after} bytes (${Math.round((1 - after / before) * 100)}% smaller), no resizing.`);
