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
- The Maritime Fusion link opens the user-provided Google Drive demo instead of the private GitHub repository (updated 16 October 2026). An anonymous request returned the demo viewer without a sign-in redirect or access-required message; Drive sharing permissions are managed separately.

These are browser and static checks, not a guarantee across every physical device. No Lighthouse score, real-user Core Web Vitals pass or Google ranking is claimed. Search Console ownership, indexing and field performance should be checked separately; search engines determine rankings.

## Technical hardening — 15 October 2026

- Nine lossless image alternatives total 3,991,082 bytes versus 8,933,707 bytes for their PNG originals (55% smaller), without resizing or changing decoded pixels. Original fallback files remain available.
- Responsive pictures prevent the hidden phone gallery and skyline from being requested. Footer effects prepare in desktop idle time, avoiding first construction during the reveal. A cold-cache 390×844 browser check confirmed no gallery, skyline, boat or hidden social-profile image requests.
- The exact existing Space Grotesk v22 Latin font is self-hosted and preloaded (22,320 bytes), removing the Google Fonts stylesheet and third-party font connection. Its SIL Open Font License is included in `dist/fonts/`.
- Project previews have a visible close button, forward/reverse keyboard focus cycling and safe focus restoration. Gallery auto-scrolling pauses while a keyboard user focuses a card. Theme switching works when local storage is blocked; invalid saved themes fall back to the system preference.
- Small light-mode text has stronger contrast. The paragraph, gallery titles/descriptions, links, imagery and approved engraving geometry were preserved.
- The former `portfolio-template-ochre-rho.vercel.app` host permanently redirects to the canonical `adiarya.vercel.app`, preserving paths. Basic MIME-sniffing protection and a cross-origin referrer policy are configured.
- During document scrolling, gallery work and decorative skyline motion pause, and the hover lens clears. Native scrolling remains untouched; effects resume on document `scrollend` (with a 160 ms quiet-period fallback). Nested gallery scroll-end events cannot resume them prematurely. Scene attachment is also postponed until scrolling settles. No scroll sound, resistance or hold gesture was added.

## Activity attribution

New commits use the GitHub-provided noreply address for `AdiArya05`. GitHub controls contribution eligibility and update timing. The website reads the real public contribution calendar through `/api/github-contributions`, with a cached fallback; it does not fabricate activity.

## Local project-navigator trial — 18 October 2026

The gallery keeps its original rounded-pill appearance, enlarged slightly with upright capsule markers, and adds Codex-inspired navigation. Hovering gently magnifies nearby capsules and smoothly tracks the pointer with the existing project title/description preview; selecting a capsule scrolls to the corresponding image. Wheel input over the pill stays within the gallery. Arrow keys, Home/End, Enter/Space and Escape are supported. The active marker uses actual card offsets rather than equal percentages, so differently sized images stay correctly mapped. Gallery auto-scrolling pauses during navigation and rail interaction. Reduced motion uses instant jumps; the existing paragraph-only phone layout is unchanged. This trial has not been published.

`npm run test:navigator` exercises marker tracking, loop boundaries, preview bounds, hover reset, smooth/instant selection and navigation pausing without native image dependencies. The regular build runs this alongside the existing image-quality and site checks.

## Project stories — 18 October 2026

Local pages: `http://localhost:4173/work/soja/` and `http://localhost:4173/work/catch/`.

- Soja in `dist/work/soja/index.html` now uses the owner’s personal story: the New York flight and Timeshifter starting point, late-night studying, Figma exploration with Supersleep as a reference, and his brother’s feedback about cognitive load. Catch in `dist/work/catch/index.html` remains an illustrative template.
- Both pages use `dist/work/case-study.css`, locally hosted Inter, saved light/dark preference, image enlargement, previous/next navigation, and links back home. Replace image `src`, descriptive `alt`, `width`, and `height` together.
- All six Soja/Catch gallery images and their “Read story” links open the relevant page in the same tab using native links. The other two gallery previews retain their existing behavior. Loop duplicates stay out of the keyboard tab order.
- “Project notes” links provide access on phones, where the animated gallery remains hidden. The mobile text-fitting calculation reserves space for these links.
- Catch remains marked “Draft copy”. Soja’s sample marker has been removed. Both pages remain excluded from indexing and unpublished; publishing still needs canonical/social metadata and sitemap entries.
- `npm run build` also verifies the six story destinations, both documents, their local assets, original image dimensions and shared scripts. This local work has not been deployed.

