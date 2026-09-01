#!/usr/bin/env python3
"""
Generate assets/js/search-index.js from the site's own content.

There is no server and no database, so the index is built here, at authoring
time, by reading the data arrays and headings that the pages already use. Run
this again whenever content changes:

    python3 build_search_index.py
"""
import re, json, html, pathlib

SITE = pathlib.Path(__file__).parent / 'site'
records = []


def read(name):
    return (SITE / name).read_text()


def objects(src, array_name):
    """Pull `{ ... }` literals out of a named JS array."""
    i = src.index(f'const {array_name} = [')
    depth, start, out = 0, None, []
    for j in range(i, len(src)):
        c = src[j]
        if c == '{':
            if depth == 0:
                start = j
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                out.append(src[start:j + 1])
        elif c == ']' and depth == 0:
            break
    return out


def field(obj, key):
    cands = [m for m in (re.search(key + r"\s*:\s*'((?:[^'\\]|\\.)*)'", obj),
                         re.search(key + r'\s*:\s*"((?:[^"\\]|\\.)*)"', obj)) if m]
    if not cands:
        return ''
    m = min(cands, key=lambda x: x.start())
    return m.group(1).replace("\\'", "'").replace('\\"', '"')


def subobjects(obj, key):
    """Brace-matched objects inside a nested array such as `pois: [...]`."""
    m = re.search(key + r'\s*:\s*\[', obj)
    if not m:
        return []
    i, depth, start, out = m.end(), 0, None, []
    while i < len(obj):
        c = obj[i]
        if c == '{':
            if depth == 0:
                start = i
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                out.append(obj[start:i + 1])
        elif c == ']' and depth == 0:
            break
        i += 1
    return out


def arr(obj, key):
    m = re.search(key + r"\s*:\s*\[([^\]]*)\]", obj)
    return re.findall(r"'([^']+)'", m.group(1)) if m else []


MONTHS = {'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
          'Jun': 'June', 'Jul': 'July', 'Aug': 'August', 'Sept': 'September',
          'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'}


def add(title, kind, page, hash_, text='', extra=''):
    if not title:
        return
    records.append({
        'title': title,
        'kind': kind,
        'page': page,
        'hash': hash_,
        'text': ' '.join(x for x in (text, extra) if x).strip()
    })


# ---------------------------------------------------------------- homepage
home = read('index.html')

for o in objects(home, 'CATEGORIES'):
    t = field(o, 'title')
    add(t, 'Trail type', 'index.html', '#nature',
        f'{t} on the trail network. Browse paths that match how you like to spend a day outdoors.')

for o in objects(home, 'TRAIL_IMAGES'):
    add(field(o, 'caption'), 'Place', 'index.html', '#explore',
        'Photographed along the route. Part of the Explore Beautiful Trails gallery.')

for o in objects(home, 'AMENITIES'):
    add(field(o, 't'), 'Amenity', 'index.html', '#amenities', field(o, 'd'))

for o in objects(home, 'TIPS'):
    t = field(o, 'text')
    add(t, 'Rule', 'tips.html', '', 'Preserve rule or trail advice.')

tips_src = read('tips.html')
for m in re.finditer(r'<b>([^<]+)</b><em>([^<]+)</em>', tips_src):
    add(m.group(1), 'Tip', 'tips.html', '', m.group(2))

# ---------------------------------------------------------------- events
for src, page in (('events.html', 'events.html'), ('index.html', 'index.html')):
    s = read(src)
    if f'const EVENTS = [' not in s:
        continue
    for o in objects(s, 'EVENTS'):
        title = field(o, 'title')
        place = field(o, 'place') or field(o, 'loc')
        mon = field(o, 'month')
        full = MONTHS.get(mon, mon)
        when = f"{mon} {field(o, 'day')}" + (f" ({full})" if full != mon else '')
        kind = field(o, 'type') or 'Event'
        flat = o.replace(' ', '')
        free = ('free to join' if 'free:true' in flat
                else 'booking required' if 'free:false' in flat else '')
        add(title, kind if page == 'events.html' else 'Event', page,
            '#events' if page == 'index.html' else '',
            f'{when} at {place}.' + (f' {free}.' if free else ''))
    if page == 'events.html':
        break_all = False

