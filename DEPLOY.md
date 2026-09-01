# Hosting notes

The hero clips are large H.264 MP4s (16–21 MB). Three server-side things
matter; get them wrong and the videos fail on the live site while working
perfectly from your machine.

## 1. MIME type

`.mp4` must be served as `video/mp4`. Most hosts do this; IIS and some
enterprise file servers do not, and a wrong type makes the browser refuse the
file outright.

Apache (`.htaccess`):

    AddType video/mp4 .mp4

Nginx: check `mime.types` includes `video/mp4 mp4;`

## 2. Range requests

The server must answer `Range` requests with `206 Partial Content`. Without it
the browser downloads all 21 MB before showing a frame, and Safari will not
play at all. Verify:

    curl -sI -H "Range: bytes=0-1023" https://your-site/assets/video/first-video.mp4

You want `HTTP/1.1 206` and a `Content-Range` header back. Static hosts
(Netlify, Vercel, S3, GitHub Pages, Apache, Nginx) all do this by default.

## 3. Case-sensitive paths

Linux servers are case sensitive where macOS and Windows are not. Every asset
path in this project is lower case; keep it that way when replacing files.

## Sequencing

Each clip holds the hero for its own length (clamped to 6–15 seconds), not a
fixed slice, so the three play one after another end to end. The timing is
re-armed whenever the browser reports a corrected duration, which matters on a
progressively delivered file.

## Autoplay

Browsers block *audible* autoplay on a domain the visitor has no history with.
The hero handles this: it drops to muted playback and the control reads
"Tap for sound" until the first click, key press or tap. That is expected
behaviour on a fresh domain, not a fault — and it is why the site can look
different live than it does locally, where your browser has built up media
engagement for the origin.


## What cannot be done

No browser will autoplay **audible** media to a visitor who has never
interacted with the domain. There is no flag, attribute or workaround for this;
Chrome, Safari and Firefox all enforce it, and it is the reason a hero can be
audible on your own machine and silent for a first-time visitor.

The reference build at digitalcompunneldesign.github.io/PITT does not do
otherwise — its hero autoplays muted, and its only hero control is "Pause
background motion". There is no unmute there at all.

What this site does is the maximum available: video autoplays immediately and
in sequence, and sound switches itself on at the first click, key press or tap
anywhere on the page, with the control reading "Tap for sound" until then.