## Minimal story typography — 18 October 2026

The broader homepage restyle was reverted. The original homepage typography, dot-matrix clock, cream palette and gallery controls remain. Project stories use a white reading surface, locally hosted Inter (from the official Inter project, SIL OFL included), 14px body text at 1.65 line height, and small medium-weight headings, matching the supplied Cleon reference. Extra role fields, Figma cards and contact panels were removed. Catch’s sample story remains a draft; both pages remain unpublished.

## Personal Soja story and screen progression — 18 October 2026

`dist/work/soja/soja.css` adds a responsive four-stage progression figure with the supplied screens, drawn dotted arrows and handwritten notes using locally hosted Kalam (SIL OFL included). Its styles are scoped to Soja. The six supplied images are saved in `dist/work/soja/media/` as full-resolution lossless WebP; decoded pixel equality was verified against every supplied PNG. Each image opens its complete original composition in the existing lightbox. Final welcome and overview screens are included alongside the home-screen hero.

`review/soja/` contains desktop/mobile screenshots, an exported progression graphic, and `verification.json`. The build, desktop/tablet/mobile layout checks, and lightbox Escape/focus-return checks passed. The portfolio homepage remains unchanged.

### Soja story refinement

The Soja page now uses 17px body text, 22px title text, 19px section headings, and larger captions/navigation. It expands the personal story with scope decisions, specific Figma explorations, the brother’s feedback, and lessons about hierarchy and revisiting design decisions. No adoption or retention results are claimed. The progression uses Kalam handwriting with subtle rotation differences; the fourth screen is displayed as a flat interface crop through CSS, with the complete original image retained for zoom. The Catch template and portfolio homepage are unchanged. Updated screenshots are `review/soja/progression-v2.jpg`, `desktop-v2-full.jpg`, and `mobile-v2-full.jpg`.

### Homepage overview and shared appearance

The homepage now contains nine gallery items, adding the supplied Soja Overview image in `dist/media/soja-overview.png` and a pixel-identical lossless WebP. Its gallery card and ninth marker open the Soja story. Navigator fixtures now cover nine entries, including the new last item and loop wrap.

Both story pages use the homepage’s Space Grotesk font, exact light/dark colour tokens, saved theme, and matching 104×52 sun/moon control. Headers say “Back to home” and omit the signature. Soja uses 16px body copy, Patrick Hand annotations, more visible dashed arrows, and the original fourth phone mockup. The final welcome/overview presentations use a scalable SVG alpha mask and a soft shadow to blend into either theme; all original screenshot pixels remain available in image zoom. No raster screen content was edited.

Latest proof is in `review/soja/progression-v3.jpg`, `final-screens-v3-light.jpg`, `final-screens-v3-dark.jpg`, `homepage-overview-v3.jpg`, and `mobile-v3-full.jpg`. Build, mobile overflow, keyboard theme selection, shared theme persistence across home/Soja/Catch, and image zoom checks passed. Changes remain local and unpublished.

## Personal Catch story — 19 October 2026

`dist/work/catch/index.html` now replaces the sample with the owner’s interview: his motivation for a calmer bus app, simplifying the home screen, moving extra information into stops, Live Activities, and the feedback-led map. It explicitly credits his design work in Figma, Mobbin references, and Codex-assisted implementation. Lessons use the Weekly Sync experiences with the Yash/Adi name mismatch, Summerdale autocorrect, and cold-start shortcut testing; no adoption metrics or unverified fixes are claimed.

