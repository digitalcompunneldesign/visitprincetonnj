#!/usr/bin/env python3
"""Build the pages the footer links to: products, news and the three legal pages."""
import pathlib

SITE = pathlib.Path(__file__).parent / 'site'

SHELL = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title} — Hiking Trails</title>
<meta name="description" content="{desc}" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/base.css">
<style>
.lede{{font-size:clamp(17px,1.6vw,23px);line-height:1.55;color:var(--c-ink);max-width:780px}}
.prose{{max-width:820px}}
.prose h2{{font-size:clamp(21px,2vw,27px);margin:44px 0 14px;text-transform:none;letter-spacing:0}}
.prose h3{{font-size:19px;margin:28px 0 10px;font-weight:600}}
.prose p,.prose li{{font-size:clamp(15px,1.3vw,18px);line-height:1.68;color:var(--c-body)}}
.prose p + p{{margin-top:16px}}
.prose ul{{margin:14px 0 0;padding-left:22px;list-style:disc}}
.prose li{{margin-top:9px}}
.prose a{{color:var(--c-blue);text-decoration:underline}}
.notice{{
  border:1px solid #e0c98a;background:#fffaf0;border-radius:var(--r-md);
  padding:20px 24px;margin-bottom:38px;max-width:820px;
}}
.notice b{{display:block;font-size:16px;color:var(--c-ink);margin-bottom:6px}}
.notice p{{font-size:15px;line-height:1.6;color:var(--c-body)}}
.updated{{font-size:14px;color:var(--c-muted);margin-top:6px}}
{extra_css}
</style>
</head>
<body class="page-light" data-page="{page_id}">
<a class="skip" href="#main">Skip to content</a>
<div data-component="header"></div>

<main id="main">
  <section class="page-hero">
    <img src="{hero}" alt="{hero_alt}">
    <div class="container">
      <p class="crumb"><a href="index.html">Home</a> / <span>{title}</span></p>
      <h1>{h1}</h1>
      <p>{sub}</p>
    </div>
  </section>

{body}
</main>

<div data-component="footer"></div>
<script src="assets/js/search-index.js"></script>
<script src="assets/js/components.js"></script>
</body>
</html>
"""

LEGAL_NOTICE = """      <div class="notice reveal">
        <b>Template text — not legal advice</b>
        <p>This page is placeholder wording written to give the site a complete
        structure. It has not been reviewed by a lawyer and does not describe any
        real company's practices. Replace it with terms drafted for your
        jurisdiction and business before publishing.</p>
      </div>
