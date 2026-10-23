// Portfolio interactions
// Author: Suyash Maniyar

(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initScrollSpy();
    initCollapsibles();
    initCopyEmail();
  });

  // ---------- Helpers ----------
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