The supplied early Figma screen is saved at original 1206×2622 resolution in `dist/work/catch/media/early-home.webp`, with decoded pixel equality checked against the PNG. A Patrick Hand annotation and dashed arrow pair it with the final stop-detail image; the caption distinguishes the two surfaces. `catch.css` matches Soja’s 16px reading size and the shared homepage font, themes, navigation, and image lightbox. The map uses the same phone mask presentation as Soja.

Build and diff checks passed. Browser verification covered desktop 1440px, tablet 768px and phone 390px without horizontal overflow, loaded images, image enlargement/Escape/focus return, keyboard theme selection, Back to home, and saved theme across navigation. Proof is in `review/catch/`. This is local and unpublished; story indexing remains disabled.

## Onboarding, home progression, and icon studies — 19 October 2026

Soja now includes the supplied onboarding composition and three app icons. Catch’s progression now compares the supplied early and current home screens at matching widths, with updated labels and caption. All seven supplied Catch icon variants are included. Both icon studies use the shared `dist/work/app-icons.css` for rounded artwork, wrapped rows, and Patrick Hand labels inspired by the supplied reference layout. Labels describe colours/materials rather than claiming production or environment roles.

The Catch map and Soja welcome/overview images show their complete original 4:3 compositions again. Their masks, artificial shadows, and portrait crops were removed. New source images are saved as full-resolution lossless WebP, and decoded pixel equality for all 12 files is recorded in `review/story-assets-oct19.json`. No homepage gallery changes were made.

Build and diff checks passed; both pages were checked at desktop and phone sizes, including dark mode and image enlargement. Additional proof is in `review/catch/progression-v2-light.jpg`, `icons-light.jpg`, `map-full-v2.jpg`, `mobile-v2-dark.jpg`, and `review/soja/icons-v4-light.jpg`, `onboarding-v4.jpg`, `mobile-v4-dark.jpg`. Work remains local and unpublished.

### Soja original compositions and visible icons

The three Soja app icons now sit directly after the introduction in a clearly named `#app-icons` section. The final home image in the progression preserves its entire original 4:3 composition instead of a portrait crop. All final Soja compositions explicitly disable masking and retain their original image proportions. The Soja stylesheet version changed to `originals-v5` so reloaded documents fetch the current styles. Review link: `http://localhost:4173/work/soja/?v=originals-5#app-icons`. Screenshots: `review/soja/icons-v5-dark.jpg` and `original-final-screens-v5-dark.jpg`.

### Soja image grouping — 19 October 2026

The process figure now contains three matching early Figma frames. The mismatched fourth mockup moved into a single 2×2 app-screen grid with onboarding, welcome, home, and overview; every original 4:3 composition remains intact. The icons follow all screen images. Both image groups use the same 840px maximum width and consistent captions. On phones, the early frames and final images stack in reading order. Catch and shared icon styles are byte-for-byte unchanged.

The local preview server was restarted after a connection-refused response. HTML and stylesheet requests returned 200. Build, diff, 1280px/390px overflow, theme, and final-image zoom checks passed. Proof: `review/soja/screens-and-icons-v6-dark.jpg`, `process-v6-dark.jpg`, `mobile-v6-dark.jpg`, and `verification-v6.json`. Review at `http://localhost:4173/work/soja/?v=layout-6#app-screens`.

## App icon home-screen mockups — 19 October 2026

Built-in imagegen edited the supplied iPhone reference compositions with Catch and Soja app icons. The selected files are `dist/media/catch-icon-mockup-v4.png` and `soja-icon-mockup.png`, with pixel-identical lossless WebP versions. Catch v4 shifts the bus rightward inside its tile following the owner’s positioning correction. Full prompts and revision provenance are recorded in `review/mockups/prompts.json`; source and selected paths/dimensions are in `assets.json`.

The homepage keeps the previous nine cards and adds two native story-linked mockup cards, bringing the gallery and navigator to eleven items. Both case studies include the corresponding mockup beneath their icon studies. Soja’s final screen section now contains only the three original grey-background compositions, in equal columns on desktop and a single column on phones. A short personal paragraph and spacing separate the screens from the icon study. The orange onboarding exploration is no longer in the screen section.

