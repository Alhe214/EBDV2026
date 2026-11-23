(function () {
  var E = window.EBDV, H = 36e5, DAY = 24 * H;
  var T0 = new Date(E.inicio).getTime();
  var WEEK_START = T0 - 14 * H;                 // lunes 00:00 (Guatemala)
  var WEEK_END = WEEK_START + 7 * DAY;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var fmt = new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'long', timeZone: 'America/Guatemala' });
  var fecha = function (i) { return fmt.format(new Date(WEEK_START + i * DAY + 12 * H)); };
  var pad = function (n) { return String(n).padStart(2, '0'); };

  function estado(i) {
    var now = Date.now(), s = WEEK_START + i * DAY;
    if (now < s) { var d = Math.ceil((s - now) / DAY); return { t: d === 1 ? 'Mañana' : 'En ' + d + ' días', k: 'futuro' }; }
    if (now < s + DAY) return { t: '¡Es hoy!', k: 'hoy' };
    return { t: 'Completado ✓', k: 'pasado' };
  }

  /* Enlaces de WhatsApp y textos globales */
  var msg = encodeURIComponent('Hola, quiero más información sobre la EBDV 2026');
  $$('[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + E.whatsapp + '?text=' + msg; a.target = '_blank'; a.rel = 'noopener'; });
  $$('[data-iglesia]').forEach(function (e) { e.textContent = E.iglesia; });
  $$('[data-lugar]').forEach(function (e) { e.textContent = E.lugar; });

  /* Tarjetas de los días (portada) */
  var grid = $('#dias-grid');
  if (grid) {
    grid.innerHTML = E.dias.map(function (d, i) {
      var st = estado(i);
      return '<a class="dcard rv ' + (d.dark ? 'dark ' : '') + st.k + '" style="--dia:var(--' + d.c + ');--delay:' + i * 60 + 'ms" href="dias/' + d.f + '.html">' +
        '<span class="dnum">' + pad(i + 1) + '</span><span class="chip">' + st.t + '</span>' +
        '<h3>' + d.n + '</h3><p class="dfecha">' + fecha(i) + '</p><p class="dtema">' + d.tema + '</p><span class="ver">Ver día →</span></a>';
    }).join('');
  }

  /* Página de un día */
  var di = document.body.getAttribute('data-dia');
  if (di !== null) {
    var i = +di, d = E.dias[i], st = estado(i);
    document.body.style.setProperty('--dia', 'var(--' + d.c + ')');
    var set = function (id, v) { var e = $(id); if (e) e.textContent = v; };
    set('#d-num', d.n + ' · ' + (i === 6 ? 'Clausura' : 'Día ' + (i + 1) + ' de 7'));
    set('#d-fecha', fecha(i) + ' · ' + E.horaTexto);
    set('#d-tema', d.tema); set('#d-verso', d.verso); set('#d-chip', st.t);
    if (d.dark) $('.dia-hero').classList.add('dark');
    $('#dots').innerHTML = E.dias.map(function (x, j) {
      return '<a href="' + x.f + '.html" style="background:var(--' + x.c + ')" title="' + x.n + '"' + (j === i ? ' class="on" aria-current="page"' : '') + '><span class="sr">' + x.n + '</span></a>';
    }).join('');
    var p = E.dias[i - 1], n = E.dias[i + 1];
    $('#prev').innerHTML = p ? '<a href="' + p.f + '.html">← ' + p.n + '</a>' : '<a href="../index.html">← Inicio</a>';
    $('#next').innerHTML = n ? '<a href="' + n.f + '.html">' + n.n + ' →</a>' : '<a href="../index.html">Volver al inicio ✦</a>';
  }

  /* Cuenta regresiva */
  var cd = $('#cd');
  if (cd) {
    var box = function (u) { return $('[data-u="' + u + '"]', cd); };
    var tick = function () {
      var now = Date.now(), diff = T0 - now, m = $('#cd-msg');
      if (diff > 0) {
        var v = { d: Math.floor(diff / DAY), h: Math.floor(diff % DAY / H), m: Math.floor(diff % H / 6e4), s: Math.floor(diff % 6e4 / 1e3) };
        for (var k in v) { var b = box(k), t = k === 'd' ? v[k] : pad(v[k]); if (b.textContent !== String(t)) { b.textContent = t; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); } }
        m.textContent = 'para que comience la aventura 🎨';
      } else {
        cd.classList.add('fin');
        m.textContent = now < WEEK_END ? '🎉 ¡La EBDV está en marcha! Te esperamos hoy a las ' + E.horaTexto : '💛 ¡Gracias por ser parte de la EBDV 2026!';
      }
    };
    tick(); setInterval(tick, 1000);
  }

  /* Agregar al calendario (.ics) */
  var ics = $('#btn-ics');
  if (ics) ics.addEventListener('click', function () {
    var z = function (t) { return new Date(t).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'; };
    var txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//EBDV 2026//ES', 'BEGIN:VEVENT', 'UID:ebdv2026@iglesia', 'DTSTAMP:' + z(Date.now()),
      'DTSTART:' + z(T0), 'DTEND:' + z(T0 + 3 * H), 'RRULE:FREQ=DAILY;COUNT=7',
      'SUMMARY:EBDV 2026 · Creados por el mejor artista', 'DESCRIPTION:Mi identidad en Cristo', 'LOCATION:' + E.lugar, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/calendar' })); a.download = 'EBDV-2026.ics'; a.click();
  });

  /* Contadores animados */
  var count = function (el) {
    var end = +el.getAttribute('data-count'), t0 = performance.now();
    (function f(t) { var p = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
  };

  /* Aparecer al hacer scroll */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.hasAttribute('data-count')) count(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: .15 });
  $$('.rv, [data-count]').forEach(function (e) { io.observe(e); });

  /* Barra de progreso */
  var bar = $('#progress');
  addEventListener('scroll', function () {
    var h = document.documentElement; bar.style.transform = 'scaleX(' + (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) + ')';
  }, { passive: true });

  /* Galería ampliada */
  var lb = $('#lb');
  if (lb) {
    $$('.gallery img').forEach(function (im) { im.addEventListener('click', function () { $('img', lb).src = im.src; $('img', lb).alt = im.alt; lb.showModal(); }); });
    lb.addEventListener('click', function () { lb.close(); });
  }
})();
