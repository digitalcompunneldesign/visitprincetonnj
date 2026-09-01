# Hiking Trails

Two pages:

- `index.html` — the homepage
- `plan-your-trail.html` — the scroll-driven Greenbrier River Trail map

They are cross-linked through the header and footer nav.

Open `index.html` in a browser. No build step, no server required — though a
local server (`python3 -m http.server`) is recommended if you later wire up the
Instagram endpoint, since `fetch` is blocked on `file://`.

```
index.html
plan-your-trail.html
assets/
  js/     site.js            (shared header, nav, search, footer mountains)
  vendor/ maplibre-gl.js/css (v4.7.1, vendored — no CDN needed)
  video/  first-video.mp4  second-video.mp4  third-video.mp4
  img/    hero-*.jpg  (poster frames pulled from the clips)
          taughannock-falls.jpg  wells-falls-mill.jpg
          watkins-glen-gorge.jpg  cayuga-shoreline.jpg  ithaca-falls.jpg
          ridge-bikers.jpg
```

## Everything swappable lives in one place

The `DATA LAYER` block at the top of the `<script>` holds every asset path and
every string on the page. Nothing else in the file references a file directly.

| Constant | Controls |
|---|---|
| `HERO_SLIDES` | The three hero clips, their posters and alt text |
| `HERO_INTERVAL` | Seconds each clip holds before the crossfade |
| `TRAIL_IMAGES` | The 3D gallery — captions and crop hints |
| `EVENTS` | The six event cards |
| `ACCESSORIES` | Product circles (see below) |
| `IG_CONFIG` / `loadCommunityPhotos()` | The community wall |
| `TIPS` | The two-column tips list |

## Videos