Build and image quality checks, navigator loop/marker fixtures, actual new-card navigation, mockup enlargement, saved theme controls, and phone overflow checks passed. Browser proof is saved in `review/mockups/homepage-catch-v4.jpg` and `review/soja/screens-icons-v7-dark.jpg`. This is a local preview, not a published deployment.

### 19 October: homepage previews and final screen spacing

- Removed the duplicated Soja recovery screen from the lower gallery. The original 1920 × 1440 opening artwork still renders at 680 × 510 on desktop; Welcome and Daily overview form the lower pair.
- Kept the two generated phone icon mockups exclusively on the homepage, preserving the selected Catch v4 and Soja artwork.
- Arranged Catch's seven original icon variants in a black-backed 4 + 3 board, on both the Catch page and homepage. Rebuild its deterministic layout with `node review/mockups/build-icon-board.mjs`.
- Homepage image clicks now open the existing preview first. Soja and Catch previews include an “Explore case study” link in the same tab; standalone external projects retain their external preview destination. Escape closes the preview and restores focus.
- Local checks: all ten project previews, mouse/keyboard activation, both case-study CTA destinations, original Soja hero sizing, desktop/light/dark and 390px page layouts. Screenshots and interaction records are under `review/mockups/*v8*` and `review/soja/final-pair-v8-dark.jpg`. These changes are local and unpublished.

### 19 October: compact icon presentation

- Removed the Catch icon collection board from the homepage; it remains on the Catch case study, reduced from 1040px to a 760px maximum width.
- Kept the Catch and Soja phone mockups on the homepage in matching 4:3 black presentation frames. The original portrait artwork uses `object-fit: contain`, preserving the full composition without stretching or clipping. Their cards now follow the same height as adjacent landscape app screens.
- Confirmed both preview dialogs and case-study CTAs remain intact, light/dark appearance, eleven gallery cards, and no desktop horizontal overflow. `npm test` passes. Proofs: `review/mockups/homepage-sized-v9-light.jpg`, `homepage-sized-v9-dark.jpg`, and `catch-icon-board-v9-light.jpg`. Local only; unpublished.

### 19 October: grey icon board and mockups inside the stories

- Catch's icon board now uses the same #e2e2e2 grey as the screen presentation backgrounds. The SVG layout source and lossless PNG/WebP exports are versioned as `catch-icon-collection-grey` and retain the seven original icon artworks.
- Removed the two phone icon mockups from the homepage. Each now sits below the icon section in its own case study, at a 320px maximum width with normal image enlargement.
- Added “Trying a few icons” and a short paragraph between Catch's map and icon board, with 64px spacing above the text on desktop and 48px on mobile.
- Rewrote both case-study narratives in a more direct first-person voice using the user's interview details and concrete examples. Preserved the Soja screen gallery and opening hero.
- Local verification: nine homepage gallery cards; seven case-study image previews; both moved mockups and the grey icon board enlarge correctly; 390px pages have no horizontal overflow; light and dark styles retained. `npm test` passes. Proofs are under `review/mockups/*v10*`. Unpublished.

### 19 October: landscape icon mockups and project glass previews

- Expanded both original phone mockups into 1448 × 1086 landscape compositions with the built-in imagegen tool. The homepage uses `media/catch-icon-landscape` and `media/soja-icon-landscape` (PNG plus pixel-identical lossless WebP). The case studies retain the original portrait mockups. Full prompts, source paths, and selected outputs are saved in `review/mockups/landscape-prompts-v11.json`.
- Replaced the small “project notes” links with “Explore my projects”: two clear links with app icons, names, descriptions, and arrows. Native links still work without JavaScript and on touch devices.
- Added a shared glass highlight that springs between the two links, a subtle pointer-following sheen, and a crossfading project preview over the gallery. The carousel fades and pauses while the preview is open. Keyboard focus gets the same preview; Escape dismisses it. Reduced motion removes transitions and spring motion. No animation loop remains running once the highlight settles.
- Studied sixteen frames from the user's six-second hover reference. Kept the editorial homepage layout, shared typography, and both themes. Refined the homepage and case-study wording to explain design ownership, AI-assisted implementation, and concrete lessons without adding achievements or metrics.
- Local checks: pointer hover and spring movement, Catch/Soja preview switching, pointer-leave cleanup, keyboard focus and Escape, case-study navigation, both landscape image popups, reduced-motion emulation, 390 × 844 and 320 × 568 phones, 768px tablet carousel sizing, both themes, and empty warning/error logs. At 768px the mockups render at 710 × 532.5 with their full 4:3 composition. `npm test` and `git diff --check` pass. Unpublished.

