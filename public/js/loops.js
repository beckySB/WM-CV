/* Looping visuals: silk ribbons, contour lines and an engraved rosette.
   Each loop only animates while on screen and stays still for reduced motion users. */
(function () {
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TAU = Math.PI * 2;

  function canvasLoop(canvas, draw) {
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, running = false, start = performance.now(), raf = 0;

    function size() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!running) frame(still ? 4000 : performance.now());
    }
    function frame(now) {
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h, (now - start) / 1000);
    }
    function tick(now) {
      if (!running) return;
      frame(now);
      raf = requestAnimationFrame(tick);
    }
    window.addEventListener('resize', size);
    size();
    if (still) return;
    new IntersectionObserver(function (es) {
      var vis = es[0].isIntersecting;
      if (vis && !running) { running = true; raf = requestAnimationFrame(tick); }
      if (!vis) { running = false; cancelAnimationFrame(raf); }
    }).observe(canvas);
  }

  /* Flowing ribbons of blue light */
  function silk(canvas) {
    var low = canvas.dataset.variant === 'low';
    var ribbons = low
      ? [{ y: .72, a: .10, hue: 216, n: 18, sp: .10 }, { y: .30, a: .08, hue: 222, n: 14, sp: .07 }]
      : [
          { y: .62, a: .16, hue: 214, n: 28, sp: .12 },
          { y: .48, a: .12, hue: 222, n: 24, sp: .09 },
          { y: .78, a: .10, hue: 206, n: 20, sp: .15 },
          { y: .34, a: .08, hue: 228, n: 16, sp: .07 }
        ];
    canvasLoop(canvas, function (ctx, w, h, t) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1;
      var step = Math.max(6, w / 140);
      ribbons.forEach(function (r, ri) {
        for (var i = 0; i < r.n; i++) {
          var k = i / r.n;
          ctx.beginPath();
          for (var x = -20; x <= w + 20; x += step) {
            var u = x / w;
            var y = h * r.y
              + Math.sin(u * 3.1 + t * r.sp * 4 + ri * 1.7 + k * 1.2) * h * .11
              + Math.sin(u * 7.3 - t * r.sp * 3 + k * 2.4) * h * .035
              + (k - .5) * h * .16 * (0.6 + 0.4 * Math.sin(u * 2.2 + t * r.sp * 2));
            x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          var alpha = r.a * (1 - Math.abs(k - .5) * 1.6);
          ctx.strokeStyle = 'hsla(' + r.hue + ', 80%, ' + (62 + k * 18) + '%, ' + alpha + ')';
          ctx.stroke();
        }
      });
      ctx.globalCompositeOperation = 'source-over';
    });
  }

  /* Slow topographic contour lines */
  function contour(canvas) {
    canvasLoop(canvas, function (ctx, w, h, t) {
      ctx.lineWidth = 1;
      var lines = 22, step = Math.max(8, w / 120);
      for (var i = 0; i < lines; i++) {
        var base = (i + .5) / lines * h;
        ctx.beginPath();
        for (var x = 0; x <= w + step; x += step) {
          var u = x / w;
          var y = base
            + Math.sin(u * 4 + i * .35 + t * .12) * 18
            + Math.sin(u * 9 - i * .2 - t * .08) * 6;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(142, 166, 204, ' + (0.05 + 0.05 * Math.sin(i * .6 + t * .3)) + ')';
        ctx.stroke();
      }
    });
  }

  /* Banknote style guilloche rosette, drawn once and turned with CSS */
  function rosette(svg) {
    var ns = 'http://www.w3.org/2000/svg';
    function layer(cls, petals, R, amp, count, phaseStep) {
      var g = document.createElementNS(ns, 'g');
      g.setAttribute('class', cls);
      for (var j = 0; j < count; j++) {
        var d = '', ph = j * phaseStep;
        for (var s = 0; s <= 720; s++) {
          var th = s / 720 * TAU;
          var r = R + amp * Math.sin(petals * th + ph) + amp * .35 * Math.sin((petals * 2 + 1) * th - ph);
          d += (s ? 'L' : 'M') + (r * Math.cos(th)).toFixed(2) + ' ' + (r * Math.sin(th)).toFixed(2);
        }
        var p = document.createElementNS(ns, 'path');
        p.setAttribute('d', d + 'Z');
        g.appendChild(p);
      }
      svg.appendChild(g);
    }
    layer('ro ro-outer', 18, 160, 20, 12, TAU / 12 / 18);
    layer('ro ro-mid', 12, 110, 16, 10, TAU / 10 / 12);
    layer('ro ro-inner', 8, 60, 12, 8, TAU / 8 / 8);
  }

  var makers = { silk: silk, contour: contour, rosette: rosette };
  document.querySelectorAll('[data-loop]').forEach(function (el) {
    var fn = makers[el.dataset.loop];
    if (fn) fn(el);
  });
})();
