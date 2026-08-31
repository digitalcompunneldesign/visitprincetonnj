# Visit Princeton NJ — microsite

Five-page static microsite. All content is taken from
`https://www.experienceprinceton.org/visit`.

Open **`index.html`**. Keep the folder intact — the pages reference `assets/`.

```
princeton-microsite/
├── index.html          Visit        (home)
├── explore.html        Explore      things to do + when to visit
├── getting-here.html   Getting here access to Princeton
├── stay-eat.html       Stay & eat   hotels, dining, shopping
├── attractions.html    Attractions  the full list of 27
└── assets/
    ├── styles.css      design system, 12-col grid, themes
    ├── app.js          theme engine, accessibility toolkit, speech, deck
    └── compunnel-digital.svg
```

---

## 1. Typography

Display headings (`.h-xl`, `.h-lg`) and the closing wordmark use **Yellowtail**,
a brush script chosen to match the reference lettering. Everything else — body
copy, card titles, navigation, UI — stays in **Outfit**, because script faces
lose legibility at small sizes.

Two automatic guards: the script face swaps back to Outfit whenever
**high contrast** or **largest text** is switched on in the accessibility panel.

## 2. Photography

Two sources, both licensed for this use:

**Wikimedia Commons** supplies the high-resolution material — town streets, Nassau
Hall, Cannon Green, the campus, Palmer Square's post office, the D&R Canal towpath
and a wide NARA view of Princeton. Originals run from 3,264px to 7,061px wide.
They are requested through Commons' `Special:FilePath` endpoint, which serves
sized derivatives on demand, so each `<img>` carries a three-step `srcset`
(800 / 1400 / 2000px) and a `sizes` hint — phones fetch the small file, retina
desktops the large one.

**Visit Princeton NJ's own CDN** supplies the remaining photography: the Nassau
Inn, Witherspoon Grill, the Dinky station, Morven, the library, the Battlefield,
Institute Woods and the streetscapes.

Every Wikimedia image carries an `onerror` fallback to a matched Experience
Princeton photo, so if a file is ever renamed upstream the layout degrades to a
correct image instead of a broken one.

**Attribution.** Licences range from public domain to CC BY-SA. An *Image credits*
disclosure sits in the footer of every page, listing each file, its author and its
licence, linked to the Commons file page where the full terms live — which is what
CC BY-SA attribution requires. Do not strip it.

Note: these files are hotlinked to Commons. Before deploying, download the
originals and self-host them — hotlinking is discouraged by Wikimedia and leaves
you exposed to upstream changes.

## 3. Motion / video

Every visual is a `.cine` block: layered stills that crossfade and slowly push in,
so the page reads as moving footage rather than flat photography.

**To use real video**, drop files into `assets/` with these names. Each block
already has a `<video>` element waiting; when the file loads it takes over
automatically and the stills are hidden. If the file is absent the `<video>`
removes itself and the stills keep playing — nothing breaks.

| File | Used on |
|---|---|
| `hero.mp4` / `hero.webm` | home hero |
| `explore.mp4`, `getting-here.mp4`, `stay.mp4`, `attractions.mp4` | inner page heroes |
| `arts.mp4`, `historical.mp4`, `outdoor.mp4` | home category cards |
| `dinky.mp4` | Dinky card, Getting here |
| `panel.mp4`, `eat.mp4` | Stay & eat |
| `collage-1.mp4`, `collage-2.mp4` | collage tiles |

Encode ~8–12 s, silent, ≤2 MB, H.264 MP4 plus a VP9 WebM. Ship both formats.

Images are boosted with `contrast(1.1) saturate(1.08)` (`--img-filter`), and rise
to `contrast(1.35)` in high-contrast mode. Any crop containing people carries
`.face-top` (`object-position: 50% 18%`) so heads are never cut off.

---

## 4. Theme

Header control, three states, remembered per device:

