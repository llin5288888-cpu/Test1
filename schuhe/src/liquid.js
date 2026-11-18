// Schwimmender Farbhintergrund hinter der ganzen Seite.
// Ruhezustand: große, weiche Farbflecken treiben langsam umher.
// Farbwechsel: Die neue Farbe läuft wie eine Flüssigkeit mit welligem Rand
// von der Farbauswahl aus über den ganzen Bildschirm, mit kleinen Tropfen davor.

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function createLiquid(canvas, theme, reduced) {
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, scale = 1;
  let world = theme.page;
  let flood = null; // { page, x, y, start, dur, maxR, drops }
  const DUR = 1500; // Farbflut läuft immer gleich ab (auch bei „Bewegung reduzieren“), wie gewünscht

  // Feste Bahnen für die Farbflecken: jede mit eigenem Tempo und eigener Größe
  const blobs = Array.from({ length: 6 }, (_, i) => ({
    ax: 0.18 + ((i * 37) % 23) / 70, ay: 0.2 + ((i * 53) % 29) / 80,
    fx: 0.031 + i * 0.0137, fy: 0.027 + ((i * 7) % 5) * 0.011,
    px: i * 1.7, py: i * 2.3,
    cx: [0.75, 0.2, 0.55, 0.9, 0.3, 0.62][i], cy: [0.3, 0.7, 0.15, 0.8, 0.25, 0.6][i],
    r: [0.55, 0.48, 0.42, 0.5, 0.36, 0.4][i],
    c: i % 3,
  }));

  function resize() {
    scale = Math.min(devicePixelRatio || 1, 1.5) * 0.6; // weiche Flächen brauchen keine volle Auflösung
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * scale);
    canvas.height = Math.round(H * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }
  resize();
  addEventListener("resize", resize);

  function drawWorld(page, t) {
    ctx.fillStyle = page.bg;
    ctx.fillRect(0, 0, W, H);
    const m = Math.max(W, H);
    for (const b of blobs) {
      const x = (b.cx + Math.sin(t * b.fx + b.px) * b.ax) * W;
      const y = (b.cy + Math.cos(t * b.fy + b.py) * b.ay) * H;
      const r = b.r * m * (1 + Math.sin(t * 0.05 + b.px) * 0.12);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, hexA(page.blobs[b.c], 0.75));
      g.addColorStop(0.55, hexA(page.blobs[b.c], 0.28));
      g.addColorStop(1, hexA(page.blobs[b.c], 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function floodPath(f, k, t) {
    const R = f.maxR * k;
    ctx.beginPath();
    const N = 120;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      // Welliger Rand: mehrere Sinuswellen, die mit der Zeit wandern
      const wob = 1 + 0.07 * Math.sin(a * 5 + t * 2.1 + f.seed) + 0.045 * Math.sin(a * 9 - t * 3.3) + 0.03 * Math.sin(a * 14 + t * 4.7);
      const rr = R * wob;
      const x = f.x + Math.cos(a) * rr, y = f.y + Math.sin(a) * rr;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
    // Tropfen, die vor dem Rand herlaufen und eingeholt werden
    for (const d of f.drops) {
      const dr = R * (1 + d.lead * (1 - k)) + d.off;
      const x = f.x + Math.cos(d.a) * dr, y = f.y + Math.sin(d.a) * dr;
      const s = Math.max(0, d.size * Math.min(1, k * 4) * (1 - k * 0.6) * Math.max(W, H));
      ctx.moveTo(x + s, y);
      ctx.arc(x, y, s, 0, Math.PI * 2);
    }
  }

  function frame(now) {
    requestAnimationFrame(frame); // zuerst: ein Fehler beim Zeichnen darf die Animation nie anhalten
    if (document.documentElement.dataset.pdp) return; // Produktseite deckt alles ab
    const t = now / 1000;
    if (flood) {
      const k = Math.min(1, Math.max(0, (now - flood.start) / DUR)); // rAF-Zeit kann knapp vor dem Klick liegen
      const e = easeInOut(k);
      drawWorld(world, t);
      ctx.save();
      floodPath(flood, e, t);
      ctx.clip();
      drawWorld(flood.page, t);
      ctx.restore();
      if (k >= 1) { world = flood.page; flood = null; }
    } else {
      drawWorld(world, t);
    }
  }
  requestAnimationFrame(frame);

  return {
    pour(theme, x, y) {
      if (flood) world = flood.page; // laufenden Wechsel abschließen
      const far = Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y));
      flood = {
        page: theme.page, x, y, start: performance.now(), maxR: far * 1.25, seed: Math.random() * 10,
        drops: Array.from({ length: 9 }, () => ({
          a: Math.random() * Math.PI * 2, lead: 0.1 + Math.random() * 0.25, off: Math.random() * 20,
          size: 0.008 + Math.random() * 0.018,
        })),
      };
    },
  };
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
