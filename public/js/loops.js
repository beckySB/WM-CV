/* Looping visuals: trichome macro, silk ribbons, contour lines and an engraved rosette.
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
        ctx.strokeStyle = (i % 5 === 0 ? 'rgba(209, 167, 81, ' : 'rgba(122, 139, 120, ') + (0.07 + 0.05 * Math.sin(i * .6 + t * .3)) + ')';
        ctx.stroke();
      }
    });
  }


  /* Macro trichome field: glassy glands on fine stalks, icy blue with amber */
  function trichome(canvas) {
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    var glands = [], bokeh = [];
    for (var i = 0; i < 30; i++) {
      var z = rnd();
      glands.push({
        x: rnd(), y: rnd(), z: z,
        r: 3 + z * 12, stalk: 40 + z * 110, lean: (rnd() - .5) * .5,
        amber: rnd() < .22, ph: rnd() * TAU, sp: .15 + rnd() * .25
      });
    }
    for (var j = 0; j < 14; j++) bokeh.push({ x: rnd(), y: rnd(), r: 30 + rnd() * 90, ph: rnd() * TAU, amber: rnd() < .3 });
    glands.sort(function (a, b) { return a.z - b.z; });

    canvasLoop(canvas, function (ctx, w, h, t) {
      bokeh.forEach(function (b) {
        var x = b.x * w + Math.sin(t * .05 + b.ph) * 30, y = b.y * h + Math.cos(t * .04 + b.ph) * 20;
        var g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
        var c = b.amber ? '209, 167, 81' : '111, 149, 173';
        g.addColorStop(0, 'rgba(' + c + ', .10)'); g.addColorStop(1, 'rgba(' + c + ', 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, b.r, 0, TAU); ctx.fill();
      });
      glands.forEach(function (d) {
        var drift = ((d.y - t * .006 * (0.4 + d.z)) % 1 + 1) % 1;
        var bx = d.x * w + Math.sin(t * d.sp + d.ph) * 6;
        var by = drift * (h + 200) - 100 + d.stalk;
        var sway = d.lean + Math.sin(t * d.sp * 1.3 + d.ph) * .08;
        var hx = bx + Math.sin(sway) * d.stalk, hy = by - Math.cos(sway) * d.stalk;
        var a = .18 + d.z * .5;
        // stalk
        ctx.strokeStyle = 'rgba(207, 224, 234, ' + (a * .45) + ')';
        ctx.lineWidth = .4 + d.z * .9;
        ctx.beginPath(); ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + Math.sin(sway) * d.stalk * .4, by - d.stalk * .55, hx, hy); ctx.stroke();
        // glassy head
        var r = d.r * (1 + Math.sin(t * .6 + d.ph) * .03);
        var g = ctx.createRadialGradient(hx - r * .35, hy - r * .35, r * .05, hx, hy, r);
        if (d.amber) {
          g.addColorStop(0, 'rgba(255, 244, 214, ' + a + ')');
          g.addColorStop(.45, 'rgba(209, 167, 81, ' + (a * .7) + ')');
          g.addColorStop(1, 'rgba(120, 82, 30, ' + (a * .15) + ')');
        } else {
          g.addColorStop(0, 'rgba(245, 250, 255, ' + a + ')');
          g.addColorStop(.45, 'rgba(160, 196, 218, ' + (a * .55) + ')');
          g.addColorStop(1, 'rgba(58, 106, 135, ' + (a * .12) + ')');
        }
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, r, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(245, 243, 237, ' + (a * .35) + ')'; ctx.lineWidth = .7;
        ctx.stroke();
        // specular glint
        var gl = .5 + .5 * Math.sin(t * 1.1 + d.ph * 3);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (a * .8 * gl) + ')';
        ctx.beginPath(); ctx.arc(hx - r * .38, hy - r * .4, Math.max(.8, r * .14), 0, TAU); ctx.fill();
      });
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

  var makers = { trichome: trichome, silk: silk, contour: contour, rosette: rosette };
  document.querySelectorAll('[data-loop]').forEach(function (el) {
    var fn = makers[el.dataset.loop];
    if (fn) fn(el);
  });
})();
