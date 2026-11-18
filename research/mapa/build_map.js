// Build a simplified Europe map (SVG paths) from Natural Earth data (world-atlas, public domain).
const fs = require('fs');
const path = require('path');
const topojson = require('topojson-client');

(async () => {
  const { geoAzimuthalEqualArea } = await import('d3-geo');
  const out = process.argv[2];
  const W = 800, H = 780;
  const world = JSON.parse(fs.readFileSync(path.join(__dirname, 'node_modules/world-atlas/countries-50m.json'), 'utf8'));
  const countries = topojson.feature(world, world.objects.countries).features;

  const projection = geoAzimuthalEqualArea().rotate([-11, -53]);
  projection.fitExtent([[14, 14], [W - 14, H - 14]], {
    type: 'MultiPoint',
    coordinates: [[-10, 35.4], [-5.6, 35.4], [15.5, 35.6], [27, 35.4], [-11, 58], [30, 58], [4, 71.4], [28, 71.4]],
  });

  // Douglas-Peucker on projected points
  const simplify = (pts, tol) => {
    if (pts.length < 4) return pts;
    const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
    let far = 0, fd = -1;
    for (let i = 1; i < pts.length - 1; i++) { const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]); if (d > fd) { fd = d; far = i; } }
    keep[far] = 1;
    const stack = [[0, far], [far, pts.length - 1]];
    while (stack.length) {
      const [a, b] = stack.pop();
      let max = 0, idx = -1;
      const [ax, ay] = pts[a], [bx, by] = pts[b];
      const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1e-9;
      for (let i = a + 1; i < b; i++) {
        const d = Math.abs(dy * (pts[i][0] - ax) - dx * (pts[i][1] - ay)) / len;
        if (d > max) { max = d; idx = i; }
      }
      if (max > tol && idx > 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
    }
    return pts.filter((_, i) => keep[i]);
  };

  const ringPath = (ring, tol, minArea) => {
    let pts = ring.map((c) => projection(c));
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    if (x1 < -40 || x0 > W + 40 || y1 < -40 || y0 > H + 40) return '';       // fully outside
    if ((x1 - x0) * (y1 - y0) < minArea) return '';                          // tiny islands
    pts = simplify(pts, tol);
    if (pts.length < 4) return '';
    return 'M' + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L') + 'Z';
  };

  const featurePath = (f, tol, minArea) => {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    return polys.map((poly) => poly.map((r) => ringPath(r, tol, minArea)).join('')).join('');
  };

  const pick = {
    528: { key: 'nl', name: 'Holandsko', at: [5.6, 52.3] },
    826: { key: 'gb', name: 'Velká Británie', at: [-1.6, 52.8] },
    756: { key: 'ch', name: 'Švýcarsko', at: [8.2, 46.8] },
    250: { key: 'fr', name: 'Francie', at: [2.6, 46.8] },
    578: { key: 'no', name: 'Norsko', at: [8.8, 61.2] },
    203: { key: 'cz', name: 'Česká republika', at: [15.4, 49.8] },
    380: { key: 'it', name: 'Itálie', at: [12.4, 43.0] },
    724: { key: 'es', name: 'Španělsko', at: [-3.6, 40.2] },
  };

  let land = '';
  const chosen = [];
  for (const f of countries) {
    const id = +f.id;
    if (pick[id]) {
      const d = featurePath(f, 0.7, 8);
      const [x, y] = projection(pick[id].at);
      chosen.push({ ...pick[id], d, x: +(x / W * 100).toFixed(2), y: +(y / H * 100).toFixed(2) });
      delete chosen[chosen.length - 1].at;
    } else {
      land += featurePath(f, 1.1, 30);
    }
  }
  const order = ['nl', 'fr', 'ch', 'gb', 'no', 'cz', 'it', 'es'];
  chosen.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  const data = { width: W, height: H, land, countries: chosen };
  fs.writeFileSync(path.join(out, 'europa.json'), JSON.stringify(data));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mapa Evropy se zeměmi původu sýrů La Dobrota">`
    + `<path d="${land}" fill="#1E1810" stroke="#060504" stroke-width="1"/>`
    + chosen.map((c) => `<path id="${c.key}" d="${c.d}" fill="#D0AE56" stroke="#060504" stroke-width="1"><title>${c.name}</title></path>`).join('')
    + `</svg>\n`;
  fs.writeFileSync(path.join(out, 'europa.svg'), svg);
  fs.writeFileSync(path.join(out, 'europa-land.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><path d="${land}" fill="#1E1810" stroke="#060504" stroke-width="1"/></svg>\n`);
  console.log('land', land.length, 'bytes;', chosen.map((c) => `${c.key}:${c.d.length} @${c.x},${c.y}`).join(' '));
})();
