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
  /* each feature runs in isolation — a fault in one must not disable the others */
  function safely(fn) {
    try { fn(); } catch (e) {
      if (window.console && console.warn) console.warn("[princeton] feature failed:", e);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {

    /* --- copyright year: always current, never stale --- */
    document.querySelectorAll("#year").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });



    /* --- hero video: plays on its own, muted, looping ----------------- */
    safely(function () {
      var v = document.querySelector(".herovideo");
      if (!v) return;
      v.muted = true;                       // required for autoplay everywhere
      var p = v.play();
      if (p && p.catch) p.catch(function () {
        // some browsers still refuse; the poster frame stands in
        if (window.console && console.warn) console.warn("[princeton] hero video autoplay blocked");
      });
      // don't burn battery on a hidden tab
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) { v.pause(); } else { var q = v.play(); if (q && q.catch) q.catch(function () {}); }
      });
      // respect a reduced-motion preference
      try {
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) v.pause();
      } catch (e) {}
    });


    /* --- attraction filters ------------------------------------------- */
    safely(function () {
      var btns = Array.prototype.slice.call(document.querySelectorAll(".filters button"));
      var cards = Array.prototype.slice.call(document.querySelectorAll(".acard[data-cat]"));
      var out = document.getElementById("filterCount");
      if (!btns.length || !cards.length) return;

      function apply(cat) {
        var shown = 0;
        cards.forEach(function (c) {
          var match = cat === "all" ||
                      (" " + c.getAttribute("data-cat") + " ").indexOf(" " + cat + " ") > -1;
          c.hidden = !match;
          if (match) shown++;
        });
        btns.forEach(function (b) {
          b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === cat));
        });
        if (out) {
          out.textContent = cat === "all"
            ? "Showing all " + shown + " places"
            : "Showing " + shown + " of " + cards.length + " places";
        }
      }
      btns.forEach(function (b) {
        b.addEventListener("click", function () { apply(b.getAttribute("data-filter")); });
      });
      apply("all");
    });


    /* --- site search ---------------------------------------------------- */
    safely(function () {
      var btn   = document.getElementById("searchBtn");
      var panel = document.getElementById("searchPanel");
      var scrim = document.getElementById("searchScrim");
      var input = document.getElementById("searchInput");
      var list  = document.getElementById("searchResults");
      var stat  = document.getElementById("searchStatus");
      var close = document.getElementById("searchClose");
      if (!btn || !panel || !input || !list) return;

      var DATA = window.SEARCH_INDEX || [];
      var KIND = { attraction:"Place", page:"Page", section:"Section",
                   question:"Question", card:"Detail" };
      var active = -1, hits = [], lastFocus = null, page = 0, PER = 6, lastQ = "";

      function esc(t){ return t.replace(/[&<>"]/g, function(c){
        return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }

      function mark(text, terms) {
        var out = esc(text);
        terms.forEach(function (t) {
          if (t.length < 2) return;
          out = out.replace(new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + ")","ig"),
                            "<mark>$1</mark>");
        });
        return out;
      }

      function norm(t){ return t.toLowerCase().replace(/[\u2018\u2019\u201c\u201d]/g,"'").replace(/\s+/g," "); }

      /* A query can be words, a phrase, or "a quoted phrase".
         Quoted text must appear verbatim; unquoted words must all appear,
         and a run of them appearing together scores far higher. */
      function parse(q) {
        var phrases = [], rest = q;
        rest = rest.replace(/"([^"]+)"/g, function (_, p) { phrases.push(norm(p)); return " "; });
        var words = norm(rest).split(/\s+/).filter(function (w) { return w.length > 1; });
        return { phrases: phrases, words: words, whole: norm(q.replace(/"/g, "")) };
      }

      function search(q) {
        var Q = parse(q);
        if (!Q.phrases.length && !Q.words.length) return [];
        return DATA.map(function (e) {
          var t = norm(e.t), b = norm((e.b || "") + " " + (e.kw || "")), all = t + " " + b, s = 0;

          // a required quoted phrase that is missing rules the entry out
          for (var i = 0; i < Q.phrases.length; i++) {
            if (all.indexOf(Q.phrases[i]) === -1) return null;
            s += 160;
            if (t.indexOf(Q.phrases[i]) > -1) s += 90;
          }
          // the whole query appearing as a run of words is the strongest signal
          if (Q.words.length > 1 && Q.whole && all.indexOf(Q.whole) > -1) {
            s += 150;
            if (t.indexOf(Q.whole) > -1) s += 100;
          }
          for (var k = 0; k < Q.words.length; k++) {
            var w = Q.words[k];
            if (t === w) s += 120;
            else if (t.indexOf(w) === 0) s += 60;
            else if (t.indexOf(w) > -1) s += 40;
            if (b.indexOf(w) > -1) s += 14;
            if (all.indexOf(w) === -1) return null;      // every word must appear
          }
          return { e: e, s: s + (e.k === "attraction" ? 6 : 0) };
        }).filter(Boolean).sort(function (a, b) { return b.s - a.s; })
          .map(function (r) { return r.e; });
      }

      /* Show the part of the text the match is actually in, not the opening line. */
      function snippet(text, Q) {
        if (!text) return "";
        var low = norm(text), at = -1;
        var probes = Q.phrases.concat(Q.whole && Q.words.length > 1 ? [Q.whole] : [], Q.words);
        for (var i = 0; i < probes.length; i++) {
          if (!probes[i]) continue;
          var p = low.indexOf(probes[i]);
          if (p > -1) { at = p; break; }
        }
        if (at < 0) return text.slice(0, 180) + (text.length > 180 ? "…" : "");
        var start = Math.max(0, at - 70);
        // start on a word boundary
        if (start > 0) { var sp = text.indexOf(" ", start); if (sp > -1 && sp < at) start = sp + 1; }
        var end = Math.min(text.length, at + 130);
        return (start > 0 ? "…" : "") + text.slice(start, end).trim() + (end < text.length ? "…" : "");
      }


      function render(q, keepPage) {
        if (!keepPage) page = 0;
        lastQ = q;
        hits = search(q); active = -1; list.innerHTML = "";
        input.removeAttribute("aria-activedescendant");
        var pager = document.getElementById("searchPager");
        if (pager) pager.hidden = true;
        if (!q.trim()) { stat.textContent = ""; return; }
        if (!hits.length) {
          stat.textContent = "Nothing found for " + q + ". Try a single word, or put a phrase in quotes.";
          return;
        }

        var pages = Math.ceil(hits.length / PER);
        if (page > pages - 1) page = pages - 1;
        var slice = hits.slice(page * PER, page * PER + PER);

        var Q = parse(q);
        var terms = Q.phrases.concat(Q.words);
        if (Q.words.length > 1 && Q.whole) terms.unshift(Q.whole);

        slice.forEach(function (e, i) {
          var li = document.createElement("li");
          li.innerHTML =
            '<a href="' + e.u + '" role="option" id="sr' + i + '" data-url="' + e.u + '">' +
              '<span class="r-top"><span class="r-title">' + mark(e.t, terms) + "</span>" +
              '<span class="r-kind">' + (KIND[e.k] || e.k) + "</span></span>" +
              (e.b ? '<p class="r-body">' + mark(snippet(e.b, Q), terms) + "</p>" : "") +
            "</a>";
          list.appendChild(li);
        });

        var from = page * PER + 1, to = page * PER + slice.length;
        stat.textContent = hits.length === 1
          ? "1 result"
          : "Showing " + from + "–" + to + " of " + hits.length + " results";

        if (pager && pages > 1) {
          pager.hidden = false;
          document.getElementById("pagePrev").disabled = page === 0;
          document.getElementById("pageNext").disabled = page >= pages - 1;
          document.getElementById("pageNum").textContent = (page + 1) + " / " + pages;
        }
      }

      function turn(step) {
        var pages = Math.ceil(hits.length / PER);
        page = Math.min(Math.max(page + step, 0), pages - 1);
        render(lastQ, true);
        var first = list.querySelector("a");
        if (first) { highlight(0); }
        list.scrollTop = 0;
      }

      function highlight(n) {
        var links = list.querySelectorAll("a");
        if (!links.length) return;
        active = (n + links.length) % links.length;
        links.forEach(function (a, i) { a.classList.toggle("is-active", i === active); });
        if (links[active].scrollIntoView) links[active].scrollIntoView({ block: "nearest" });
        input.setAttribute("aria-activedescendant", links[active].id);
      }

      function open() {
        lastFocus = document.activeElement;
        panel.hidden = false; scrim.hidden = false;
        btn.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
        input.value = ""; render(""); input.focus();
      }
      function shut() {
        panel.hidden = true; scrim.hidden = true;
        btn.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }

      btn.addEventListener("click", function () { panel.hidden ? open() : shut(); });

      // clicking a result on the current page scrolls to the block instead of jumping
      list.addEventListener("click", function (ev) {
        var a = ev.target.closest ? ev.target.closest("a") : null;
        if (!a) return;
        var url = a.getAttribute("data-url") || a.getAttribute("href");
        var hash = url.indexOf("#") > -1 ? url.slice(url.indexOf("#") + 1) : "";
        var file = url.split("#")[0];
        var here = location.pathname.split("/").pop() || "index.html";
        if (file && file !== here) return;              // let the browser navigate
        ev.preventDefault();
        shut();
        if (hash) { setTimeout(function () { goTo(hash); }, 60); }
        else { window.scrollTo({ top: 0, behavior: "smooth" }); }
      });
      close.addEventListener("click", shut);
      var pp = document.getElementById("pagePrev"), pn = document.getElementById("pageNext");
      if (pp) pp.addEventListener("click", function () { turn(-1); });
      if (pn) pn.addEventListener("click", function () { turn(1); });
      scrim.addEventListener("click", shut);

      var timer = null;
      input.addEventListener("input", function () {
        clearTimeout(timer);
        timer = setTimeout(function () { render(input.value); }, 90);
      });

      input.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") { e.preventDefault(); highlight(active + 1); }
        else if (e.key === "ArrowUp") { e.preventDefault(); highlight(active - 1); }
        else if (e.key === "PageDown") { e.preventDefault(); turn(1); }
        else if (e.key === "PageUp") { e.preventDefault(); turn(-1); }
        else if (e.key === "Enter") {
          var links = list.querySelectorAll("a");
          if (links.length) { e.preventDefault(); (links[active] || links[0]).click(); }
        }
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !panel.hidden) { e.preventDefault(); shut(); return; }
        if (panel.hidden && (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"))) {
          var tag = (e.target.tagName || "").toLowerCase();
          if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
          e.preventDefault(); open();
        }
      });

      // keep focus inside the dialog
      panel.addEventListener("keydown", function (e) {
        if (e.key !== "Tab") return;
        var f = panel.querySelectorAll("input, button, a");
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    });

    /* --- scroll to a searched block and flash it ------------------------ */
    safely(function () {
      window.goTo = function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        var open = el.closest ? el.closest("details") : null;
        if (open && !open.open) open.open = true;        // reveal answers inside accordions
        if (el.hidden) el.hidden = false;                 // un-filter a hidden attraction
        var smooth = root.getAttribute("data-motion") !== "off";
        var top = el.getBoundingClientRect().top + window.pageYOffset - 96;
        try { window.scrollTo({ top: top, behavior: smooth ? "smooth" : "auto" }); }
        catch (e) { window.scrollTo(0, top); }
        el.classList.add("search-hit");
        el.setAttribute("tabindex", "-1");
        setTimeout(function () { el.focus({ preventScroll: true }); }, smooth ? 420 : 0);
        setTimeout(function () { el.classList.remove("search-hit"); }, 2400);
      };
      // arriving from a search on another page
      if (location.hash.length > 1) {
        setTimeout(function () { window.goTo(location.hash.slice(1)); }, 120);
      }
    });

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
      var smooth = root.getAttribute("data-motion") !== "off";
      var behavior = smooth ? "smooth" : "auto";
      // belt and braces: some engines ignore one or other of these
      try { window.scrollTo({ top: 0, left: 0, behavior: behavior }); } catch (e) { window.scrollTo(0, 0); }
      document.documentElement.scrollTop = document.documentElement.scrollTop && smooth ? document.documentElement.scrollTop : 0;
      if (document.body) document.body.scrollTop = 0;
      // land focus on the header so keyboard users continue from the top
      var target = document.querySelector(".masthead .logo") || document.querySelector(".logo");
      if (target) {
        target.setAttribute("tabindex", "-1");
        setTimeout(function () { target.focus({ preventScroll: true }); }, smooth ? 420 : 0);
      }
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
