/* ============================================================
   EXPERIENCE PRINCETON — behaviour layer
   Theme (auto by local time) · Accessibility toolkit ·
   Read-aloud · Mobile card deck · Reveal animations
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- tiny storage wrapper (never throws) ---------------------- */
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- toast (heuristic 1: visibility of system status) --------- */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.setAttribute("data-show", "true");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.setAttribute("data-show", "false"); }, 2600);
  }

  /* ==================================================================
     1. THEME — auto by local clock, user can override at any time
     ================================================================== */
  var THEME_KEY = "ep-theme";          // "auto" | "light" | "dark"
  var themeMode = store.get(THEME_KEY) || "auto";

  /* Daylight window: 06:00 → sunset. Sunset is approximated per month for
     a mid-latitude location so "evening" feels right year-round.        */
  function sunsetHour(month) {
    // Jan..Dec, local clock hour when it is getting dark
    return [17, 17.5, 19, 19.5, 20, 20.5, 20.5, 20, 19, 18.5, 17, 16.5][month];
  }
  function clockPrefersDark(d) {
    d = d || new Date();
    var h = d.getHours() + d.getMinutes() / 60;
    return h < 6 || h >= sunsetHour(d.getMonth());
  }
  function resolveTheme() {
    if (themeMode === "light" || themeMode === "dark") return themeMode;
    return clockPrefersDark() ? "dark" : "light";
  }
  function applyTheme(announce) {
    var t = resolveTheme();
    root.setAttribute("data-theme", t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#0d1012" : "#ffffff");

    document.querySelectorAll("[data-theme-opt]").forEach(function (b) {
      b.setAttribute("aria-checked", String(b.getAttribute("data-theme-opt") === themeMode));
    });
    var btn = document.getElementById("themeBtn");
    if (btn) {
      var label = themeMode === "auto"
        ? "Theme: automatic, currently " + t
        : "Theme: " + themeMode;
      btn.setAttribute("aria-label", label + ". Change theme");
      btn.setAttribute("title", label);
    }
    if (announce) {
      toast(themeMode === "auto"
        ? "Theme follows your clock — " + t + " right now"
        : t.charAt(0).toUpperCase() + t.slice(1) + " theme on");
    }
  }
  function setTheme(mode, announce) {
    themeMode = mode;
    store.set(THEME_KEY, mode);
    applyTheme(announce);
  }
  applyTheme(false);
  // Re-evaluate on the hour so an open tab flips at dusk
  setInterval(function () { if (themeMode === "auto") applyTheme(false); }, 60000);

  /* ==================================================================
     2. ACCESSIBILITY TOOLKIT
     ================================================================== */
  var A11Y = [
    { key: "ep-contrast", attr: "data-contrast", def: "normal" },
    { key: "ep-mono",     attr: "data-mono",     def: "off" },
    { key: "ep-text",     attr: "data-text",     def: "md" },
    { key: "ep-underline",attr: "data-underline",def: "off" },
    { key: "ep-motion",   attr: "data-motion",   def: "on" },
    { key: "ep-spacing",  attr: "data-spacing",  def: "off" }
  ];
  A11Y.forEach(function (s) { root.setAttribute(s.attr, store.get(s.key) || s.def); });

  function setPref(attr, value, message) {
    var spec = A11Y.filter(function (s) { return s.attr === attr; })[0];
    root.setAttribute(attr, value);
    if (spec) store.set(spec.key, value);
    syncPrefButtons();
    if (message) toast(message);
  }
  function syncPrefButtons() {
    document.querySelectorAll("[data-pref]").forEach(function (b) {
      var attr = b.getAttribute("data-pref");
      var val = b.getAttribute("data-val");
      b.setAttribute("aria-pressed", String(root.getAttribute(attr) === val));
    });
  }

  /* ==================================================================
     3. READ ALOUD (Web Speech API)
     ================================================================== */
  var speech = {
    supported: "speechSynthesis" in window,
    queue: [], index: -1, active: false, paused: false
  };
  function speechStatus(msg) {
    var el = document.getElementById("speakStatus");
    if (el) el.textContent = msg;
  }
  function collectReadable() {
    var main = document.getElementById("main") || document.body;
    var nodes = main.querySelectorAll("h1, h2, h3, p, li, figcaption, blockquote");
    var out = [];
    nodes.forEach(function (n) {
      if (n.closest("[aria-hidden='true'], .sr-only, .ticker, script, style")) return;
      var txt = (n.textContent || "").replace(/\s+/g, " ").trim();
      if (txt.length > 2 && out.indexOf(txt) === -1) out.push({ el: n, text: txt });
    });
    return out;
  }
  function clearHighlight() {
    document.querySelectorAll(".speaking").forEach(function (n) { n.classList.remove("speaking"); });
  }
  function speakNext() {
    if (!speech.active) return;
    speech.index += 1;
    if (speech.index >= speech.queue.length) { stopSpeech("Finished reading the page."); return; }
    var item = speech.queue[speech.index];
    clearHighlight();
    item.el.classList.add("speaking");
    try { item.el.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) {}
    var u = new SpeechSynthesisUtterance(item.text);
    u.rate = 1; u.pitch = 1; u.lang = document.documentElement.lang || "en";
    u.onend = speakNext;
    u.onerror = function () { stopSpeech("Reading stopped."); };
    window.speechSynthesis.speak(u);
    speechStatus("Reading " + (speech.index + 1) + " of " + speech.queue.length + "…");
  }
  function startSpeech() {
    if (!speech.supported) {
      speechStatus("Your browser does not support read-aloud. Try Chrome, Edge or Safari.");
      toast("Read-aloud is not available in this browser");
      return;
    }
    window.speechSynthesis.cancel();
    speech.queue = collectReadable();
    speech.index = -1; speech.active = true; speech.paused = false;
    if (!speech.queue.length) { speechStatus("Nothing to read on this page."); return; }
    speakNext();
    toggleSpeechButtons(true);
  }
  function pauseSpeech() {
    if (!speech.active) return;
    if (speech.paused) { window.speechSynthesis.resume(); speech.paused = false; speechStatus("Resumed."); }
    else { window.speechSynthesis.pause(); speech.paused = true; speechStatus("Paused."); }
    var b = document.getElementById("speakPause");
    if (b) b.querySelector(".t").textContent = speech.paused ? "Resume" : "Pause";
  }
  function stopSpeech(msg) {
    speech.active = false; speech.paused = false;
    if (speech.supported) window.speechSynthesis.cancel();
    clearHighlight();
    speechStatus(msg || "Stopped.");
    toggleSpeechButtons(false);
    var b = document.getElementById("speakPause");
    if (b) b.querySelector(".t").textContent = "Pause";
  }
  function toggleSpeechButtons(on) {
    var play = document.getElementById("speakPlay");
    if (play) play.setAttribute("aria-pressed", String(on));
  }
  window.addEventListener("beforeunload", function () { if (speech.supported) window.speechSynthesis.cancel(); });

  /* ==================================================================
     4. WIRE UP THE UI
     ================================================================== */
  document.addEventListener("DOMContentLoaded", function () {

    /* --- copyright year: always current, never stale --- */
    document.querySelectorAll("#year").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });



    /* --- hero carousel: arrows, dots, count, and the theme pills -------- */
    (function () {
      var slides = Array.prototype.slice.call(document.querySelectorAll(".heroslide"));
      if (slides.length < 2) return;
      var labels = ["history", "art", "nature"];
      var dots = document.getElementById("heroDots");
      var idxOut = document.getElementById("heroIdx");
      var live = document.getElementById("heroLive");
      var pills = Array.prototype.slice.call(document.querySelectorAll(".tags .pill"));
      var i = 0, timer = null, DWELL = 6500;

      slides.forEach(function (s, n) {
        var d = document.createElement("button");
        d.type = "button";
        d.setAttribute("role", "tab");
        d.setAttribute("aria-label", "Image " + (n + 1) + ": " + (labels[n] || ""));
        d.setAttribute("aria-current", String(n === 0));
        d.addEventListener("click", function () { go(n, true); });
        dots.appendChild(d);
      });

      function go(n, stop) {
        i = (n + slides.length) % slides.length;
        slides.forEach(function (s, k) { s.classList.toggle("on", k === i); });
        Array.prototype.forEach.call(dots.children, function (d, k) {
          d.setAttribute("aria-current", String(k === i));
        });
        pills.forEach(function (p, k) { p.setAttribute("aria-current", String(k === i)); });
        if (idxOut) idxOut.textContent = String(i + 1);
        if (live) live.textContent = "Showing image " + (i + 1) + " of " + slides.length +
                                     ": " + (labels[i] || "");
        if (stop) rest();
      }
      function next() { go(i + 1); }
      function rest() { clearInterval(timer); start(); }
      function start() {
        if (root.getAttribute("data-motion") === "off") return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        timer = setInterval(next, DWELL);
      }

      var prev = document.getElementById("heroPrev");
      var nxt = document.getElementById("heroNext");
      if (prev) prev.addEventListener("click", function () { go(i - 1, true); });
      if (nxt) nxt.addEventListener("click", function () { go(i + 1, true); });
      pills.forEach(function (p) {
        p.addEventListener("click", function () { go(parseInt(p.getAttribute("data-go"), 10), true); });
      });

      var hero = document.querySelector(".hero.clean");
      if (hero) {
        hero.addEventListener("mouseenter", function () { clearInterval(timer); });
        hero.addEventListener("mouseleave", start);
        hero.addEventListener("focusin", function () { clearInterval(timer); });
        hero.addEventListener("focusout", start);
        hero.addEventListener("keydown", function (e) {
          if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1, true); }
          if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1, true); }
        });
      }
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) clearInterval(timer); else start();
      });
      go(0);
      start();
      window.__heroPause = function () { clearInterval(timer); };
      window.__heroResume = start;
    })();

    /* --- hero film: the circle morphs into the header, and back -------- */
    (function () {
      var hero = document.querySelector(".hero.clean");
      var box = document.getElementById("filmbox");
      var video = document.getElementById("heroVideo");
      var playBtn = document.getElementById("filmPlay");
      var closeBtn = document.getElementById("filmClose");
      if (!hero || !box || !video) return;

      var home = box.parentNode;            // the .badge it lives in
      var placeholder = document.createElement("div");
      placeholder.className = "filmslot";
      var open = false;

      function rectIn(el, host) {
        var r = el.getBoundingClientRect(), h = host.getBoundingClientRect();
        return { top: r.top - h.top, left: r.left - h.left, w: r.width, h: r.height };
      }
      function pin(r) {
        box.style.position = "absolute";
        box.style.top = r.top + "px";
        box.style.left = r.left + "px";
        box.style.width = r.w + "px";
        box.style.height = r.h + "px";
      }

      function expand() {
        if (open) return;
        open = true;
        var from = rectIn(box, hero);
        home.insertBefore(placeholder, box);   // hold the circle's slot
        hero.appendChild(box);                 // move it into the header
        pin(from);
        box.getBoundingClientRect();           // flush, so the change animates
        box.classList.add("is-open");
        box.style.top = "0px";
        box.style.left = "0px";
        box.style.width = hero.clientWidth + "px";
        box.style.height = hero.clientHeight + "px";
        if (window.__heroPause) window.__heroPause();
        try { video.currentTime = 0; } catch (err) { /* metadata not ready yet */ }
        var p = video.play();
        if (p && p.catch) p.catch(function () { collapse(); });
        setTimeout(function () { closeBtn.focus(); }, 500);
      }

      function collapse() {
        if (!open) return;
        open = false;
        video.pause();
        var to = rectIn(placeholder, hero);
        pin(to);
        box.classList.remove("is-open");
        var settled = false;
        var done = function (e) {
          // only the size transition marks the end — border-color finishes sooner
          if (e && e.propertyName && e.propertyName !== "width" && e.propertyName !== "height") return;
          if (settled) return;
          settled = true;
          box.removeEventListener("transitionend", done);
          box.removeAttribute("style");
          if (placeholder.parentNode) placeholder.parentNode.replaceChild(box, placeholder);
          if (window.__heroResume) window.__heroResume();
          if (playBtn) playBtn.focus();
        };
        box.addEventListener("transitionend", done);
        setTimeout(done, 950);                 // fallback if the event never fires
      }

      if (playBtn) playBtn.addEventListener("click", expand);
      if (closeBtn) closeBtn.addEventListener("click", collapse);
      video.addEventListener("ended", collapse);
      video.addEventListener("error", collapse);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && open) collapse();
      });
      window.addEventListener("resize", function () {
        if (!open) return;
        box.style.width = hero.clientWidth + "px";
        box.style.height = hero.clientHeight + "px";
      });
    })();

    /* --- theme menu --- */
    var themeBtn = document.getElementById("themeBtn");
    var themeMenu = document.getElementById("themeMenu");
    if (themeBtn && themeMenu) {
      themeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = themeMenu.getAttribute("data-open") === "true";
        themeMenu.setAttribute("data-open", String(!open));
        themeBtn.setAttribute("aria-expanded", String(!open));
      });
      themeMenu.addEventListener("click", function (e) { e.stopPropagation(); });
      document.addEventListener("click", function () {
        themeMenu.setAttribute("data-open", "false");
        themeBtn.setAttribute("aria-expanded", "false");
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          themeMenu.setAttribute("data-open", "false");
          themeBtn.setAttribute("aria-expanded", "false");
        }
      });
      document.querySelectorAll("[data-theme-opt]").forEach(function (b) {
        b.addEventListener("click", function () {
          setTheme(b.getAttribute("data-theme-opt"), true);
          themeMenu.setAttribute("data-open", "false");
          themeBtn.setAttribute("aria-expanded", "false");
          themeBtn.focus();
        });
      });
    }
    applyTheme(false);

    /* --- mobile drawer --- */
    var navToggle = document.getElementById("navToggle");
    var drawer = document.getElementById("drawer");
    if (navToggle && drawer) {
      navToggle.addEventListener("click", function () {
        var open = drawer.getAttribute("data-open") === "true";
        drawer.setAttribute("data-open", String(!open));
        navToggle.setAttribute("aria-expanded", String(!open));
      });
      drawer.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          drawer.setAttribute("data-open", "false");
          navToggle.setAttribute("aria-expanded", "false");
        });
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && drawer.getAttribute("data-open") === "true") {
          drawer.setAttribute("data-open", "false");
          navToggle.setAttribute("aria-expanded", "false");
          navToggle.focus();
        }
      });
    }

    /* --- accessibility panel --- */
    var fab = document.getElementById("a11yFab");
    var panel = document.getElementById("a11yPanel");
    function closePanel() {
      if (!panel) return;
      panel.setAttribute("data-open", "false");
      if (fab) { fab.setAttribute("aria-expanded", "false"); fab.focus(); }
    }
    if (fab && panel) {
      fab.addEventListener("click", function () {
        var open = panel.getAttribute("data-open") === "true";
        panel.setAttribute("data-open", String(!open));
        fab.setAttribute("aria-expanded", String(!open));
        if (!open) { var f = panel.querySelector("button"); if (f) f.focus(); }
      });
      var closeBtn = panel.querySelector(".close");
      if (closeBtn) closeBtn.addEventListener("click", closePanel);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && panel.getAttribute("data-open") === "true") closePanel();
      });
      /* keyboard shortcut — heuristic 7: flexibility */
      document.addEventListener("keydown", function (e) {
        if (e.altKey && (e.key === "a" || e.key === "A")) { e.preventDefault(); fab.click(); }
      });
    }

    document.querySelectorAll("[data-pref]").forEach(function (b) {
      b.addEventListener("click", function () {
        setPref(b.getAttribute("data-pref"), b.getAttribute("data-val"), b.getAttribute("data-msg") || "");
      });
    });
    syncPrefButtons();

    var reset = document.getElementById("a11yReset");
    if (reset) reset.addEventListener("click", function () {
      A11Y.forEach(function (s) { root.setAttribute(s.attr, s.def); store.set(s.key, s.def); });
      setTheme("auto", false);
      stopSpeech("Stopped.");
      syncPrefButtons();
      toast("All accessibility settings reset");
    });

    /* --- read aloud --- */
    var play = document.getElementById("speakPlay");
    var pause = document.getElementById("speakPause");
    var stop = document.getElementById("speakStop");
    if (play) play.addEventListener("click", function () {
      if (speech.active) { stopSpeech("Stopped."); } else { startSpeech(); }
    });
    if (pause) pause.addEventListener("click", pauseSpeech);
    if (stop) stop.addEventListener("click", function () { stopSpeech("Stopped."); });
    if (!speech.supported) speechStatus("Read-aloud is not supported in this browser.");

    /* --- scroll progress + back to top --- */
    var bar = document.getElementById("progress");
    var top = document.getElementById("toTop");
    var mast = document.querySelector(".masthead");
    function onScroll() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      if (bar) { bar.style.width = pct + "%"; bar.setAttribute("aria-valuenow", Math.round(pct)); }
      if (top) top.setAttribute("data-show", String(h.scrollTop > 600));
      if (mast) mast.classList.toggle("is-stuck", h.scrollTop > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (top) top.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: root.getAttribute("data-motion") === "off" ? "auto" : "smooth" });
      var sk = document.querySelector(".logo"); if (sk) sk.focus();
    });

    /* --- reveal on scroll (Gestalt: common fate) --- */
    var reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && reveals.length) {
      var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      reveals.forEach(function (n) { ro.observe(n); });
    } else {
      reveals.forEach(function (n) { n.classList.add("in"); });
    }

    /* --- video takeover: if a real clip exists, it replaces the stills -- */
    document.querySelectorAll("video[data-clip]").forEach(function (v) {
      v.addEventListener("loadeddata", function () {
        var host = v.closest(".cine");
        if (host) host.setAttribute("data-has-video", "true");
      });
      v.addEventListener("error", function () { v.remove(); });
    });

    /* --- mobile playing-card deck ---------------------------------- */
    document.querySelectorAll(".deck").forEach(function (deck) {
      var cards = Array.prototype.slice.call(deck.children);
      if (cards.length < 2) return;

      /* dots */
      var dots = document.createElement("div");
      dots.className = "deck-dots";
      dots.setAttribute("role", "tablist");
      dots.setAttribute("aria-label", "Card navigation");
      cards.forEach(function (c, i) {
        var d = document.createElement("button");
        d.type = "button";
        d.setAttribute("role", "tab");
        d.setAttribute("aria-label", "Card " + (i + 1) + " of " + cards.length);
        d.addEventListener("click", function () {
          c.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
        });
        dots.appendChild(d);
      });
      if (deck.parentNode) deck.parentNode.insertBefore(dots, deck.nextSibling);

      function markActive(el) {
        cards.forEach(function (c, i) {
          var on = c === el;
          c.classList.toggle("is-active", on);
          var dot = dots.children[i];
          if (dot) dot.setAttribute("aria-current", String(on));
        });
      }
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          var best = null;
          entries.forEach(function (en) {
            if (!best || en.intersectionRatio > best.intersectionRatio) best = en;
          });
          if (best && best.intersectionRatio > 0.55) markActive(best.target);
        }, { root: deck, threshold: [0.3, 0.55, 0.8] });
        cards.forEach(function (c) { io.observe(c); });
      }
      markActive(cards[0]);
    });

    /* --- count-up numbers ------------------------------------------ */
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      if (root.getAttribute("data-motion") === "off") { el.textContent = target + suffix; return; }
      var seen = false;
      var io2 = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting || seen) return;
          seen = true;
          var start = performance.now(), dur = 1400;
          (function tick(now) {
            var p = Math.min((now - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased).toLocaleString() + suffix;
            if (p < 1) requestAnimationFrame(tick);
          })(start);
        });
      }, { threshold: 0.5 });
      io2.observe(el);
    });
  });
})();