### 19 October: remove all phone home-screen icon mockups

- Removed both phone home-screen icon mockups from the homepage and both case studies, including the newly expanded landscape versions. Their PNG/WebP files are outside the publishable `dist` directory, under `review/mockups/retired`, so they are no longer part of the site.
- Retained the actual app screens, Catch's grey icon collection, Soja's icon variations, the professional copy edits, and the new glass project links and hover previews.
- Final local state: nine gallery cards, seven case-study image previews, zero phone icon mockup images in homepage/case-study markup. Both project routes and glass previews verified after removal. `npm test` and `git diff --check` pass. Unpublished.

### 19 October: gradient focus and original progress indicator

- Removed the “Explore my projects” heading and subtitle. Kept the two project tabs, app icons, descriptions, and direct case-study links.
- Added a soft gradient-masked backdrop blur across the homepage while a project is hovered. The two tabs and the active project preview stay clear. Strengthened the glass edges and shadows in light mode.
- Added a matching glass rim, pointer sheen, and gradient focus to all nine carousel images. Existing image popups, case-study buttons, and keyboard activation remain intact. Hover cleanup and Escape restore the page; touch devices keep normal navigation.
- Restored the original portfolio's decorative progress bars from Git HEAD. Removed the Codex-style navigator, its hover magnification, and all title/description popups beside it. Progress still tracks actual cards across the loop.
- Reserved each gallery image's intrinsic aspect ratio before loading to prevent the layout changing as media arrives. Reduced motion disables the added transitions and tilt.
- Local checks: real mouse hover across all nine media items, both project previews, pointer-leave cleanup, keyboard image-popup activation, reduced motion, 390px mobile layout without overflow, both themes, empty warning/error logs, `npm test`, and `git diff --check`. Proofs: `review/mockups/project-focus-v13-light.jpg`, `project-focus-v13-dark.jpg`, `media-focus-v13-light.jpg`, and `media-hover-checks-v13.json`. Unpublished.

### 19 October: typography and project-only hover (v14)
- Removed the “got something in mind? work with me” homepage prompt.
- Removed the media carousel's added glass rims, pointer sheen, tilt and focus blur. Its original small hover lift and image preview dialog remain.
- Kept the glass highlight, preview and background blur on the Catch and Soja project tabs only.
- Matched the system sans-serif font stack declared by https://nelson.co/ across homepage, dialogs, controls, case studies and captions. Removed the handwritten caption font and caption rotations. Embedded text in original artwork remains part of the images.
- Local validation: `npm test`, `git diff --check`, rendered homepage in light/dark, project hover, normal media hover, preview dialog, case study font consistency, and 390px mobile overflow checks. Screenshots in `review/mockups/home-v14-light.jpg`, `home-v14-dark.jpg` and `project-focus-v14-light.jpg`. Not published.

### 19 October: restore contact and isolate tab focus (v15)
- Corrected the previous interpretation: restored “got something in mind? work with me” and the previous Space Grotesk / handwritten annotation typography.
- Removed the extra project preview popover and its carousel pause. Hovering Catch or Soja does not replace or stop the side media.
- Replaced the oversized elliptical clear area with a softly edged mask fitted to the two tabs. The contact prompt and entire surrounding screen blur during tab hover; both project tabs remain clear. Leaving restores the page.
- Verified Catch and Soja hover, light/dark appearance, continuing carousel movement, restored contact after hover, 390px mobile overflow, `npm test` and `git diff --check`. Proof: `review/mockups/project-focus-v15-dark.jpg`, `project-focus-v15-light.jpg`, and `home-v15-restored.jpg`. Local only.

