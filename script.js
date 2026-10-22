// Portfolio interactions
// Author: Suyash Maniyar

(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initScrollSpy();
    initCurve();
    initCollapsibles();
    initSkillHighlight();
    initCopyEmail();
  });

  // ---------- Helpers ----------
  function scrollToEntry(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    flash(el);
  }

  function flash(el) {
    el.classList.add('is-focus');
    clearTimeout(el._flashTimer);
    el._flashTimer = setTimeout(function () {
      if (!el.classList.contains('is-pinned-focus')) el.classList.remove('is-focus');
    }, 1800);
  }

  var toastTimer;
  function toast(msg) {
    var t = document.querySelector('.toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 1800);
  }

  // ---------- Theme ----------
  function initTheme() {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    var root = document.documentElement;
    var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    function current() {
      var set = root.getAttribute('data-theme');
      if (set) return set;
      return mq && mq.matches ? 'dark' : 'light';
    }
    function render() {
      var next = current() === 'dark' ? 'light' : 'dark';
      btn.querySelector('.theme-toggle-text').textContent = next === 'dark' ? 'Dark mode' : 'Light mode';
      btn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    }
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      render();
    });
    if (mq && mq.addEventListener) mq.addEventListener('change', render);
    render();
  }

  // ---------- Scroll spy ----------
  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.rail-nav a'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var link = byId[en.target.id];
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-35% 0px -60% 0px' });

    document.querySelectorAll('main section[id]').forEach(function (s) { obs.observe(s); });
  }

  // ---------- Career reward curve ----------
  var MILESTONES = [
    { t: 2019.60, date: 'Aug 2019', title: 'Started B.Tech in Electrical Engineering, IIT Jodhpur', href: '#edu-iitj' },
    { t: 2022.37, date: 'May 2022', title: 'AI/ML Intern, Decimal Point Analytics', href: '#exp-dpa-intern' },
    { t: 2022.60, date: 'Aug 2022', title: 'Machine Learning Intern, RaapidAI', href: '#exp-raapid' },
    { t: 2022.95, date: 'Jan 2023', title: 'First place, INAE-SERB Youth Conclave', href: '#res-haptic' },
    { t: 2023.50, date: 'Jul 2023', title: 'ML Engineer, Decimal Point Analytics', href: '#exp-dpa' },
    { t: 2024.85, date: 'Nov 2024', title: 'Advanced Data Science Associate, ZS Associates', href: '#exp-zs' },
    { t: 2025.15, date: 'Feb 2025', title: 'ICDAR 2025 paper on synthetic lecture slides', href: '#pub-icdar' },
    { t: 2025.62, date: 'Aug 2025', title: 'Started MS in Computer Science, UMass Amherst', href: '#edu-umass' },
    { t: 2026.38, date: 'May 2026', title: 'COLM 2026 workshop paper on reward hacking', href: '#pub-colm' },
    { t: 2026.55, date: 'Jul 2026', title: 'Applied AI and Data Science Co-op, J&J MedTech', href: '#exp-jnj', now: true }
  ];

  function initCurve() {
    var host = document.getElementById('curve-plot');
    if (!host) return;
    var figure = host.closest('.curve');
    var NS = 'http://www.w3.org/2000/svg';

    var W = 740, H = 230;
    var x0 = 6, x1 = 726, yBottom = 196, yTop = 26;
    var tMin = 2019.3, tMax = 2027.0;

    function reward(t) {
      var k = 3.6;
      var f = 1 - Math.exp(-(t - tMin) / k);
      var fMax = 1 - Math.exp(-(tMax - tMin) / k);
      return f / fMax;
    }
    function X(t) { return x0 + (t - tMin) / (tMax - tMin) * (x1 - x0); }
    function Y(r) { return yBottom - r * (yBottom - yTop); }

    // Deterministic noise so the curve looks like a real RL reward trace.
    var seed = 7;
    function rand() {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var v = Math.imul(seed ^ seed >>> 15, 1 | seed);
      v = v + Math.imul(v ^ v >>> 7, 61 | v) ^ v;
      return ((v ^ v >>> 14) >>> 0) / 4294967296;
    }

    var rawPts = [], smoothPts = [], prevNoise = 0;
    for (var t = tMin; t <= tMax + 1e-9; t += 0.035) {
      var p = (t - tMin) / (tMax - tMin);
      var noise = (rand() - 0.5) * 0.2 * (1 - 0.55 * p);
      noise = 0.55 * noise + 0.45 * prevNoise;
      prevNoise = noise;
      var r = reward(t);
      rawPts.push([X(t), Y(Math.max(0, Math.min(1.04, r + noise)))]);
      smoothPts.push([X(t), Y(r)]);
    }
    function pathD(pts) {
      return pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(' ');
    }

    function el(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(n);
      return n;
    }

    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'group', 'aria-label': 'Career milestones from 2019 to 2026' });

    // Axes
    el('line', { class: 'axis', x1: x0, y1: yBottom, x2: x1, y2: yBottom }, svg);
    for (var yr = 2020; yr <= 2026; yr++) {
      var tx = X(yr);
      el('line', { class: 'axis', x1: tx, y1: yBottom, x2: tx, y2: yBottom + 5 }, svg);
      var lbl = el('text', { class: 'tick-label', x: tx, y: yBottom + 22, 'text-anchor': 'middle' }, svg);
      lbl.textContent = yr;
    }
    var yl = el('text', { class: 'axis-label', x: x0, y: 12 }, svg);
    yl.textContent = 'reward';

    var raw = el('path', { class: 'raw', d: pathD(rawPts) }, svg);
    var smooth = el('path', { class: 'smooth', d: pathD(smoothPts) }, svg);

    var ptsGroup = el('g', { class: 'pts' }, svg);
    var tip = document.createElement('div');
    tip.className = 'curve-tip';
    tip.hidden = true;
    host.appendChild(svg);
    host.appendChild(tip);

    var pinned = null;

    function showTip(m, node, pin) {
      tip.innerHTML = '';
      var d = document.createElement('span'); d.className = 'tip-date'; d.textContent = m.date;
      var ti = document.createElement('span'); ti.className = 'tip-title'; ti.textContent = m.title;
      tip.appendChild(d); tip.appendChild(ti);
      if (pin) {
        var a = document.createElement('a');
        a.className = 'tip-link'; a.href = m.href; a.textContent = 'Go to entry';
        a.addEventListener('click', function (e) {
          e.preventDefault();
          hideTip(true);
          scrollToEntry(document.querySelector(m.href));
        });
        tip.appendChild(a);
      }
      tip.classList.toggle('is-pinned', !!pin);
      tip.hidden = false;

      var rect = host.getBoundingClientRect();
      var px = m._x / W * rect.width;
      var py = m._y / H * rect.height;
      var half = tip.offsetWidth / 2;
      px = Math.max(half, Math.min(rect.width - half, px));
      tip.style.left = px + 'px';
      tip.style.top = py + 'px';

      svg.querySelectorAll('.pt').forEach(function (g) { g.classList.remove('is-active'); });
      node.classList.add('is-active');
    }
    function hideTip(force) {
      if (pinned && !force) return;
      pinned = null;
      tip.hidden = true;
      svg.querySelectorAll('.pt').forEach(function (g) { g.classList.remove('is-active'); });
    }

    MILESTONES.forEach(function (m) {
      m._x = X(m.t);
      m._y = Y(reward(m.t));
      var g = el('g', {
        class: 'pt' + (m.now ? ' is-now' : ''),
        tabindex: '0',
        role: 'button',
        'aria-label': m.date + ': ' + m.title
      }, ptsGroup);
      el('circle', { class: 'hit', cx: m._x, cy: m._y, r: 14 }, g);
      el('circle', { cx: m._x, cy: m._y, r: 5 }, g);

      g.addEventListener('mouseenter', function () { if (!pinned) showTip(m, g, false); });
      g.addEventListener('mouseleave', function () { hideTip(false); });
      g.addEventListener('focus', function () { if (!pinned) showTip(m, g, false); });
      g.addEventListener('blur', function () { hideTip(false); });
      g.addEventListener('click', function (e) {
        e.stopPropagation();
        pinned = m;
        showTip(m, g, true);
      });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          hideTip(true);
          scrollToEntry(document.querySelector(m.href));
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (pinned && !tip.contains(e.target)) hideTip(true);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && pinned) hideTip(true);
    });

    // One orchestrated moment: the curve draws itself on load.
    if (!reduceMotion && figure) {
      [raw, smooth].forEach(function (p) {
        var len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
      });
      figure.classList.add('is-pending');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          figure.classList.add('is-drawing');
          raw.style.strokeDashoffset = 0;
          smooth.style.strokeDashoffset = 0;
          figure.classList.remove('is-pending');
        });
      });
    }
  }

  // ---------- Show more / less on long bullet lists ----------
  function initCollapsibles() {
    document.querySelectorAll('.points.collapsible').forEach(function (ul) {
      var n = ul.children.length;
      if (n <= 3) return;
      var hiddenCount = n - 2;
      ul.classList.add('is-collapsed');
      if (!ul.id) ul.id = 'pts-' + Math.random().toString(36).slice(2, 8);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'more-btn';
      btn.setAttribute('aria-controls', ul.id);
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = 'Show ' + hiddenCount + ' more';
      ul.insertAdjacentElement('afterend', btn);

      btn.addEventListener('click', function () {
        var open = ul.classList.toggle('is-collapsed') === false;
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.textContent = open ? 'Show less' : 'Show ' + hiddenCount + ' more';
      });
    });
  }

  // ---------- Skill highlighting ----------
  function initSkillHighlight() {
    var entries = Array.prototype.slice.call(document.querySelectorAll('.entry[data-tags]'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-skill]'));
    var bar = document.querySelector('.highlight-bar');
    if (!chips.length || !bar) return;
    var text = bar.querySelector('.highlight-text');
    var active = null, matches = [], idx = -1;

    function tagsOf(entry) {
      return (entry.getAttribute('data-tags') || '').split(/\s+/).filter(Boolean);
    }

    chips.forEach(function (chip) {
      var key = chip.getAttribute('data-skill');
      var count = entries.filter(function (e) { return tagsOf(e).indexOf(key) !== -1; }).length;
      if (!count) {
        chip.classList.add('is-static');
        chip.disabled = true;
        return;
      }
      var c = document.createElement('span');
      c.className = 'count';
      c.textContent = count;
      c.setAttribute('aria-hidden', 'true');
      chip.appendChild(c);
      chip.setAttribute('aria-pressed', 'false');
      chip.setAttribute('aria-label', chip.firstChild.textContent.trim() + ', ' + count + (count === 1 ? ' entry' : ' entries'));
      chip.addEventListener('click', function () {
        if (active === chip) clear(); else activate(chip, key);
      });
    });

    function activate(chip, key) {
      chips.forEach(function (c) { if (c.hasAttribute('aria-pressed')) c.setAttribute('aria-pressed', 'false'); });
      chip.setAttribute('aria-pressed', 'true');
      active = chip;
      matches = [];
      entries.forEach(function (e) {
        var hit = tagsOf(e).indexOf(key) !== -1;
        e.classList.toggle('is-match', hit);
        e.classList.remove('is-focus');
        if (hit) matches.push(e);
      });
      idx = -1;
      document.body.classList.add('is-highlighting');
      var name = chip.firstChild.textContent.trim();
      text.innerHTML = '';
      var b = document.createElement('b'); b.textContent = name;
      text.appendChild(b);
      text.appendChild(document.createTextNode(' is used in ' + matches.length + (matches.length === 1 ? ' entry' : ' entries')));
      bar.hidden = false;
    }

    function step(dir) {
      if (!matches.length) return;
      if (matches[idx]) matches[idx].classList.remove('is-focus', 'is-pinned-focus');
      idx = (idx + dir + matches.length) % matches.length;
      var target = matches[idx];
      target.classList.add('is-pinned-focus');
      target.classList.add('is-focus');
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }

    function clear() {
      if (active) active.setAttribute('aria-pressed', 'false');
      active = null;
      matches = [];
      idx = -1;
      document.body.classList.remove('is-highlighting');
      entries.forEach(function (e) { e.classList.remove('is-match', 'is-focus', 'is-pinned-focus'); });
      bar.hidden = true;
    }

    bar.querySelector('.hl-next').addEventListener('click', function () { step(1); });
    bar.querySelector('.hl-prev').addEventListener('click', function () { step(-1); });
    bar.querySelector('.hl-clear').addEventListener('click', clear);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && active) clear(); });
  }

  // ---------- Copy email ----------
  function initCopyEmail() {
    var btn = document.querySelector('.copy-email');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var email = btn.getAttribute('data-email');
      function done() {
        btn.textContent = 'Copied';
        toast('Email address copied');
        setTimeout(function () { btn.textContent = 'Copy'; }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, function () { toast('Copy failed. Email: ' + email); });
      } else {
        toast('Email: ' + email);
      }
    });
  }
})();
