(function () {
  document.getElementById('year').textContent = new Date().getFullYear();

  var printBtn = document.querySelector('[data-print]');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countUp(el) {
    var to = parseFloat(el.dataset.to), dec = parseInt(el.dataset.decimals || '0', 10);
    var pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (still) return;
    var t0 = performance.now(), dur = 1600;
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + (to * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  var io = 'IntersectionObserver' in window && new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      var n = e.target.querySelector('[data-count]');
      if (n) countUp(n);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    io ? io.observe(el) : el.classList.add('in');
  });

  /* Photo loops: cross fade through the images in each [data-photo-loop] */
  document.querySelectorAll('[data-photo-loop]').forEach(function (loop) {
    var imgs = loop.querySelectorAll('img'), i = 0;
    var every = parseInt(loop.dataset.interval || '5000', 10);
    var ticks = loop.parentNode.querySelector('.photo-ticks');
    if (ticks) {
      ticks.style.setProperty('--dur', every + 'ms');
      imgs.forEach(function () { ticks.appendChild(document.createElement('i')); });
    }
    function show(n) {
      imgs[i].classList.remove('on');
      i = n % imgs.length;
      imgs[i].classList.add('on');
      if (ticks) ticks.querySelectorAll('i').forEach(function (t, k) {
        t.classList.remove('on'); void t.offsetWidth; if (k === i) t.classList.add('on');
      });
    }
    show(0);
    if (still || imgs.length < 2) return;
    setInterval(function () { if (!document.hidden) show(i + 1); }, every);
  });

  var bar = document.querySelector('.topbar');
  window.addEventListener('scroll', function () {
    bar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();