- **Light** / **Dark** — explicit override, wins forever
- **Automatic** (default) — follows the device clock: light from 06:00 until
  sunset, dark after. Sunset is approximated per month (16:30 in December,
  20:30 in July), so dusk feels right year-round. An open tab re-checks every
  minute and flips on its own.

---

## 5. Accessibility

Round accessibility button, bottom right. **Alt + A** opens it from anywhere,
**Esc** closes. Every choice persists across all five pages.

- **Listen to this page** — Web Speech API. Walks headings, paragraphs and list
  items in order, highlighting and scrolling to each as it reads. Pause / resume
  / stop. Unsupported browsers get a plain message instead of silence.
- **Black & white** — full greyscale of the entire page.
- **High contrast** — flattens tints to pure white/black, forces pure black or
  white text, thickens borders to 2px.
- **Text size** — A / A+ / A++ (100 / 112.5 / 125%), everything in `rem` so the
  whole layout reflows rather than clipping.
- **Underline links**, **more spacing** (letter, word and line), **pause motion**.
- **Reset everything** returns all settings including theme to default.

Beyond the toolkit: skip link, one `h1` per page with no heading-level jumps,
landmarks (`header`/`nav`/`main`/`footer`), breadcrumbs, `aria-current="page"`,
visible 3px focus rings, `prefers-reduced-motion` honoured, decorative images
`aria-hidden` with empty alt, live regions for status, 44px+ touch targets,
print stylesheet.

**Contrast** — every pairing measured. Body text 17.99:1 on white, 17.21:1 on
dark. Lowest value anywhere is 5.38:1 (accent), against a 4.5:1 AA requirement.

---

## 6. Nielsen's heuristics

1. **System status** — scroll progress bar, toast confirmations, active nav, live reading counter
2. **Match the real world** — "Read aloud", "Black & white", plain-language labels
3. **User control** — theme override, reset-all, back-to-top, Esc closes everything
4. **Consistency** — one component set across five pages, single stylesheet
5. **Error prevention** — no destructive actions; unsupported speech detected before use
6. **Recognition over recall** — breadcrumbs, numbered sections, icon + text labels
7. **Flexibility** — Alt+A shortcut, skip link, next-page nav, deck dots
8. **Minimal design** — one idea per band, generous whitespace
9. **Error recovery** — speech fallback message, video falls back to stills
10. **Help** — hint text in the theme menu and accessibility panel

## 7. Gestalt

Proximity (each topic in one tinted band) · similarity (identical card shape
throughout) · common region (bordered, rounded containers) · continuity (12-column
alignment across every section) · closure (rounded corners, dashed corner arcs) ·
figure/ground (colour bands separate content from page) · common fate (staggered
reveal on scroll, cards lifting together on hover).

---

## 8. Grid & responsive

Everything sits on a 12-column CSS Grid (`.grid` + `.c1`–`.c12`) — **including the
masthead**: logo spans columns 1–3, navigation 4–9, theme and menu controls 10–12.
The footer legal row is a 6 + 6 split. Desktop layout is unchanged above 1080px.

**Mobile card deck** — below 760px, any `.deck` becomes a horizontal snap-scroll
where cards behave like physical playing cards: alternating tilt, overlapping by
38px, dimmed and scaled down behind. The centred card straightens, lifts and
brightens via IntersectionObserver. Dots below give position and jump-to, and a
nudging arrow hints at the gesture. The 27-item attractions list deliberately
stays a vertical list — 27 swipes would be worse than scrolling.

---

## 9. Content note

The site reuses Visit Princeton NJ's copy and photography, which belong to
Princeton Business Partnership, Inc. Photos load from their live CDN; swap in
local files before deploying. The masthead and footer now carry the real
Visit Princeton NJ logo (orange mark on light, the white/orange horizontal
lockup on dark).

The footer reads **Website Design by** followed by the Compunnel Digital logo,
set plainly with no plate or border behind it; on dark theme it is inverted with
hue preserved so the brand blue survives.

The copyright year is written by `app.js` from `new Date().getFullYear()` at load,
so it can never go stale. The markup ships with 2026 as the no-JS fallback.
