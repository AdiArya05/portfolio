import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require(process.env.PORTFOLIO_SHARP_MODULE || 'sharp');
const art = (await readFile(new URL('../dist/media/singapore-engraving.svg',import.meta.url))).toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<rect width="1200" height="630" fill="#fbf8ef"/>
<image href="data:image/svg+xml;base64,${art}" x="0" y="75" width="1200" height="675"/>
<g font-family="Arial,Helvetica,sans-serif">
<text x="60" y="65" fill="#245a9c" font-size="15" font-weight="600" letter-spacing="2">SINGAPORE · INDEPENDENT PROJECTS</text>
<text x="56" y="157" fill="#171717" font-size="82" font-weight="600" letter-spacing="-4">Aditya Arya</text>
<text x="60" y="216" fill="#171717" font-size="30" letter-spacing="-.7">AI builder. Thoughtful products.</text>
<text x="60" y="262" fill="#77736b" font-size="23">Catch SG Buses · Soja · Maritime Fusion</text>
<rect x="48" y="554" width="242" height="48" rx="24" fill="#fbf8ef"/>
<text x="70" y="585" fill="#245a9c" font-size="22">adiarya.vercel.app</text>
</g></svg>`;
await sharp(Buffer.from(svg)).jpeg({quality:94,chromaSubsampling:'4:4:4'}).toFile(new URL('../dist/media/aditya-arya-social.jpg',import.meta.url).pathname);