"""

# ------------------------------------------------------------------ products
PRODUCTS_CSS = """
.cat-circles{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:8px}
.cat-circle{text-align:center}
.cat-circle .ring{
  width:min(300px,86%);aspect-ratio:1;margin:0 auto;border-radius:var(--r-full);
  background:#fff;display:grid;place-items:center;overflow:hidden;
  box-shadow:0 10px 30px rgba(30,60,80,.08);
  transition:transform 420ms var(--ease),box-shadow 420ms var(--ease);
}
.cat-circle:hover .ring{transform:scale(1.05);box-shadow:0 22px 46px rgba(30,60,80,.15)}
.cat-circle img{width:76%;height:76%;object-fit:contain}
.cat-circle h3{margin-top:22px;font-size:21px;font-weight:600;color:#4e4c51}
.cat-circle p{margin-top:6px;font-size:15px;color:var(--c-body)}
.grid-products{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:44px}
.pcard{border:1px solid #b4b4b4;border-radius:var(--r-md);overflow:hidden;background:#fff;
  transition:transform var(--t-fast) var(--ease),box-shadow var(--t-fast) var(--ease)}
.pcard:hover{transform:translateY(-4px);box-shadow:var(--shadow-sm)}
.pcard .shot{aspect-ratio:4/3;background:#f6f7f7;display:grid;place-items:center;overflow:hidden}
.pcard .shot img{width:74%;height:74%;object-fit:contain}
.pcard .body{padding:16px 18px 20px}
.pcard h3{font-size:17px;font-weight:600;color:#4e4c51;line-height:1.3}
.pcard .kind{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--c-muted)}
.pcard .price{margin-top:10px;font-family:var(--font-display);font-size:19px;font-weight:700;color:var(--c-ink)}
@media (max-width:1023px){.grid-products{grid-template-columns:repeat(2,1fr)}}
@media (max-width:767px){.cat-circles{grid-template-columns:1fr;gap:30px}}
"""

CATS = [
    ("Men's", 'gear-mens.png', 'Jackets, packs and poles sized for a longer reach.'),
    ("Women's", 'gear-womens.png', 'Shoes, hydration and layers cut for a shorter torso.'),
    ('Others', 'gear-others.png', 'Cameras, lighting, cables and everything that is not clothing.'),
]
ITEMS = [
    ('Shell jacket', 'Outerwear', '£129', 'gear-mens.png'),
    ('Hydration pack, 6L', 'Packs', '£68', 'gear-womens.png'),
    ('Trekking poles, pair', 'Hardware', '£45', 'gear-mens.png'),
    ('Trail camera mount', 'Accessories', '£32', 'gear-others.png'),
    ('Insulated bottle, 750ml', 'Hydration', '£24', 'gear-womens.png'),
    ('Head torch, rechargeable', 'Lighting', '£39', 'gear-others.png'),
    ('Merino base layer', 'Layers', '£54', 'gear-mens.png'),
    ('Dry bag set', 'Packs', '£21', 'gear-others.png'),
]

products_body = f"""  <section class="section">
    <div class="container">
      <div class="sec-head">
        <h2 class="sec-title reveal">Shop by<br>category</h2>
        <p class="sec-sub reveal" data-d="1">Everything here is gear we carry on the routes we publish. Nothing is listed that we have not had out on a trail.</p>
      </div>
      <div class="cat-circles">
        {''.join(f'''
        <a class="cat-circle reveal" data-d="{i}" href="#catalogue">
          <span class="ring"><img src="assets/img/{img}" alt="{name} trail gear" loading="lazy"></span>
          <h3>{name}</h3>
          <p>{blurb}</p>
        </a>''' for i, (name, img, blurb) in enumerate(CATS))}
      </div>
    </div>
  </section>

  <section class="section" id="catalogue" style="background:var(--c-blue-bg)">
    <div class="container">
      <div class="sec-head">
        <h2 class="sec-title reveal">The kit list</h2>
        <p class="sec-sub reveal" data-d="1">A sample of the catalogue. Prices and stock are placeholder data — wire this grid to your commerce backend.</p>
      </div>
      <div class="grid-products">
        {''.join(f'''
        <article class="pcard reveal" data-d="{i % 4}">
          <div class="shot"><img src="assets/img/{img}" alt="{nm}" loading="lazy"></div>
          <div class="body">
            <p class="kind">{kind}</p>
            <h3>{nm}</h3>
            <p class="price">{price}</p>
          </div>
        </article>''' for i, (nm, kind, price, img) in enumerate(ITEMS))}
      </div>
      <p class="updated reveal" style="margin-top:34px">Product photography and pricing are placeholders. Replace <code>ITEMS</code> in this page with your catalogue feed.</p>
    </div>
  </section>
"""

# ---------------------------------------------------------------------- news
NEWS_CSS = """
.news-list{display:flex;flex-direction:column;gap:0;max-width:900px}
.news-item{display:grid;grid-template-columns:150px 1fr;gap:32px;padding:34px 0;border-bottom:1px solid var(--c-line)}
.news-item:first-child{border-top:1px solid var(--c-line)}
.news-when b{display:block;font-family:var(--font-display);font-size:30px;font-weight:700;color:var(--c-ink);line-height:1.1}
.news-when span{display:block;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--c-muted);margin-top:4px}
.news-tag{display:inline-block;padding:4px 11px;border-radius:var(--r-full);background:var(--c-green-bg);
  font-size:11.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#3f6b48}
.news-body h3{font-size:clamp(19px,1.8vw,24px);font-weight:600;color:var(--c-ink);margin:12px 0 8px;line-height:1.3}
.news-body p{font-size:16px;line-height:1.65;color:var(--c-body)}
@media (max-width:767px){.news-item{grid-template-columns:1fr;gap:12px}}
"""

NEWS = [
    ('14', 'Aug', 'Trail notice', 'Bridge deck replaced north of Marlinton',
     'The timber deck on the crossing about two miles north of the depot has been relaid. The detour that was in place through July is lifted.'),
    ('02', 'Aug', 'Conditions', 'Low water on the Greenbrier',
     'Several of the shallower crossings are walkable at the moment. Anyone planning to paddle the middle section should check gauge levels before setting out.'),
    ('21', 'Jul', 'Guides', 'Every stop on the main route re-walked',
     'We finished a full pass of the route this month. Surface notes, parking and access details on the Plan Your Trail page have all been refreshed.'),
    ('09', 'Jul', 'Community', 'Volunteer crews cleared the spring blowdowns',
     'Two weekends of work took out the worst of the winter deadfall. Thanks to everyone who turned out with a saw.'),
    ('27', 'Jun', 'Events', 'Autumn programme opens for booking',
     'Guided walks and the foliage trail run are now taking names. Group sizes are capped so the smaller trips fill quickly.'),
    ('12', 'Jun', 'Trail notice', 'Tunnel lighting reminder',
     'Both tunnels on the route are unlit and the longer one curves enough to hide the far end. Carry a light even in the middle of the day.'),
]

news_body = f"""  <section class="section">
    <div class="container">
      <div class="news-list">
        {''.join(f'''
        <article class="news-item reveal" data-d="{i % 3}">
          <div class="news-when"><b>{d}</b><span>{m}</span></div>
          <div class="news-body">
            <span class="news-tag">{tag}</span>
            <h3>{head}</h3>
            <p>{txt}</p>
          </div>
        </article>''' for i, (d, m, tag, head, txt) in enumerate(NEWS))}
      </div>
      <p class="updated reveal" style="margin-top:34px">Sample entries. Point this list at your CMS or a JSON feed to go live.</p>
    </div>
  </section>
"""

# -------------------------------------------------------------------- legal
terms_body = LEGAL_NOTICE + """      <div class="prose">
        <p class="lede reveal">These terms cover use of this website, the route
        information published on it, and any trip you book through us.</p>
        <p class="updated reveal">Last updated: template — set a date on publication.</p>

        <h2 class="reveal">Using the route information</h2>
        <p class="reveal">Route descriptions, distances, coordinates and condition
        notes are published in good faith and checked as often as we can manage.
        They are not a substitute for a current map, a weather forecast or your own
        judgement. Conditions on a trail change with the season and the weather.</p>
        <p class="reveal">You are responsible for assessing whether a route is within
        your ability and for the equipment you take. Access arrangements, parking and
        seasonal closures are set by the relevant park authority, not by us.</p>

        <h2 class="reveal">Bookings</h2>
        <ul>
          <li class="reveal">A booking request is an enquiry, not a confirmed place. We confirm by email.</li>
          <li class="reveal">Guided trips may be cancelled for weather or trail conditions; where that happens we offer a transfer or a refund.</li>
          <li class="reveal">Cancellation windows and any deposit terms are set out in the confirmation email.</li>
        </ul>

        <h2 class="reveal">Content and copyright</h2>
        <p class="reveal">Photography, written route guides and maps on this site
        belong to their respective owners. Base map imagery and trail geometry are
        supplied by third parties and carry their own attribution, shown on the map.
        You may link to any page here freely.</p>

        <h2 class="reveal">Liability</h2>
        <p class="reveal">Nothing in these terms limits liability for death or
        personal injury caused by negligence, or for fraud. Beyond that, we are not
        liable for loss arising from reliance on published route information.</p>

        <h2 class="reveal">Getting in touch</h2>
        <p class="reveal">Questions about these terms go to the team through the
        <a href="contact.html">contact page</a>.</p>
      </div>
"""

privacy_body = LEGAL_NOTICE + """      <div class="prose">
        <p class="lede reveal">What this site collects, why, and how to get it removed.</p>
        <p class="updated reveal">Last updated: template — set a date on publication.</p>

        <h2 class="reveal">What we collect</h2>
        <ul>
          <li class="reveal"><b>Booking and enquiry forms:</b> the name, email and trip details you type in.</li>
          <li class="reveal"><b>Server logs:</b> standard request data, including IP address, kept for security and troubleshooting.</li>
          <li class="reveal"><b>Nothing hidden:</b> this prototype sets no advertising or tracking cookies. Site search runs entirely in your browser and no query is sent anywhere.</li>
        </ul>

        <h2 class="reveal">Third parties</h2>
        <p class="reveal">Map pages load satellite imagery and trail geometry from
        external map providers, which means those providers can see the request your
        browser makes. Fonts are served from Google Fonts. Any community photo feed
        is fetched through our own server so no credential reaches your browser.</p>

        <h2 class="reveal">How long we keep it</h2>
        <p class="reveal">Enquiries are kept while we deal with them and for a
        reasonable period afterwards for our records. Logs rotate on a short cycle.</p>

        <h2 class="reveal">Your rights</h2>
        <p class="reveal">You can ask for a copy of what we hold about you, ask us to
        correct it, or ask us to delete it. Write to us through the
        <a href="contact.html">contact page</a> and we will respond within the period
        your local law requires.</p>

        <h2 class="reveal">Children</h2>
        <p class="reveal">This site is not aimed at children and we do not knowingly
        collect information from them.</p>
      </div>
"""

dns_body = LEGAL_NOTICE + """      <div class="prose">
        <p class="lede reveal">Some privacy laws, including the CCPA in California,
        give you the right to opt out of the sale or sharing of your personal
        information.</p>
        <p class="updated reveal">Last updated: template — set a date on publication.</p>

        <h2 class="reveal">Our position</h2>
        <p class="reveal">We do not sell personal information, and we do not share it
        for cross-context behavioural advertising. There is no advertising network on
        this site and no data broker relationship to opt out of.</p>
        <p class="reveal">That statement is only worth as much as the systems behind
        it, so if you add analytics, remarketing pixels or an ad partner later, this
        page has to change and an opt-out mechanism has to be built.</p>

        <h2 class="reveal">Making a request anyway</h2>
        <p class="reveal">If you would like confirmation in writing, or want your
        details deleted, send a request through the
        <a href="contact.html">contact page</a> with the email address you used. We
        will confirm receipt and respond within the statutory window. You may use an
        authorised agent, and we will not treat you differently for asking.</p>

        <h2 class="reveal">What we would need</h2>
        <ul>
          <li class="reveal">The email address or booking reference you used, so we can find the record.</li>
          <li class="reveal">Enough detail to verify the request came from you.</li>
        </ul>
      </div>
"""

PAGES = [
    dict(file='products.html', page_id='products', title='Products',
         h1='Gear that has<br>been out there', hero='assets/img/hero-third.jpg',
         hero_alt='Riders climbing a grassy ridge trail',
         sub='Packs, layers and hardware for long days on the trail — grouped the way people actually shop for them.',
         desc='Trail gear: packs, layers, poles and accessories for long-distance walking and riding.',
         body=products_body, extra_css=PRODUCTS_CSS),
    dict(file='news.html', page_id='news', title='News',
         h1='From the trail', hero='assets/img/cayuga-shoreline.jpg',
         hero_alt='Autumn shoreline seen from the air',
         sub='Closures, conditions, survey updates and what the volunteer crews have been up to.',
         desc='Trail notices, condition reports and updates from the route survey team.',
         body=news_body, extra_css=NEWS_CSS),
    dict(file='terms.html', page_id='terms', title='Terms of Service',
         h1='Terms of service', hero='assets/img/watkins-glen-gorge.jpg',
         hero_alt='A gorge trail between layered rock walls',
         sub='The rules for using this site, the route information on it, and anything you book through us.',
         desc='Terms of service for the Hiking Trails website and bookings.',
         body='  <section class="section"><div class="container">' + terms_body + '</div></section>',
         extra_css=''),
    dict(file='privacy.html', page_id='privacy', title='Privacy Policy',
         h1='Privacy policy', hero='assets/img/wells-falls-mill.jpg',
         hero_alt='A waterfall below an old stone mill',
         sub='What this site collects, who else sees it, and how to have it removed.',
         desc='Privacy policy: what the Hiking Trails site collects and how it is handled.',
         body='  <section class="section"><div class="container">' + privacy_body + '</div></section>',
         extra_css=''),
    dict(file='do-not-sell.html', page_id='do-not-sell', title='Do Not Sell My Info',
         h1='Do not sell<br>my information', hero='assets/img/taughannock-falls.jpg',
         hero_alt='A tall waterfall in an autumn gorge',
         sub='Your right to opt out of the sale or sharing of personal information, and where we stand on it.',
         desc='Opt out of the sale or sharing of personal information.',
         body='  <section class="section"><div class="container">' + dns_body + '</div></section>',
         extra_css=''),
]

for p in PAGES:
    (SITE / p['file']).write_text(SHELL.format(**p))
    print('wrote', p['file'])