# ---------------------------------------------------------------- trail stops
plan = read('plan-your-trail.html')
for n_stop, o in enumerate(objects(plan, 'trailStops'), start=1):
    name = field(o, 'name')
    kind = field(o, 'kind') or 'Trail stop'
    desc = field(o, 'description')
    acts = ', '.join(arr(o, 'activities'))
    park = field(o, 'parking')
    add(name, kind, 'plan-your-trail.html', f'#stop-{n_stop}',
        desc, f'Activities: {acts}. {park}')
    # nested destinations at the same spot
    for n_card, sub in enumerate(subobjects(o, 'pois'), start=1):
        add(field(sub, 'name'), field(sub, 'kind') or 'Destination',
            'plan-your-trail.html', f'#stop-{n_stop}-{n_card}',
            field(sub, 'description'),
            f'A destination at {name} on the Greenbrier River Trail.')

# ---------------------------------------------------------------- pages + headings
PAGES = {
    'index.html': ('Home', 'Hiking Trails home — Winkler Botanical Preserve: the marked loops, the map, amenities, events and tips.'),
    'about.html': ('About', 'Who we are, how we survey and publish routes, and how we work with park services and volunteer crews.'),
    'events.html': ('Events', 'The full season listing: guided hikes, river days, races and trail work days.'),
    'contact.html': ('Contact', 'Route questions, group bookings, access reports and general enquiries.'),
    'plan-your-trail.html': ('Plan Your Trail', 'Walk Winkler Botanical Preserve stop by stop on a live map: four marked loops, the pond, the waterfall and the native plant areas.'),
    'tips.html': ('Trail Tips', 'Rules and practical advice for walking the preserve: no pets, no bikes, stay on the blazes, pack out what you bring in.'),
    'terms.html': ('Terms of Service', 'Terms covering use of the site, the trail information published on it, and bookings.'),
    'privacy.html': ('Privacy Policy', 'What the site collects, which third parties see it, how long it is kept and how to have it removed.'),
}
for f, (title, blurb) in PAGES.items():
    add(title, 'Page', f, '', blurb)
    src = read(f)
    for tag in ('h2', 'h3'):
        for m in re.findall(rf'<{tag}[^>]*>(.*?)</{tag}>', src, re.S):
            txt = html.unescape(re.sub(r'<[^>]+>', '', m)).strip()
            if txt and len(txt) < 60 and not txt.startswith('$'):
                add(txt, 'Section', f, '', f'On the {title} page.')

# events appear on both the homepage and the events page — keep the events page
EVENTISH = {'Event', 'Community', 'Water', 'Guided', 'Race', 'Trail work'}
best = {}
for r in records:
    k = (r['title'].lower(), r['page'])
    if k not in best:
        best[k] = r
records = list(best.values())

seen, unique = set(), []
for r in sorted(records, key=lambda r: r['page'] != 'events.html'):
    k = r['title'].lower()
    if r['kind'] in EVENTISH and k in seen:
        continue
    if r['kind'] in EVENTISH:
        seen.add(k)
    unique.append(r)

out = (
    "/* ============================================================\n"
    "   SEARCH INDEX — generated by build_search_index.py\n"
    "   ------------------------------------------------------------\n"
    "   Built from the site's own content: category lists, gallery\n"
    "   captions, events, trail stops, tips and page headings. There\n"
    "   is no server, so search runs entirely against this array.\n"
    "   Re-run the script after changing content; do not hand-edit.\n"
    f"   {len(unique)} records.\n"
    "   ============================================================ */\n"
    "window.SEARCH_INDEX = " + json.dumps(unique, indent=1, ensure_ascii=False) + ";\n"
)
(SITE / 'assets/js/search-index.js').write_text(out)
print(f'{len(unique)} records ->  assets/js/search-index.js')
from collections import Counter
print(Counter(r['kind'] for r in unique).most_common())
