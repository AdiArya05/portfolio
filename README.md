# Aditya Arya — portfolio

Public site: https://adiarya.vercel.app/

Source: https://github.com/AdiArya05/portfolio

## Development and release

- `npm start` serves the static site at http://localhost:4173/.
- `npm test` validates gallery destinations, original image dimensions, local assets, JavaScript syntax, SEO metadata, structured data, crawl files and the calendar fallback.
- `npm run build` runs those checks. A failed check blocks a Vercel build.
- Push to `main` to deploy the connected Vercel project `adiarya`. The public URL stays the same.
- Edit `dist/index.html` and the scripts/assets in `dist/`. The GitHub calendar endpoint is in `api/`, with its parser in `lib/`.
- Run `npm ci` before testing a fresh checkout. `npm run optimize:images` regenerates the lossless WebP alternatives from the preserved PNG originals and verifies identical decoded pixels. Tests independently recheck gallery pixel equality and dimensions.
- Never commit `.env` files, tokens, local Vercel credentials or dependencies.

## Release checks — 15 October 2026

- Public page, robots.txt, sitemap.xml, social preview image, analytics script and GitHub calendar API returned HTTP 200.
- Canonical URL, indexable metadata, Open Graph/Twitter previews and Person/WebSite/ProfilePage structured data are present.
- Responsive browser checks covered 320×568, 390×844, 430×931, 768×1024, 1366×768, 1920×1080 and a large 3413×2160 viewport. No horizontal overflow or broken images were observed.
- Phone layout keeps the paragraph and inline icons, hides the gallery/footer and does not move the paragraph when the clock overlay opens.
- Gallery previews preserve their descriptions and project links. Keyboard focus is confined to an open preview and restored after closing.
- Images retain their original files; explicit dimensions reserve layout space and lazy loading defers offscreen requests where supported.
- Gallery animation pauses offscreen and in hidden tabs. The existing footer artwork and animation are unchanged.
- The Maritime Fusion link intentionally remains pointed at its private GitHub repository, as requested. Visitors without repository access will see GitHub's 404 page.

These are browser and static checks, not a guarantee across every physical device. No Lighthouse score, real-user Core Web Vitals pass or Google ranking is claimed. Search Console ownership, indexing and field performance should be checked separately; search engines determine rankings.

## Technical hardening — 15 October 2026

- Nine lossless image alternatives total 3,991,082 bytes versus 8,933,707 bytes for their PNG originals (55% smaller), without resizing or changing decoded pixels. Original fallback files remain available.
- Responsive pictures prevent the hidden phone gallery and skyline from being requested. Footer effects load only when a desktop visitor approaches the footer. A cold-cache 390×844 browser check confirmed no gallery, skyline, boat or hidden social-profile image requests.
- The exact existing Space Grotesk v22 Latin font is self-hosted and preloaded (22,320 bytes), removing the Google Fonts stylesheet and third-party font connection. Its SIL Open Font License is included in `dist/fonts/`.
- Project previews have a visible close button, forward/reverse keyboard focus cycling and safe focus restoration. Gallery auto-scrolling pauses while a keyboard user focuses a card. Theme switching works when local storage is blocked; invalid saved themes fall back to the system preference.
- Small light-mode text has stronger contrast. The paragraph, gallery titles/descriptions, links, imagery and approved engraving geometry were preserved.
- The former `portfolio-template-ochre-rho.vercel.app` host permanently redirects to the canonical `adiarya.vercel.app`, preserving paths. Basic MIME-sniffing protection and a cross-origin referrer policy are configured.

## Activity attribution

New commits use the GitHub-provided noreply address for `AdiArya05`. GitHub controls contribution eligibility and update timing. The website reads the real public contribution calendar through `/api/github-contributions`, with a cached fallback; it does not fabricate activity.
