# Aditya Arya — portfolio

Public site: https://adiarya.vercel.app/

Source: https://github.com/AdiArya05/portfiio

## Development and release

- `npm start` serves the static site at http://localhost:4173/.
- `npm test` validates gallery destinations, original image dimensions, local assets, JavaScript syntax, SEO metadata, structured data, crawl files and the calendar fallback.
- `npm run build` runs those checks. A failed check blocks a Vercel build.
- Push to `main` to deploy the connected Vercel project `adiarya`. The public URL stays the same.
- Edit `dist/index.html` and the scripts/assets in `dist/`. The GitHub calendar endpoint is in `api/`, with its parser in `lib/`.
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

## Activity attribution

New commits use the GitHub-provided noreply address for `AdiArya05`. GitHub controls contribution eligibility and update timing. The website reads the real public contribution calendar through `/api/github-contributions`, with a cached fallback; it does not fabricate activity.