Re-encoded for the web: H.264, no audio track (they're muted), `faststart` so
playback begins before the file finishes downloading. Originals were 11–12 MB
each; these are 4–5 MB.

Each slide falls back to its poster frame if the browser blocks autoplay or
can't decode the file, so the hero is never blank.

## Instagram

Source account: https://www.instagram.com/nature_tales_and_trails/

Instagram doesn't allow a browser to read a profile directly, so a live wall
needs a server hop. Stand up a route that holds your long-lived token and calls:

```
GET /{ig-user-id}/media
    ?fields=id,media_url,permalink,caption,like_count,comments_count
```

Then set `IG_CONFIG.endpoint` to that route. `loadCommunityPhotos()` already
maps the Graph API response shape and falls back to the local photographs if the
endpoint is missing or errors. **Never put the token in this file.**

## Still to supply

`ACCESSORIES` uses line illustrations, because there were no product flat-lays
in the asset drop. To use real photos, change:

```js
{ title: "Men's", art: 'packBoots' }
// to
{ title: "Men's", img: P('gear-mens.png') }
```

Transparent PNGs on white work best inside the circles.

## Accessibility

Keyboard: tab to the gallery or the events strip and use ← / →. The hero has a
pause control. `prefers-reduced-motion` disables the Ken Burns push, the
mountain drift, the 3D easing and all scroll reveals, and starts the hero paused.


---

# Plan Your Trail — the map page

## What is real and what is not

**Real:** the basemap is live satellite imagery (Esri World Imagery), and the
trail line is fetched at page load from OpenStreetMap via the Overpass API —
the actual mapped geometry of the Greenbrier River Trail, not a drawing.
Mileage on each card is measured along whichever line loaded.

**Approximate:** the eight stop coordinates are anchors compiled from public
knowledge, each snapped to the nearest point on the loaded route at runtime.
Stop 5 (Seebert / Watoga) uses the exact coordinate from the Google Maps URL
you supplied.

**Placeholder:** every card photograph. They are the Ithaca images from the
homepage and are labelled as such on the card. Remove the tag by setting
`imagePlaceholder: false` once real photos are in.

**Unverified:** stop descriptions and parking notes. Check them against WV
State Parks before this goes near production.

## Route source order

1. `TRAIL_CONFIG.geojsonUrl` — an official GeoJSON, if you have one. Wins.
2. Overpass API — live OpenStreetMap ways, stitched end to end.
3. `FALLBACK_ROUTE` — a coarse corridor used only when both fail. When this is
   in play the note in the bottom-left of the map says so explicitly, and the
   measured total drops to about 50 miles instead of the real 78.

## Keys

`MAP_CONFIG` at the top of the page script holds every key slot:
`googleMapsApiKey`, `googlePlacesApiKey`, `maptilerKey`. All empty. Nothing is
hard-coded anywhere else.

**Google Maps is not implemented.** Its JS API has a different camera and
layer model, so `provider: 'google'` would need a `GoogleEngine` class written
against the same five methods as `MapLibreEngine` (`ready`, `addRoute`,
`setRouteProgress`, `addMarker`, `flyTo`, `fit`). The interface is deliberately
small for that reason. MapTiler only needs a key.

`getPlaceDetails()` is a stub that calls `/api/places/:id` on your own server —
a Places key must never sit in front-end code.

## Type and colour, measured off the references

Both PNGs are 1512px wide, so everything below is at that width. Values were
read from the pixels (cap heights, ink colour medians), not eyeballed.

| | Measured | Applied |
|---|---|---|
| Body / UI face | geometric grotesque, double-storey a | Outfit |
| Display face | bold squarish grotesque | Archivo |
| Section heading | 29px cap → 40px, leading 1.1 | 40px / 1.1 |
| Section subtitle | 21px | clamp to 21px |
| Hero headline | ~56px, colour `#fbebcd` | 56px cream |
| Nav | 12px cap → 16px | 15px |
| Category card title | 19px | 19px |
| Event day / month | 31px / 13px | same |
| Plan heading | 36px cap → 50px | 50px |
| Plan intro | 23px, leading 1.4 | same |
| Plan card title | 29px | 29px |
| Ink | `#564751` (warm plum, not grey) | `--c-ink` |
| Link blue | `#1058f2` | `--c-blue` |
| Accent yellow | `#fff200` | `--c-gold` |
| Green section | `#e9ffed` | `--c-green-bg` |
| Accessories section | `#f1fcff` | `--c-blue-bg` |
| Footer beige | `#fff4df` | `--c-beige` |
| Plan card body | `#111c14` | `--c-card` |
| Plan card link | `#7095e5` | `--c-link-dark` |
| Container | content 1205px wide | `--container: 1253px` |
| Radii | cards 10px, panels 16px, stop card 18px | `--r-md` / `--r-lg` |

My earlier build ran roughly 35% small on type and used neutral greys where the
design uses a warm plum. Both are fixed.

## One footer, one script

`index.html` and `plan-your-trail.html` now render the same footer from the
same code. The homepage used to carry its own inline copy of the mountain and
header logic, which is why it kept drawing the old hand-drawn ridge after the
traced one landed. Both pages load `assets/js/site.js` and share identical
footer markup — only the link targets differ (the homepage points at its own
anchors, the plan page points back at `index.html#...`).

Change the footer in one place and both pages follow.

## Footer hills

The silhouette is no longer hand-drawn. `assets/js/site.js` holds a path traced
column by column from the reference footer (the white→beige transition across
all 1512px, 140px band), then mirrored so the 3022px tile repeats seamlessly.
One layer, filled in the footer beige, exactly as the reference has it.

## Destination decks

Where a spot has more than one destination it becomes a single deck rather than
a vertical run of cards. Cards sit in one grid cell, offset down and right by
depth, so the ones behind peek out at the corner.

The right button sends the front card to the back and brings the next one
forward; the left button reverses it. It is an order rotation
(`order.push(order.shift())`), so it survives any number of clicks in either
direction and never runs out. Arrow keys work when the deck has focus, buried
cards get `aria-hidden` and are pulled out of the tab order, and the counter is
an `aria-live` region.

Currently multi-destination: Cass (+ Cass Scenic Railroad), Sharp's Tunnel
(+ river crossing), Seebert (+ Watoga State Park, + Calvin Price State Forest).
Add a `pois` array to any stop to give it a deck.

## Layout grid

Everything on this page sits on the same 12-column container grid as the
header, the footer and the homepage — nothing floats at an arbitrary
percentage. `.plan-grid` is the container plus `repeat(12, 1fr)`:

- intro block — columns 1–6
- stop cards — columns 6 to the end (about 640px at 1512px, flush with the
  container's right edge)
- progress rail and the route-source note — pinned to the container's left edge

Below 860px the grid collapses to a single column and cards go full width.

## Header

This page uses the light header variant (`<body class="page-light">`): white
bar, dark links, filled dark button, matching the reference. The homepage keeps
its transparent-over-video header. Both are the same markup and the same
`site.js` — only the body class differs.

## Scroll behaviour

The olive wash is a MapLibre background layer sitting above the imagery but
below the trail line and markers, so the route stays white and the pins stay
yellow while the satellite view underneath goes gold.

The map is `position: sticky` and the chapters scroll over it. An
IntersectionObserver watches a narrow band across the middle of the viewport;
when two chapters share that band, the one whose centre is nearest the middle
of the screen wins. That makes reverse scrolling work for free — no timeline to
rewind.

The wheel never zooms the map, and on screens under 860px map dragging is
disabled entirely so the page keeps its scroll. Zoom buttons are bottom-right.

## Known limitation

The Overpass request and the satellite tiles were both blocked in the sandbox
this was built in, so the live route fetch and the imagery have not been seen
working. The fallback path has been exercised heavily; the live path is written
to spec but unproven. Check the note in the bottom-left corner of the map — if
it says "live OpenStreetMap geometry", the real path worked.

---

# Master components

`assets/js/components.js` owns the header, the footer and the booking modal.
A page needs only:

```html
<body data-page="about">
  <div data-component="header"></div>
  ...
  <div data-component="footer"></div>
  <script src="assets/js/components.js"></script>
```

`data-page` sets the active nav item. `class="page-light"` switches the header
to the white bar (used by every page except the homepage). The nav list, footer
columns, social links and brand name are single arrays at the top of the file —
edit once, all five pages follow.

Shared CSS lives in `assets/css/base.css` (tokens, global, header, footer,
ridge, reveal, responsive, reduced motion). Each page keeps only its own
section CSS inline.

Scroll reveal also lives in components.js. It runs on load and again 400ms
later, so cards built by a page script still animate in.

**Trade-off:** because the chrome is injected by JavaScript, it is not in the
served HTML. Fine for a prototype; if this needs SEO or a no-JS fallback,
render the same templates server-side or at build time.

# Pages

| File | Notes |
|---|---|
| `index.html` | Homepage |
| `about.html` | Story, values, numbers |
| `events.html` | Filterable season listing |
| `contact.html` | Enquiry form + details |
| `plan-your-trail.html` | Scroll-driven Greenbrier River Trail map |
| `products.html` | Gear categories and a sample catalogue grid |
| `news.html` | Trail notices and condition reports |
| `terms.html` | Terms of service |
| `privacy.html` | Privacy policy |
| `do-not-sell.html` | Opt-out page |

Every footer link now resolves to a real page. The Blogs entry is gone; Trail
Tips points at the homepage tips section. `build_pages.py` regenerates the five
pages above from one shell, so the chrome cannot drift.

**The legal pages read as finished copy and no longer carry an on-page
disclaimer, because you asked for no template wording anywhere.** That removes
the warning from the visitor's view, not the underlying fact: nobody with a law
qualification has read them. They describe a defensible position for a site
like this — no data sale, no ad network, search running in the browser — but
have them reviewed before this goes public, and make sure what they claim
matches what your hosting and analytics actually do.

About, Events and Contact have no reference comps — they are built from the
existing design system (same tokens, section rhythm, card treatment) rather
than from a supplied screenshot.

# Category icons

The nine icons are vector-traced from the reference PNG with potrace, not
redrawn by hand, so the shapes are the design's own. They live in
`assets/icons/*.svg`. Card border is `#b4b4b4` at 1px, measured.

# Booking modal

Opens from any Book Your Trail button. Client-side validation only — the submit
handler shows a confirmation and does not post anywhere. Wire it to your
endpoint in the `submit` handler in components.js.

# Type scale, second pass

Event cards were measured off the reference like the rest: month 15px, day
40px, title 20px, location 15px. Tips 19px, footer nav 18px.

Everything is set in **Epilogue**.


---

# Search

The header search is functional on every page. There is no server, so it runs
entirely in the browser against `assets/js/search-index.js`.

## The index is generated, not hand-written

`build_search_index.py` (repo root) reads the site's own content — the
`CATEGORIES`, `TRAIL_IMAGES`, `EVENTS`, `ACCESSORIES`, `TIPS` and `trailStops`
arrays, plus every `h2`/`h3` on all five pages — and writes the index. 68
records covering trail types, gallery places, events, trail stops and their
extra destinations, shop categories, tips, page sections and the pages
themselves.

Re-run it after changing content:

```
python3 build_search_index.py
```

Do not hand-edit `search-index.js`; it is overwritten.

## Matching

Every term in the query must appear somewhere in a record. Scoring is
weighted: exact title 120, title prefix 80, word-boundary in title 60,
substring 40, category name 45, word-boundary in body 22, substring 12. Top
eight results, sorted.

Month abbreviations are expanded at build time, so "August" finds an event
stored as "Aug 09".

## Deep links into the map

Plan-page records carry a hash: `#stop-5` opens that stop, `#stop-5-2` also
brings the second destination at that stop to the front of its deck and rings
it briefly. Clicking "Calvin Price State Forest" in search lands on the map at
stop 5 with that exact card showing.

The address bar tracks the stop you are on (`history.replaceState`), so any
view can be copied or bookmarked. `hashchange` is handled too, so editing the
URL by hand works.

## Interaction

- `/` from anywhere opens search; Escape closes it
- Arrow keys move through results, Enter opens the highlighted one
- Matched terms are highlighted; each result shows its category and page
- Results carry `role="listbox"` / `role="option"` with `aria-selected`, and
  the input tracks `aria-activedescendant`

## Bug found and fixed while building this

Moving the responsive rules into `base.css` had broken the homepage's mobile
layout. `base.css` is linked before each page's inline `<style>`, so its media
queries lost the cascade to un-queried page rules of equal specificity — the
3D gallery stayed at its 404px desktop width on a phone, which pushed the
layout viewport out to 643px and made the header controls unreachable. The
media queries are now re-stated at the end of the homepage's inline style so
they come last. All five pages report a 390px layout viewport again.


# Plan page: stop numbers and card decks

The numbered map markers are 40px and clickable — click one to jump to that
stop. The rail numbers down the left do the same. Both update the hash.

Decks stack straight down and centred: the front card is full size, each card
behind it sits 24px lower and 5.5% narrower on each side, so the stack peeks
out along the bottom edge.

One thing worth noting if you touch this: the drop uses `scaleX`, not `scale`.
A uniform scale shrinks the height as well, which cancels most of the vertical
offset — with 690px-tall cards, a 34px drop at 0.955 scale left a 4px peek.
`scaleX` keeps the drop exact.

## Bug found while wiring this

The markers had click handlers from the start but had never been clickable:
`.journey-steps`, the scrolling layer that sits over the map at z-index 4, had
no `pointer-events: none`, so it swallowed every click aimed at the map. The
individual `.step` elements had it; their container did not. Fixed — markers,
rail, card links and deck buttons all now respond.


# Footer credit

The footer carries "Powered by Compunnel Digital" with the supplied logo,
linked to compunnel.com. It lives in the footer template in
`assets/js/components.js`, so it renders on all ten pages from one definition.

# Plan page: two fixes

**The card stack no longer clips.** It was centred inside a 118vh chapter,
which cannot reliably centre a ~700px stack — the top slid up behind the
header. The stack is now `position: sticky` at `header + 22px`, so it pins in
the visible band. Verified fully on screen at 1512×950, 1440×800, 1366×768 and
1280×720; shorter viewports also get a more compact card via `max-height`
media queries.

Worth knowing if you edit this: the sticky only works because `height: 100%`
came off `.plan-grid`. A percentage height against a `min-height` parent is
indefinite, so the grid collapsed to content height and sticky had zero range.

**The grey fade at the end of the page is gone** and the map now runs behind
the footer. The map changed from `sticky` to `fixed`, the bottom gradient was
removed from the vignette, the ridge band is transparent, and the footer sits
at `rgba(255,244,223,.90)` with a slight blur so the imagery reads through
without hurting the text contrast.


# Brand mark

`assets/img/logo-cream.png` is the supplied wordmark; `logo-dark.png` is the
same silhouette recoloured to the ink `#564751`, generated from the alpha
channel. Both sit in the header markup and CSS shows the right one: cream over
the dark hero bar on the homepage, ink on every `page-light` header and in the
footer. Swapping the artwork means replacing those two files.

# Footer credit and year

The credit reads "Designed by" followed by the Compunnel Digital logo, no
wordmark text. The copyright line uses `new Date().getFullYear()`, so it reads
2026 now and rolls over on its own.

# Tips reveal

The homepage ships seven tips; "Read all Tips" reveals six more (three further
rows across both columns) and the button becomes "Show fewer tips". It is a
real `<button>` with `aria-expanded` and `aria-controls`, and newly shown rows
are passed to `revealAll()` so they animate in rather than appearing flat.

`TIPS_VISIBLE` in index.html controls how many show before the toggle.

# Gallery card shape

The cards were rounded outward with `border-radius: 30% / 3.5%`. They now use an
SVG `clipPath` in `objectBoundingBox` units, so the top and bottom edges curve
*into* the card and the row still reads as one arc. The clip path is defined
once, inline above the stage, and referenced with `clip-path: url(#galleryArc)`.

# Events spacing

`.events-viewport` has `overflow: hidden` for the carousel, which was cropping
the card shadows. It now carries 34px of bottom padding, with the hint row
margin reduced so the section rhythm is unchanged.


# Accessibility

## What was measured

Every page was audited with **axe-core 4.x** against `wcag2a, wcag2aa, wcag21a,
wcag21aa, wcag22aa` plus best-practice rules, at 1512px and at 320px.

Baseline found 21 issues. All are fixed:

| Issue | Detail | Fix |
|---|---|---|
| `color-contrast` ×18 | `#9b8f96` on white = 3.1:1; `.stop-kind` 4.45:1; footer text on beige 3.8:1 | tokens darkened to `#6c6169` / `#5d4f57`, card label to 66% white |
| `target-size` ×1 | hero slide buttons 14px wide | 24px hit area via padding + `background-clip: content-box`; the painted bar is still 14px |
| `link-in-text-block` ×1 | link identified by colour alone | underlined |
| `heading-order` ×1 | news jumped h1 → h3 | promoted to h2 |

**Current state: 0 axe violations on all 10 pages at both widths.**

## Checked beyond axe

- **1.4.10 Reflow** — no horizontal scroll at 320px on any page
- **1.4.12 Text spacing** — no clipping with 1.5 line-height, 0.12em letter, 0.16em word spacing forced
- **2.1.1 Keyboard** — skip link first in tab order, full nav reachable, no traps
- **2.4.7 Focus visible** — 3px `--c-blue` ring, white over dark, gold on the FAB
- **2.4.11 Focus not obscured** — `scroll-margin-top` clears the fixed header
- **1.3.5 Input purpose** — `autocomplete` on name/email in both forms
- **3.3.1 Error identification** — required fields, native validation messaging
- **4.1.3 Status messages** — `role="status"` on the search count and empty state
- **2.2.2 Pause** — the hero has a pause control; motion also stops via the panel
- Dialogs move focus in and return it on close

## One documented exception

At 320px two map pins can overlap, so one falls under 24×24 (2.5.8). The
numbered rail is the **equivalent control** the criterion allows: same action,
every stop, 34×34 with clear spacing. It is labelled as such.

## The accessibility panel

Bottom-right on every page, 56×56 (52 on mobile), keyboard operable, `Escape`
closes and focus returns. Five toggles, each setting a class on `<html>` and
remembered in `localStorage`:

larger text (115% zoom) · higher contrast · underline links · reduce motion ·
more text spacing

It supplements the OS setting rather than replacing it — `prefers-reduced-motion`
is still honoured on its own.

## What this does not prove

Automated tools catch roughly a third to a half of real barriers. **This has not
been tested with a screen reader, by keyboard-only users, or by anyone with a
disability.** Reading order, alt-text quality, the plan page's scroll-driven map
narrative and the drag-based carousels all need human judgement. Treat this as a
clean automated baseline plus targeted manual fixes — not as a conformance claim.
A formal WCAG 2.2 AA statement needs a manual audit and, ideally, user testing.


# Hero clips and sound

## Encoding

The three clips were re-muxed, not re-encoded: `-c:v copy` keeps the supplied
1920×1080 H.264 streams bit for bit, so the picture is exactly what you sent.
Only the audio track was replaced.

| Clip | Ambient track | Result |
|---|---|---|
| first-video.mp4 | 1st-Waterfall.wav | 16.7 MB |
| second-video.mp4 | 2nd-river.wav | 16.5 MB |
| third-video.mp4 | 3rd-bycycle.wav | 20.8 MB |

Audio is `volume=0.20` — measured at −14 dB against the source, and 1.9 dB
below the earlier 25% pass, which is exactly the 0.25→0.20 ratio. A 0.6s
fade-in, looped or trimmed to the clip length, encoded AAC 128k. The river track is shorter than its clip so it loops once; ambient water
hides the seam.

**These are heavy: 54 MB of video.** That is the cost of "exact same visual
quality". If you want a lighter site, re-encode at CRF 23 with
`-vf scale=1600:-2`, which took the earlier set to 4–5 MB each.

## One clip plays at a time

Every slide used to carry `autoplay`, so all three clips ran continuously from
page load — inaudible while muted, but the moment sound was switched on you
heard all three at once. The `autoplay` attribute is gone; playback is driven
in JavaScript and only the active clip is ever unpaused.

On every transition the outgoing clip fades its volume to zero over 600ms
(matching the crossfade), then pauses and rewinds to zero. The incoming clip
starts from the top and fades its sound in. When the carousel loops back round,
the same cycle runs again from the beginning.

The hero also goes silent when the tab is hidden, when Pause is pressed, and
when Reduce motion is switched on in the accessibility panel.

## Accessories shop links

The three Shop now links point at your Amazon search URLs, held in the
`ACCESSORIES` array in `index.html` alongside the image path — one place to
edit. They open in a new tab with `rel="noopener noreferrer"`, and each carries
a screen-reader-only suffix naming the destination and warning that it opens in
a new tab.

Note the URLs contain Amazon session and timestamp parameters (`qid`, `ds`,
`crid`). Those are tied to the search that produced them and may expire or
redirect to a generic result page over time; if that happens, regenerate the
links and replace the three `shop:` values.

## Sound control

Videos autoplay muted, because every browser blocks audible autoplay. The
**Sound off / Sound on** button in the hero is the required user gesture. The
choice is stored in `localStorage`, but it is never applied automatically on a
later visit — that would be audible autoplay by the back door.

## Preloading and the cyclist strip

Clip 1 loads first; clip 2 starts fetching as soon as clip 1 has data, and so
on. If you ask for a clip that is not buffered, the slideshow holds and the
loader runs until `canplaythrough` fires, then advances.

The strip is 26px at the bottom of the hero: a bumpy polyline road, a gold trail
showing progress, and a 16×16 cyclist that follows the same polyline — it rises
and dips over the bumps rather than sliding along a straight line. It has
`role="status"`, so a screen reader hears "Loading background footage" and
"Background footage ready".

Poster frames pulled from the new footage cover the gap. The `poster` attribute
means the still shows only until the video can paint — if the video is ready
first, the image never appears. If a clip fails to decode entirely, the still
stays and the clip is marked ready so the loader cannot hang. There is also a
20-second cap.

## Bugs found while building this

A clip that cannot decode used to strand the carousel: the readiness gate
waited for `canplaythrough`, which never fires on a failed file, so the
slideshow sat on clip 1 for ever. The gate now fails open — an errored clip, or
one that has already fallen back to its still, counts as ready, and there is an
8-second cap on any wait.

The animation-frame loop that drives the cyclist was never cancelled: the
"ready" path removed the CSS class directly instead of going through
`showLoader(false)`, so the loop kept running for the life of the page. It now
cancels properly.


---

# Relocated to Winkler Botanical Preserve

Every page now describes **Winkler Botanical Preserve, Alexandria VA** —
38.8285697, -77.1218925 from the supplied Google Maps place. All Greenbrier /
West Virginia content is gone.

Real published facts used throughout: 44 acres; four marked loops (Green 1.25,
Red 0.4, Yellow 0.3, White 0.45 miles); total 1.4–2.0 miles depending on route;
free admission, dawn to dusk; Catherine's Lodge; pond, waterfall, streams and
bridges, native plant areas; no pets, no bicycles, pack in / pack out, stay on
marked trails.

The Plan Your Trail map opens on the supplied Google Maps framing —
`@38.8276857,-77.1228495,342m`. That centre is `MAP_CONFIG.reference`, and
`introZoom: 18.0` reproduces a 342m viewport at this latitude
(0.465 m/px × 800px ≈ 372m). The page no longer fits the path bounds on load,
which was overriding the framing; returning to the overview flies back to the
same view. The place pin itself (38.8285697, -77.1218925) is kept separately as
`MAP_CONFIG.place`.

Both maps pull the **real footpaths inside the preserve** live from
OpenStreetMap (`highway=path|footway|track` within a tight bbox) over Esri
satellite imagery. **Stop pin coordinates are approximate** — placed inside the
preserve from the supplied map layout, snapped to the nearest mapped path at
runtime. They are not surveyed positions and the interface says so.

## Page set

Added `tips.html` (18 tips in three groups). Removed `news.html`,
`products.html` and `do-not-sell.html`, along with every link to them.

## Contact details

No address, phone number or email address appears anywhere. The contact page
lost its mailto and tel entries; the form is the only channel.

## Forms

Both the contact form and the booking modal POST to FormSubmit, which forwards
to **sanjay.pal@compunnel.com**. Two things to know:

1. **FormSubmit sends a one-time activation email to that address on the first
   submission.** Until someone clicks the link in it, nothing is forwarded.
2. It needs a real origin. Opened straight from the file system the POST will
   be blocked; the form then offers a pre-filled `mailto:` so the visitor does
   not lose what they typed. Host it and the normal path works.

Change `FORMS.endpoint` in `components.js` to move to your own handler.

## Homepage additions

- **Where the trails run** — a compact live map with the four loops legended by
  colour and distance, numbered pins that deep-link into the stop-by-stop page.
- **What you will find** — twelve amenity cards covering what is on site and
  the three things that are not allowed.

## Dialogs

The booking modal, search panel and accessibility panel now each have a close
control with a visible "Close" label as well as the icon.

## Still worth your attention

The photography is still generic woodland stock, not Winkler. Legal pages carry
realistic wording but remain unreviewed by a lawyer.


---

# Real photography

Eight photographs of the preserve, plus eleven additional framings cropped from
them (nineteen files in total), replace the earlier stock woodland imagery
across every page: the pond, the waterfall, Catherine's Lodge, the footbridge,
the stream crossing, the log rail above the water, the bench with the city
building beyond, and a planted bed in flower.

Two notes on those images. The bench photograph shows a tower block over the
treeline — it is the honest view of where this preserve sits, so it is used for
the entrance rather than hidden. The planted-bed image appears to be
AI-generated rather than a photograph of Winkler; it is used for the native
plant areas because it is the closest fit in the set, and it should be swapped
for a real one when you have it.

Imagery that contradicted the rules is gone: no cyclists on a preserve that
bans bicycles, and the kayak icon no longer labels a pond you cannot boat on.
The category list dropped to six that all describe something you can actually
do here.

# Map framing

The Plan Your Trail background opens on the supplied view. The homepage map is
centred on the pond at zoom 17.2.

Stop coordinates were re-clustered around that centre — the earlier pond pin
was roughly 120m east of it, which showed up as soon as the homepage map was
zoomed in. They remain approximate anchors snapped to the nearest mapped path,
and the interface still says so.

# Footer credit

Reads "Website Designed by" followed by the Compunnel mark, linking to
https://digital.compunnel.com in a new tab.


# No image used twice in the same view

With eight source photographs and nineteen picture slots on the homepage alone,
straight reuse looked repetitive. Eleven extra framings were cropped from the
originals — the upper fall and the lower fall, the lodge porch and its steps,
the plank deck of a bridge, stepping stones in the stream bed, the two halves
of the pond, the bench close up, the flower bed and the path beside it.

The homepage now uses **nineteen distinct files across nineteen slots**: five in
the gallery, six in events, eight in the community feed. Nothing repeats. The
3D gallery still renders each of its five twice — that is the carousel ring
needing neighbours on both sides, not duplicated content.

Two crops of the same subject sitting next to each other still read as a
repeat even when the files differ, so the feed is arranged one subject per
tile: pond, waterfall, lodge, bridge, stream, bench, eastern bank, garden. The
events strip keeps its two garden framings at opposite ends.

The plan page runs ten distinct files across its ten stop cards.

While reassigning these I found two stop entries carrying a duplicate `alt:`
key from an earlier edit — valid JavaScript, silently keeping the last value.
Both rewritten.


# Videos not playing on the live site

Two faults, both invisible locally. See DEPLOY.md for the server side.

**Blocked autoplay was swallowed.** Sound is on by default, so the hero tried to
start an unmuted clip. Browsers refuse that on any domain the visitor has no
media-engagement history with — which is every first visit to the live site,
while your own machine has built that history up and plays fine. The rejection
was caught and discarded (`p.catch(() => {})`), so the clip simply never
started and the hero sat on its poster frame.

There was a recovery path, but it raced: it lived on a separate `play()`
promise whose rejection could land *after* `playVideo` had already failed
silently, and it muted the videos without restarting them.

Now a single `safePlay()` handles every call site. On `NotAllowedError` with an
unmuted element it mutes, flips the control to "Tap for sound", and plays
again — muted autoplay is always permitted. `AbortError` is ignored, since that
just means a later `play()` superseded it.

**A transient network error was fatal.** The error handler replaced the video
with the still frame on *any* error. One dropped chunk of a 16 MB file over a
flaky connection and the clip was gone for the rest of the session.
`MEDIA_ERR_NETWORK` now gets one retry after 1.2s; only a decode or
unsupported-source error falls back to the still.

**How this was verified.** The real MP4s cannot be decoded in this sandbox, so
the test used generated VP9 clips served over HTTP with Chromium's autoplay
policy set to `document-user-activation-required` — the same condition as a
fresh live domain:

- autoplay allowed: clip 1 playing, audible, advancing
- autoplay blocked: clip 1 playing muted, control reads "Tap for sound", one
  click makes it audible
- stepping through all three: exactly one playing and one audible throughout
- aborting a clip's request mid-session: the carousel keeps running


# Hero sequencing

Each clip now holds for its own duration rather than a fixed 8 seconds, clamped
to 6–15s so a 23-second clip cannot stall the hero. The timer is a one-shot
re-armed by every advance, and re-armed again on `durationchange` — a
progressively delivered file reports a partial duration first and corrects it
later, which otherwise cut the first clip short.

Measured over HTTP with 7s, 9s and 11s test clips: holds of 8.9s, 10.9s and
6.9s against clip lengths of 9s, 11s and 7s. Exactly one clip playing
throughout.
