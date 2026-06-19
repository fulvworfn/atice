/**
 * Fondo de campo de estrellas animado.
 *
 * Es una versión optimizada del script original:
 *  - Pausa el `requestAnimationFrame` cuando la pestaña no está visible
 *    (ahorra batería/CPU cuando el usuario cambia de pestaña).
 *  - Respeta `prefers-reduced-motion`: si el usuario lo activa, se
 *    dibuja un campo de estrellas estático (sin animación) en vez de
 *    quemar CPU innecesariamente.
 *  - Limita el `devicePixelRatio` a 2 para no generar canvases gigantes
 *    en pantallas con DPR muy alto (ej. 3x), que son muy costosos de
 *    rasterizar sin aportar diferencia visual perceptible.
 *  - Expone una función `stop()` para remover listeners y cancelar el
 *    loop de animación (útil en HMR / desmontaje).
 */

interface Star {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  phase: number;
  freq: number;
  ampli: number;
  cr: number;
  cg: number;
  cb: number;
  ca: number;
  glow: boolean;
}

const PALETTES = [
  { r: 248, g: 237, b: 228, a: 0.55 }, // warm white
  { r: 224, g: 122, b: 92, a: 0.35 }, // accent orange
  { r: 194, g: 74, b: 42, a: 0.25 }, // accent2 ember
  { r: 255, g: 210, b: 180, a: 0.4 }, // peach glow
  { r: 180, g: 140, b: 120, a: 0.3 }, // muted rose
];

const MAX_STARS = 220;
const MAX_DPR = 2;

export function startStarField(): () => void {
  const canvas = document.getElementById("star-canvas") as HTMLCanvasElement | null;
  if (!canvas) return () => {};

  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0;
  let H = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  let stars: Star[] = [];
  let rafId = 0;
  let running = true;

  function makeStar(forceRandom: boolean): Star {
    const pal = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    return {
      x: Math.random() * (W / dpr),
      y: forceRandom ? Math.random() * (H / dpr) : -4,
      r:
        Math.random() < 0.08
          ? Math.random() * 1.4 + 0.9 // 8% grandes
          : Math.random() < 0.35
          ? Math.random() * 0.7 + 0.55 // 35% medianas
          : Math.random() * 0.45 + 0.2, // resto pequeñas
      vy: Math.random() * 0.18 + 0.04,
      vx: (Math.random() - 0.5) * 0.04,
      phase: Math.random() * Math.PI * 2,
      freq: Math.random() * 0.012 + 0.004,
      ampli: Math.random() * 0.5 + 0.2,
      cr: pal.r,
      cg: pal.g,
      cb: pal.b,
      ca: pal.a,
      glow: Math.random() < 0.06,
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    W = canvas!.width = window.innerWidth * dpr;
    H = canvas!.height = window.innerHeight * dpr;
    canvas!.style.width = window.innerWidth + "px";
    canvas!.style.height = window.innerHeight + "px";
    ctx!.setTransform(1, 0, 0, 1, 0, 0);
    ctx!.scale(dpr, dpr);

    const count = Math.floor((window.innerWidth * window.innerHeight) / 5200);
    stars = Array.from({ length: Math.min(count, MAX_STARS) }, () => makeStar(true));
  }

  function drawStar(s: Star, t: number) {
    const twinkle = reduceMotion ? 1 : 1 + Math.sin(t * s.freq + s.phase) * s.ampli;
    const alpha = Math.min(1, s.ca * twinkle);
    const radius = s.r * (0.85 + 0.15 * twinkle);

    ctx!.save();

    if (s.glow) {
      const g = ctx!.createRadialGradient(s.x, s.y, 0, s.x, s.y, radius * 5.5);
      g.addColorStop(0, `rgba(${s.cr},${s.cg},${s.cb},${(alpha * 0.45).toFixed(3)})`);
      g.addColorStop(0.4, `rgba(${s.cr},${s.cg},${s.cb},${(alpha * 0.12).toFixed(3)})`);
      g.addColorStop(1, `rgba(${s.cr},${s.cg},${s.cb},0)`);
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(s.x, s.y, radius * 5.5, 0, Math.PI * 2);
      ctx!.fill();
    }

    ctx!.fillStyle = `rgba(${s.cr},${s.cg},${s.cb},${alpha.toFixed(3)})`;
    ctx!.beginPath();
    ctx!.arc(s.x, s.y, radius, 0, Math.PI * 2);
    ctx!.fill();

    if (s.r > 0.85 && s.glow) {
      const len = radius * 3.5;
      ctx!.strokeStyle = `rgba(${s.cr},${s.cg},${s.cb},${(alpha * 0.35).toFixed(3)})`;
      ctx!.lineWidth = 0.5;
      ctx!.beginPath();
      ctx!.moveTo(s.x - len, s.y);
      ctx!.lineTo(s.x + len, s.y);
      ctx!.moveTo(s.x, s.y - len);
      ctx!.lineTo(s.x, s.y + len);
      ctx!.stroke();
    }

    ctx!.restore();
  }

  let t = 0;
  function loop() {
    if (!running) return;
    ctx!.clearRect(0, 0, W / dpr, H / dpr);

    t++;
    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      if (!reduceMotion) {
        s.y += s.vy;
        s.x += s.vx;

        if (s.y > H / dpr + 4 || s.x < -10 || s.x > W / dpr + 10) {
          stars[i] = makeStar(false);
          stars[i].y = -4;
          stars[i].x = Math.random() * (W / dpr);
        }
      }
      drawStar(s, t);
    }

    if (!reduceMotion) {
      rafId = requestAnimationFrame(loop);
    }
  }

  function handleResize() {
    resize();
  }

  function handleVisibility() {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(rafId);
    } else {
      running = true;
      if (!reduceMotion) rafId = requestAnimationFrame(loop);
      else loop();
    }
  }

  resize();
  loop();

  window.addEventListener("resize", handleResize);
  document.addEventListener("visibilitychange", handleVisibility);

  return function stop() {
    running = false;
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}