### 19 October: reading controls, spacing and next stories (v16)
- Matched the homepage and both stories to the footer's dark background (`#080a0f`); kept the light palette. Added room around the homepage project tabs and between story sections, images, captions and the final story link.
- Replaced the plain next-story row with an app-icon card, a short description and “Read the story”. Catch and Soja link to each other.
- Fixed the story theme selector in place, added the homepage's dot-matrix clock and world-time panel, and reused its sound synthesis for theme switching, clock opening, image opening/closing and next-story hover. Audio unlock still requires a normal user interaction, matching browser policy and the homepage.
- Verified both story routes and reciprocal navigation, persistent controls at the article end, both colour modes, matching computed homepage/footer backgrounds, clock/world times, active audio context and scheduled sound effects, image lightbox, desktop layout and 390px mobile overflow. `npm test`, JS syntax and `git diff --check` passed. Browser audio scheduling was verified; speaker output was not measured.
- Proof: `review/mockups/soja-next-story-v16-dark.jpg`, `soja-next-story-v16-mobile-light.jpg`, `catch-next-story-v16-mobile-dark.jpg`, `home-spacing-v16-dark.jpg`. Local only; not deployed.

### 19 October: original charcoal and next-story glass (v17)
- Restored the original dark charcoal (`#181815`) on the homepage and both case studies. The homepage footer now uses that same paper colour instead of a separate near-black.
- Gave both next-story cards the homepage project tabs' translucent rim, inset highlights, pointer-following light and spring response (stiffness 420, damping 32). Keyboard focus gets the glass treatment; reduced motion removes movement. Existing card content, links, article controls, clock and sound effects remain.
- Local verification: matching computed home/footer backgrounds, rendered glass in light/dark, pointer movement and exit, story navigation, 390px overflow check, `npm test`, JS syntax and `git diff --check` passed. Proof: `review/mockups/next-story-glass-v17-dark.jpg` and `next-story-glass-v17-light.jpg`. Not deployed.

### 19 October: selected typography — Geist Sans (v18)
- The user chose Option B in the anonymous font comparison: Geist Sans. Applied the selected variable font to the homepage, project UI and both case-study reading surfaces, keeping the existing weights, layout and handwritten annotations.
- Self-hosted the exact Geist variable font used in the comparison, from the official `geist` npm package 1.8.1, with its SIL Open Font License. Preloaded it on all three pages.
- Local verification: loaded Geist in the browser, checked desktop and 390px mobile wrapping, confirmed Patrick Hand annotations remain, checked both story pages, and passed `npm test` and `git diff --check`. Proof in `review/type-study/geist-home-mobile.jpg`, `geist-story-desktop.jpg` and `geist-home-desktop.jpg`. Not pushed or deployed.

### 19 October: preserve original text flow with Geist (v19)
- Kept the pre-font-change font sizes, line height, paragraph width, contact gap, project-tab gap, article spacing, link destinations and handwritten notes.
- Grouped the desktop build phrase with the Catch icon, kept the hackathon phrase together, and kept the tools/social links together. This restores their previous rows without changing font size or inserting manual line breaks; phone text continues to wrap normally.
- Browser comparison at 1280px: intro, contact and project-tab vertical positions match the previous font layout within one pixel. Tools return to their prior row; individual glyph widths naturally differ. Checked a wider desktop viewport and 390px mobile with no overflow. Proof: `review/type-study/geist-original-spacing-desktop.jpg`. Local only.

### 19 October: undo the typography experiment (v20)
- Restored Space Grotesk on the homepage and both stories, including the original font weight range and the prior footer control font. Removed all experimental wrapping groups and their CSS, and removed the unused deployed Geist font files. Comparison files remain in the review directory only.
- Confirmed the original 1280px homepage geometry matches exactly again: intro `(53.7578,142.4531)`, contact row `(53.7578,426.1953)`, project tabs `(53.7578,505.5469)`, tools `(58.3594,337)`, social icons `(306.6797,337.7656)`.
- Fixed the clipped Codex/Wispr hover panels by shifting only panels that would exceed the viewport, preserving their existing hover motion and appearance. Codex's visible left edge now stays 20px inside the viewport.
- Verified the original font in the browser and stories, handwritten notes, phone content visibility and no horizontal overflow. `npm test` and `git diff --check` passed. Proof: `review/type-study/restored-original-home.jpg`, `restored-original-codex-panel.jpg`. Local only, not pushed.

