// La Dobrota — otočný 3D bochník sýra kreslený na <canvas> (bez knihoven).
// Bochník má vykrojený dílek, díry a zlatou linku jako v logu. Otáčí se tažením.

const TAU = Math.PI * 2;
const GOLD = '#F8E7B0';   // světlá zlatá linka, aby byla vidět i na žlutém sýru
const COL = { top: [233, 185, 73], side: [217, 154, 43], cut: [242, 214, 125], hole: [122, 86, 24] };

const R = 1;            // poloměr bochníku
const H = 0.56;         // výška bochníku
const GAP = 0.86;       // šířka dílku v radiánech (asi 49°)
const WEDGE_AT = Math.PI / 2; // směr dílku v modelu
const SEG = 56;         // počet plošek po obvodu

// Díry: t = úhel, r = vzdálenost od středu, s = velikost
const TOP_HOLES = [
  { t: 3.55, r: 0.52, s: 0.15 }, { t: 4.6, r: 0.6, s: 0.1 }, { t: 5.5, r: 0.5, s: 0.13 },
  { t: 2.7, r: 0.66, s: 0.09 }, { t: 0.45, r: 0.62, s: 0.11 }, { t: 4.2, r: 0.24, s: 0.07 },
];
const WEDGE_TOP_HOLES = [{ t: WEDGE_AT, r: 0.66, s: 0.1 }];
const SIDE_HOLES = [
  { t: 0.15, y: 0.02, s: 0.1 }, { t: 2.95, y: -0.05, s: 0.12 }, { t: 3.9, y: 0.06, s: 0.08 },
  { t: 4.75, y: -0.04, s: 0.11 }, { t: 5.6, y: 0.05, s: 0.09 },
];
const CUT_HOLES = [{ rr: 0.42, y: 0.02, s: 0.1 }, { rr: 0.74, y: -0.08, s: 0.07 }];