### 19 October: orange marker and responsive project hover (v21)
- Removed Maritime Fusion's underline and yellow fill. An orange, translucent stroke with uneven rounded edges, layered colour and a slight angle now paints behind the same link box. Its position and dimensions remain unchanged, and keyboard focus remains visible.
- Project-tab pointer updates now coalesce into one animation frame, reuse cached bounds and animate only a transform. An exact critically damped spring follows rapid tab changes without numerical bounce. Static glass dimensions update only on geometry changes. The background blur reuses its mask while switching tabs rather than rebuilding it, with a 200ms fade and a 140ms glass fade.
- Verified light/dark marker appearance and no underline on hover; unchanged text geometry; rapid Catch/Soja switching, clean hover exit, keyboard focus/Escape, reduced motion, no added media preview, and 390px mobile fit. `npm test`, JS syntax checks and `git diff --check` passed. No frame-rate benchmark or publication was performed.
- Proof: `review/mockups/orange-highlight-v21-light.jpg`, `orange-highlight-v21-dark.jpg` and `project-hover-v21-light.jpg`. Local only.

### 19 October: marker lift imprint and softer glass entry (v22)
- Refined the orange marker to include denser ink at the pressed start and a narrow, curved lift-off imprint at the end, rather than a uniform rounded fill. The link box and original text layout are unchanged, and the underline remains removed.
- Moved “while” into the muted, regular-weight phrase.
- Made the project-tab glass appear over 280ms and the surrounding focus blur over 380ms with a gentler easing curve. The transparent focus layer paints before fading in, and rapid Catch/Soja switches reuse the active layer rather than restarting it.
- Reworked popup actions with the matching app icon, a glass rim and pointer-following highlight, spring motion, an arrow and a matching close control. The artwork sets the popup width, descriptions wrap inside it, and the mobile footer keeps both controls visible. Native case-study links and popup accessibility remain.
- Local verification: marker/no underline and regular-weight phrase; fade start/settled states; Catch/Soja switching; Soja CTA navigation; both app icons; light/dark popup hover; desktop and 390px popup bounds; original spacing; `npm test`, JS syntax and `git diff --check`. Proof: `review/mockups/marker-imprint-v22-light.jpg`, `modal-glass-v22-light.jpg`, `modal-glass-v22-dark.jpg`, `modal-glass-v22-mobile.jpg`. Not pushed or deployed.

## Approved release — 19 October 2026

The final approved version restores Space Grotesk and the original layout, adds the Catch and Soja case studies, and includes the refined project hover, marker highlight and preview controls. Earlier sections above describe the local iteration history; discarded font and phone mockup experiments are not part of the release. The approved stories now have canonical and social metadata and sitemap entries. Local review screenshots and retired assets are excluded from Git and Vercel uploads. Production is the existing Vercel project `adiarya`, connected to `AdiArya05/portfolio` on `main`.

## Phone story refinements — 19 October 2026

Both stories remain accessible through the two homepage project links on phones. Catch's before/after screens now stack at phone widths so each stays 190px wide rather than shrinking side by side. Soja's three icons use equal columns, with smaller labels on narrow phones. The mobile next-story card gives its description and link the full card width. Anchor spacing clears the fixed appearance and clock controls, and image-viewer close controls retain a 44px target with safe-area spacing.

Browser checks covered both stories at 320×568, 375×667, 390×844, 430×932 and 844×390, with 16px reading text, no horizontal overflow or out-of-bounds article content, and no broken loaded images. Mobile image open/close, focus return and scroll unlocking were checked. These are browser viewport checks, not physical iPhone Safari certification.