const shade = (rgb, k) => `rgb(${Math.round(rgb[0] * k)},${Math.round(rgb[1] * k)},${Math.round(rgb[2] * k)})`;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function createCheese(canvas, opts = {}) {
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const st = {
    yaw: reduce ? 0.55 : -2.4, yawTo: null, vel: 0, pitch: 0.62,
    wedge: reduce ? 0.16 : 0, wedgeTo: 0.16, wedgeVel: 0,
    zoom: reduce ? 1 : 0.7,
    dragging: false, lastX: 0, lastY: 0, moved: 0, idle: 0,
    w: 0, h: 0, dpr: 1, visible: true, dirty: true, t: performance.now(), intro: reduce ? 1 : 0,
  };
  if (!reduce) st.yawTo = 0.55;

  let sinY = 0, cosY = 1, sinP = 0, cosP = 1, scale = 1, cx = 0, cy = 0;

  // model -> obrazovka; vrací [x, y, hloubka]
  const proj = (x, y, z) => {
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;
    const y2 = y * cosP - z1 * sinP;
    const z2 = y * sinP + z1 * cosP;
    const p = 1 / (1 - z2 * 0.09);
    return [cx + x1 * scale * p, cy - y2 * scale * p, z2];
  };
  // otočení normály (jen směr k divákovi a osvětlení)
  const light = (nx, ny, nz) => {
    const x1 = nx * cosY + nz * sinY;
    const z1 = -nx * sinY + nz * cosY;
    const y2 = ny * cosP - z1 * sinP;
    const z2 = ny * sinP + z1 * cosP;
    const l = Math.max(0, x1 * -0.35 + y2 * 0.45 + z2 * 0.82);
    return { facing: z2, k: 0.62 + 0.38 * l };
  };

  const poly = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
  const line = (a, b) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };

  function drawHole(pts, k) {
    poly(pts); ctx.fillStyle = shade(COL.hole, k); ctx.fill();
    ctx.lineWidth = st.lw * 0.75; ctx.stroke(); ctx.lineWidth = st.lw;
  }

  // Jeden kus sýra: oblouk od a0 do a1, posunutý o (ox, oz)
  function drawPiece(a0, a1, ox, oz, topHoles, sideHoles, cutHoles) {
    const n = Math.max(4, Math.round(SEG * (a1 - a0) / TAU));
    const items = [];
    const P = (a, y) => proj(Math.cos(a) * R + ox, y, Math.sin(a) * R + oz);
    const C = (y) => proj(ox, y, oz);

    // obvodové plošky
    const vis = [];
    for (let i = 0; i < n; i++) {
      const b0 = a0 + (a1 - a0) * i / n, b1 = a0 + (a1 - a0) * (i + 1) / n, bm = (b0 + b1) / 2;
      const L = light(Math.cos(bm), 0, Math.sin(bm));
      vis.push(L.facing > 0);
      if (L.facing <= 0) continue;
      const q = [P(b0, H / 2), P(b1, H / 2), P(b1, -H / 2), P(b0, -H / 2)];
      items.push({ z: (q[0][2] + q[2][2]) / 2, draw: () => {
        const c = shade(COL.side, L.k);
        poly(q); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.stroke();
        ctx.strokeStyle = GOLD; ctx.lineWidth = st.lw; line(q[3], q[2]);
      }, i });
    }
    // svislé hrany na okraji viditelné části a na koncích oblouku
    for (let i = 0; i <= n; i++) {
      const left = i > 0 && vis[i - 1], right = i < n && vis[i];
      if (left === right && i !== 0 && i !== n) continue;
      if (!left && !right) continue;
      const b = a0 + (a1 - a0) * i / n;
      const e0 = P(b, H / 2), e1 = P(b, -H / 2);
      items.push({ z: (e0[2] + e1[2]) / 2 + 0.01, draw: () => { ctx.strokeStyle = GOLD; ctx.lineWidth = st.lw; line(e0, e1); } });
    }
    // díry na obvodu
    for (const hole of sideHoles) {
      if (hole.t < a0 + 0.14 || hole.t > a1 - 0.14) continue;
      const L = light(Math.cos(hole.t), 0, Math.sin(hole.t));
      if (L.facing <= 0.12) continue;
      const pts = [];
      for (let k = 0; k < 18; k++) { const u = TAU * k / 18; pts.push(P(hole.t + hole.s * Math.cos(u), hole.y + hole.s * Math.sin(u))); }
      items.push({ z: P(hole.t, hole.y)[2] + 0.02, draw: () => { ctx.strokeStyle = GOLD; drawHole(pts, L.k * 0.9); } });
    }
    // řezné plochy
    const cuts = [
      { a: a0, n: [Math.sin(a0), 0, -Math.cos(a0)] },
      { a: a1, n: [-Math.sin(a1), 0, Math.cos(a1)] },
    ];
    for (const cut of cuts) {
      const L = light(cut.n[0], cut.n[1], cut.n[2]);
      if (L.facing <= 0) continue;
      const q = [C(H / 2), P(cut.a, H / 2), P(cut.a, -H / 2), C(-H / 2)];
      const ux = Math.cos(cut.a), uz = Math.sin(cut.a);
      const holes = cutHoles.map((hole) => {
        const pts = [];
        for (let k = 0; k < 18; k++) {
          const u = TAU * k / 18, rr = hole.rr + hole.s * Math.cos(u);
          pts.push(proj(ux * rr + ox, hole.y + hole.s * Math.sin(u), uz * rr + oz));
        }
        return pts;
      });
      items.push({ z: (q[0][2] + q[2][2]) / 2 - 0.02, draw: () => {
        poly(q); ctx.fillStyle = shade(COL.cut, L.k); ctx.fill();
        ctx.strokeStyle = GOLD; ctx.lineWidth = st.lw; ctx.stroke();
        holes.forEach((pts) => drawHole(pts, L.k));
      } });
    }
    items.sort((p, q) => p.z - q.z).forEach((it) => it.draw());

    // horní plocha
    const top = [C(H / 2)];
    for (let i = 0; i <= n; i++) top.push(P(a0 + (a1 - a0) * i / n, H / 2));
    const LT = light(0, 1, 0);
    poly(top); ctx.fillStyle = shade(COL.top, LT.k); ctx.fill();
    ctx.strokeStyle = GOLD; ctx.lineWidth = st.lw; ctx.stroke();
    for (const hole of topHoles) {
      const pts = [];
      for (let k = 0; k < 20; k++) {
        const u = TAU * k / 20;
        pts.push(proj(Math.cos(hole.t) * hole.r + hole.s * Math.cos(u) + ox, H / 2, Math.sin(hole.t) * hole.r + hole.s * Math.sin(u) + oz));
      }
      drawHole(pts, LT.k * 0.92);
    }
  }

  function render() {
    const { w, h } = st;
    ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    sinY = Math.sin(st.yaw); cosY = Math.cos(st.yaw); sinP = Math.sin(st.pitch); cosP = Math.cos(st.pitch);
    scale = w * 0.325 * st.zoom; cx = w / 2; cy = h * 0.53;
    st.lw = Math.max(2, w * 0.0052);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';

    const ox = Math.cos(WEDGE_AT) * st.wedge, oz = Math.sin(WEDGE_AT) * st.wedge;
    const wheel = () => drawPiece(WEDGE_AT + GAP / 2, WEDGE_AT + TAU - GAP / 2, 0, 0, TOP_HOLES, SIDE_HOLES, CUT_HOLES);
    const wedge = () => drawPiece(WEDGE_AT - GAP / 2, WEDGE_AT + GAP / 2, ox, oz, WEDGE_TOP_HOLES, [], CUT_HOLES);
    // dílek směřuje k divákovi -> kreslí se navrch
    const wedgeDepth = proj(Math.cos(WEDGE_AT), 0, Math.sin(WEDGE_AT))[2];
    if (wedgeDepth > 0) { wheel(); wedge(); } else { wedge(); wheel(); }

    if (opts.onFrame) opts.onFrame(api);
  }

  function step(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - st.t) / 1000); st.t = now;
    let moving = st.dirty; st.dirty = false;

    if (st.intro < 1) { st.intro = Math.min(1, st.intro + dt / 1.5); st.zoom = 0.7 + 0.3 * (1 - Math.pow(1 - st.intro, 3)); moving = true; }
    if (st.yawTo !== null && !st.dragging) {
      const d = st.yawTo - st.yaw;
      if (Math.abs(d) < 0.002) { st.yaw = st.yawTo; st.yawTo = null; st.idle = 0; } else st.yaw += d * Math.min(1, dt * 3.2);
      moving = true;
    } else if (!st.dragging) {
      if (Math.abs(st.vel) > 0.01) { st.yaw += st.vel * dt; st.vel *= Math.pow(0.04, dt); moving = true; } else {
        st.vel = 0; st.idle += dt;
        if (!reduce && st.idle > 2.5) { st.yaw += 0.16 * dt; moving = true; }
      }
    }
    // pružina dílku
    const dw = st.wedgeTo - st.wedge;
    if (Math.abs(dw) > 0.0008 || Math.abs(st.wedgeVel) > 0.0008) {
      st.wedgeVel += (dw * 90 - st.wedgeVel * 13) * dt; st.wedge += st.wedgeVel * dt; moving = true;
    }
    if (moving) render();
    if (st.visible && !document.hidden) raf = requestAnimationFrame(step);
  }
  let raf = 0;
  const kick = () => { st.dirty = true; if (!raf && st.visible && !document.hidden) { st.t = performance.now(); raf = requestAnimationFrame(step); } };

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    st.dpr = Math.min(2, window.devicePixelRatio || 1);
    st.w = r.width; st.h = r.height;
    canvas.width = Math.round(r.width * st.dpr); canvas.height = Math.round(r.height * st.dpr);
    kick();
  }

  const host = opts.host || canvas;
  const down = (e) => {
    if (e.target.closest && e.target.closest('button')) return;
    st.dragging = true; st.moved = 0; st.lastX = e.clientX; st.lastY = e.clientY; st.vel = 0; st.yawTo = null; st.idle = 0;
    host.classList.add('is-dragging');
    try { host.setPointerCapture(e.pointerId); } catch (err) { /* starší prohlížeče */ }
    kick();
  };
  const move = (e) => {
    if (!st.dragging) return;
    const dx = e.clientX - st.lastX, dy = e.clientY - st.lastY;
    st.lastX = e.clientX; st.lastY = e.clientY; st.moved += Math.abs(dx) + Math.abs(dy);
    const k = 3.4 / Math.max(200, st.w);
    st.yaw += dx * k; st.vel = dx * k * 60;
    if (e.pointerType === 'mouse') st.pitch = clamp(st.pitch + dy * k * 0.5, 0.3, 1.05);
    kick();
  };
  const up = () => {
    if (!st.dragging) return;
    st.dragging = false; host.classList.remove('is-dragging'); st.idle = 0;
    if (st.moved < 6) api.toggleWedge();
    kick();
  };
  host.addEventListener('pointerdown', down);
  host.addEventListener('pointermove', move);
  host.addEventListener('pointerup', up);
  host.addEventListener('pointercancel', () => { st.dragging = false; host.classList.remove('is-dragging'); });
  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { st.yaw -= 0.2; st.idle = 0; st.yawTo = null; kick(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { st.yaw += 0.2; st.idle = 0; st.yawTo = null; kick(); e.preventDefault(); }
    if (e.key === 'Enter' || e.key === ' ') { api.toggleWedge(); e.preventDefault(); }
  });

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver((en) => { st.visible = en[0].isIntersecting; if (st.visible) kick(); }).observe(canvas);
  document.addEventListener('visibilitychange', kick);

  const api = {
    // poloha bodu na sýru na obrazovce; where: 'top' | 'side' | 'wedge'
    spot(where, a, b) {
      if (where === 'top') { const p = proj(Math.cos(a) * b, H / 2, Math.sin(a) * b); return { x: p[0], y: p[1], visible: true }; }
      if (where === 'wedge') {
        const p = proj(Math.cos(WEDGE_AT) * (b + st.wedge), H / 2, Math.sin(WEDGE_AT) * (b + st.wedge));
        return { x: p[0], y: p[1], visible: true };
      }
      const p = proj(Math.cos(a) * R, b, Math.sin(a) * R);
      return { x: p[0], y: p[1], visible: light(Math.cos(a), 0, Math.sin(a)).facing > 0.25 };
    },
    // natočí bochník tak, aby úhel a mířil k divákovi
    face(a) {
      let target = a - Math.PI / 2;
      while (target - st.yaw > Math.PI) target -= TAU;
      while (target - st.yaw < -Math.PI) target += TAU;
      st.yawTo = target; st.vel = 0; kick();
    },
    toggleWedge() { api.setWedge(st.wedgeTo < 0.3); },
    setWedge(open) { st.wedgeTo = open ? 0.5 : 0.16; if (opts.onWedge) opts.onWedge(open); kick(); },
    get wedgeOpen() { return st.wedgeTo > 0.3; },
    WEDGE_AT,
  };
  resize();
  return api;
}
