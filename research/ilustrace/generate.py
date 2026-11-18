"""Generate the 16 La Dobrota cheese illustrations: gold line art with tinted fills, one shared style."""
import math
import random
import sys

GOLD = "#D0AE56"
SW = 3.2
OUT = sys.argv[1]
ALPHA = float(sys.argv[2]) if len(sys.argv) > 2 else 0.42

# tints
PALE = "#F4E3A1"; YELLOW = "#EFC65A"; AMBER = "#E39A32"; ORANGE = "#EE9A3A"; IVORY = "#F7F0DC"
WHITE = "#FFFFFF"; CARAMEL = "#B5682A"; SMOKE = "#9A5B26"; WAX = "#9E2F25"; BARK = "#6B4A2A"
WALNUT = "#8C5A2E"; PISTA = "#9DB85C"; TRUFFLE = "#2A2019"; HONEY = "#F2A91E"
OLIVE = "#6E8A4E"; GOUDA = "#F0B03A"; STRAW = "#E9D48A"; GOAT = "#FBF4DF"
BASE = {WHITE: 0.95, IVORY: 0.9, WAX: 0.85, BARK: 0.9, OLIVE: 0.85}


def f(color, a=None, m=1.0):
    base = BASE.get(color, ALPHA) if a is None else a
    return f'fill="{color}" fill-opacity="{min(1.0, base * m):.2f}"'


def stroke(w=SW):
    return f'stroke="{GOLD}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"'


def pt(cx, cy, rx, ry, deg):
    r = math.radians(deg)
    return cx + rx * math.cos(r), cy + ry * math.sin(r)


def P(p):
    return f"{p[0]:.1f} {p[1]:.1f}"


def hole(x, y, rx, ry, rot=0, color="#060504", a=0.55):
    return f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" transform="rotate({rot} {x:.1f} {y:.1f})" {f(color, a)} {stroke(2.4)}/>'


def blob(x, y, r, color, seed, a=0.95, sw=1.6):
    rnd = random.Random(seed)
    pts = []
    n = 7
    for i in range(n):
        ang = 2 * math.pi * i / n
        rr = r * (0.72 + 0.5 * rnd.random())
        pts.append((x + rr * math.cos(ang), y + rr * 0.8 * math.sin(ang)))
    d = "M " + P(pts[0]) + " " + " ".join("L " + P(p) for p in pts[1:]) + " Z"
    return f'<path d="{d}" {f(color, a)} {stroke(sw)}/>'


def dot(x, y, r, color, a=0.95):
    return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{color}" fill-opacity="{a}"/>'


def wheel_cut(paste, rind, top=None, h=46, rx=92, ry=36, cy=62, a1=52, a2=112, top_holes=(), face_holes=(), extra_side="", extra_top="", rind_a=None):
    cx = 120
    top = top or paste
    C = (cx, cy)
    P1, P2 = pt(cx, cy, rx, ry, a1), pt(cx, cy, rx, ry, a2)
    L, R = pt(cx, cy, rx, ry, 180), pt(cx, cy, rx, ry, 0)
    dn = lambda p: (p[0], p[1] + h)
    s = []
    # side: left part and right part
    s.append(f'<path d="M {P(L)} L {P(dn(L))} A {rx} {ry} 0 0 0 {P(dn(P2))} L {P(P2)} A {rx} {ry} 0 0 1 {P(L)} Z" {f(rind, rind_a)} {stroke()}/>')
    s.append(f'<path d="M {P(R)} L {P(dn(R))} A {rx} {ry} 0 0 1 {P(dn(P1))} L {P(P1)} A {rx} {ry} 0 0 0 {P(R)} Z" {f(rind, rind_a)} {stroke()}/>')
    s.append(extra_side)
    # inner cut faces
    s.append(f'<path d="M {P(C)} L {P(P2)} L {P(dn(P2))} L {P(dn(C))} Z" {f(paste, m=0.8)} {stroke()}/>')
    s.append(f'<path d="M {P(C)} L {P(P1)} L {P(dn(P1))} L {P(dn(C))} Z" {f(paste, m=1.15)} {stroke()}/>')
    for hx, hy, hr in face_holes:
        s.append(hole(hx, hy, hr, hr * 1.15))
    # top
    s.append(f'<path d="M {P(P1)} A {rx} {ry} 0 1 0 {P(P2)} L {P(C)} Z" {f(top)} {stroke()}/>')
    for hx, hy, hr in top_holes:
        s.append(hole(hx, hy, hr, hr * 0.5))
    s.append(extra_top)
    return "".join(s)


WA, WR1, WR2, WQ, WH = (36, 90), (172, 42), (212, 96), (220, 56), 46


def wedge(paste, rind, top=None, extra_top="", extra_face="", rind_a=None):
    A, R1, R2, Q, h = WA, WR1, WR2, WQ, WH
    dn = lambda p: (p[0], p[1] + h)
    top = top or paste
    s = []
    s.append(f'<path d="M {P(R1)} Q {P(Q)} {P(R2)} L {P(dn(R2))} Q {P(dn(Q))} {P(dn(R1))} Z" {f(rind, rind_a)} {stroke()}/>')
    s.append(f'<path d="M {P(A)} L {P(R1)} Q {P(Q)} {P(R2)} Z" {f(top)} {stroke()}/>')
    s.append(extra_top)
    s.append(f'<path d="M {P(A)} L {P(R2)} L {P(dn(R2))} L {P(dn(A))} Z" {f(paste, m=1.15)} {stroke()}/>')
    s.append(extra_face)
    return "".join(s)


def face_pt(u, v):
    """Point on the wedge's front cut face: u along A->R2 (0..1), v down (0..1)."""
    x = WA[0] + (WR2[0] - WA[0]) * u
    y = WA[1] + (WR2[1] - WA[1]) * u + WH * v
    return x, y


def top_pt(u, v):
    """Point on the wedge's top face: u from apex to rim, v across (0 = back edge, 1 = front edge)."""
    bx = WR1[0] + (WR2[0] - WR1[0]) * v
    by = WR1[1] + (WR2[1] - WR1[1]) * v
    return WA[0] + (bx - WA[0]) * u, WA[1] + (by - WA[1]) * u


def block(color, slice_=True, extra=""):
    s = []
    s.append(f'<path d="M 52 70 L 90 44 L 206 44 L 168 70 Z" {f(color, m=0.8)} {stroke()}/>')
    s.append(f'<path d="M 168 70 L 206 44 L 206 98 L 168 124 Z" {f(color, m=1.2)} {stroke()}/>')
    s.append(f'<path d="M 52 70 L 168 70 L 168 124 L 52 124 Z" {f(color)} {stroke()}/>')
    s.append(extra)
    if slice_:
        s.append(f'<path d="M 30 150 L 60 134 L 150 134 L 120 150 Z" {f(color, m=0.8)} {stroke()}/>')
        s.append(f'<path d="M 30 150 L 120 150 L 120 157 L 30 157 Z" {f(color, m=1.2)} {stroke()}/>')
        s.append(f'<path d="M 120 150 L 150 134 L 150 141 L 120 157 Z" {f(color, m=1.2)} {stroke()}/>')
    return "".join(s)


def log(rind, paste):
    s = []
    s.append(f'<path d="M 66 52 L 186 52 A 15 34 0 0 1 186 120 L 66 120 A 15 34 0 0 0 66 52 Z" {f(rind, m=1.25)} {stroke()}/>')
    for x in (104, 146):
        s.append(f'<path d="M {x} 52 A 15 34 0 0 1 {x} 120" fill="none" {stroke(2)} stroke-opacity="0.55"/>')
    s.append(f'<ellipse cx="66" cy="86" rx="15" ry="34" {f(paste, m=1.2)} {stroke()}/>')
    for x, y in ((74, 152), (122, 156)):
        s.append(f'<path d="M {x - 24} {y} A 24 9 0 0 0 {x + 24} {y} L {x + 24} {y + 6} A 24 9 0 0 1 {x - 24} {y + 6} Z" {f(rind, m=1.25)} {stroke()}/>')
        s.append(f'<ellipse cx="{x}" cy="{y}" rx="24" ry="9" {f(paste, m=1.2)} {stroke()}/>')
    for x in (150, 172, 194):
        s.append(f'<path d="M {x} 40 C {x - 8} 30 {x + 8} 24 {x} 12" fill="none" {stroke(2.2)} stroke-opacity="0.7"/>')
    return "".join(s)


def half_wheel(paste, rind, holes=()):
    s = []
    s.append(f'<path d="M 26 78 A 94 36 0 0 1 214 78 Z" {f(rind, m=1.2)} {stroke()}/>')
    s.append(f'<path d="M 26 78 L 214 78 L 214 128 L 26 128 Z" {f(paste)} {stroke()}/>')
    s.append(f'<path d="M 26 78 L 26 128 M 214 78 L 214 128" fill="none" {stroke(6)}/>')
    for hx, hy, hr in holes:
        s.append(hole(hx, hy, hr, hr))
    return "".join(s)


def zigzag_side(cx=120, cy=62, rx=92, ry=36, h=46, a_from=118, a_to=176, rows=3):
    s = []
    for r in range(rows):
        pts = []
        steps = 9
        for i in range(steps + 1):
            ang = a_from + (a_to - a_from) * i / steps
            x, y = pt(cx, cy, rx, ry, ang)
            y += 8 + r * 13 + (5 if i % 2 else -1)
            pts.append((x, y))
        s.append(f'<path d="M {" L ".join(P(p) for p in pts)}" fill="none" {stroke(1.8)} stroke-opacity="0.8"/>')
    return "".join(s)


def svg(body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180" role="img" aria-label="{title}">'
            f'<title>{title}</title>{body}</svg>\n')


def scatter_face(n, seed, maker, umin=0.22, umax=0.92):
    rnd = random.Random(seed)
    out = []
    tries = 0
    pts = []
    while len(pts) < n and tries < 400:
        tries += 1
        u = umin + (umax - umin) * rnd.random()
        v = 0.2 + 0.6 * rnd.random()
        x, y = face_pt(u, v)
        if all((x - a) ** 2 + (y - b) ** 2 > 15 ** 2 for a, b in pts):
            pts.append((x, y))
    for i, (x, y) in enumerate(pts):
        out.append(maker(x, y, i))
    return "".join(out)


def scatter_top(n, seed, maker):
    rnd = random.Random(seed)
    out = []
    pts = []
    tries = 0
    while len(pts) < n and tries < 400:
        tries += 1
        u = 0.45 + 0.45 * rnd.random()
        v = 0.25 + 0.5 * rnd.random()
        x, y = top_pt(u, v)
        if all((x - a) ** 2 + (y - b) ** 2 > 16 ** 2 for a, b in pts):
            pts.append((x, y))
    for i, (x, y) in enumerate(pts):
        out.append(maker(x, y, i))
    return "".join(out)


ART = {}

# 1 Sýr s vlašskými ořechy
ART["01-syr-s-vlasskymi-orechy"] = ("Sýr s vlašskými ořechy", wedge(
    PALE, YELLOW,
    extra_top=scatter_top(3, 11, lambda x, y, i: blob(x, y, 6.5, WALNUT, 100 + i)),
    extra_face=scatter_face(6, 12, lambda x, y, i: blob(x, y, 6.5, WALNUT, 200 + i))))

# 2 Gouda
ART["02-gouda"] = ("Gouda", wheel_cut(YELLOW, GOUDA, top=GOUDA, top_holes=[(84, 46, 7)], face_holes=[(146, 96, 4), (104, 104, 3.5)]))

# 3 Fancy Gouda
crystals = "".join(dot(x, y, 1.8, WHITE) for x, y in [(136, 86), (150, 104), (160, 92), (142, 116), (98, 96), (108, 112), (92, 110), (156, 76)])
ART["03-fancy-gouda"] = ("Fancy Gouda", wheel_cut(AMBER, WAX, top=WAX, extra_top="", face_holes=[], extra_side="") + crystals)

# 4 Irský cheddar
ART["04-irsky-cheddar"] = ("Irský cheddar", block(ORANGE))

# 5 Raclette
ART["05-raclette"] = ("Raclette", half_wheel(PALE, ORANGE, holes=[(70, 100, 5), (120, 110, 4), (168, 96, 5.5), (196, 114, 3.5), (96, 116, 3)]))

# 6 Uzený krémový sýr
ART["06-uzeny-kremovy-syr"] = ("Uzený krémový sýr", log(SMOKE, IVORY))

# 7 Camembert
ART["07-camembert"] = ("Camembert", wheel_cut(PALE, WHITE, top=WHITE, h=26, rx=86, ry=38, cy=74))

# 8 Kaškaval
ART["08-kaskaval"] = ("Kaškaval", wheel_cut(PALE, STRAW, top=STRAW, h=34, rx=94, ry=38, cy=68))

# 9 Ementál
ART["09-emental"] = ("Ementál", wedge(
    YELLOW, AMBER,
    extra_top=hole(*top_pt(0.62, 0.45), 11, 5.5, -12) + hole(*top_pt(0.86, 0.3), 7, 3.5, -12) + hole(*top_pt(0.85, 0.72), 6, 3, -12),
    extra_face=hole(*face_pt(0.34, 0.5), 9, 10) + hole(*face_pt(0.6, 0.36), 12, 13) + hole(*face_pt(0.86, 0.6), 10, 11) + hole(*face_pt(0.74, 0.8), 5, 5.5) + hole(*face_pt(0.2, 0.7), 4, 4.5)))

# 10 Karamelový sýr (Gjetost)
ART["10-karamelovy-syr-gjetost"] = ("Karamelový sýr Gjetost", block(CARAMEL))

# 11 Ovčí farmářský sýr
ART["11-ovci-farmarsky-syr"] = ("Ovčí farmářský sýr", wheel_cut(IVORY, OLIVE, top=OLIVE, h=44, rx=80, ry=32, cy=64))

# 12 Pecorino s pistáciemi
ART["12-pecorino-s-pistaciemi"] = ("Pecorino s pistáciemi Lo Sfizio", wedge(
    IVORY, BARK,
    extra_top=scatter_top(4, 31, lambda x, y, i: blob(x, y, 4.2, PISTA, 300 + i, sw=1.2)),
    extra_face=scatter_face(9, 32, lambda x, y, i: blob(x, y, 4.4, PISTA, 400 + i, sw=1.2), umin=0.18)))

# 13 Manchego DOP
ART["13-manchego-dop"] = ("Manchego DOP", wheel_cut(IVORY, BARK, top=BARK, top_holes=[], face_holes=[(144, 100, 2.5), (100, 106, 2.5), (154, 84, 2)],
                                           extra_side=zigzag_side(a_from=120, a_to=176) + zigzag_side(a_from=4, a_to=46)))

# 14 Kozí gouda
ART["14-kozi-gouda"] = ("Kozí gouda", wheel_cut(GOAT, IVORY, top=IVORY, top_holes=[], face_holes=[(146, 98, 3)]))

# 15 Kozí sýr s medem
honey_top = (f'<path d="M 96 70 C 112 52 150 50 176 62 C 196 72 190 88 170 92 C 150 96 118 94 104 86 C 92 80 90 76 96 70 Z" {f(HONEY, 0.85)} {stroke(2)}/>')
honey_drip = (f'<path d="M 120 88 C 120 100 114 108 118 118 C 121 126 130 126 132 118 C 135 108 128 100 130 90 Z" {f(HONEY, 0.85)} {stroke(2)}/>'
              f'<path d="M 156 94 C 156 102 152 106 155 112 C 157 117 164 117 165 112 C 167 106 163 102 164 95 Z" {f(HONEY, 0.85)} {stroke(2)}/>')
ART["15-kozi-syr-s-medem"] = ("Kozí sýr s medem", wedge(GOAT, IVORY, extra_top=honey_top, extra_face=honey_drip))

# 16 Kozí sýr s lanýžem
ART["16-kozi-syr-s-lanyzem"] = ("Kozí sýr s lanýžem", wedge(
    GOAT, IVORY,
    extra_top=scatter_top(5, 51, lambda x, y, i: blob(x, y, 3.2, TRUFFLE, 500 + i, a=1, sw=1.1)),
    extra_face=scatter_face(12, 52, lambda x, y, i: blob(x, y, 3.4, TRUFFLE, 600 + i, a=1, sw=1.1), umin=0.16)))

for name, (title, body) in ART.items():
    open(f"{OUT}/{name}.svg", "w", encoding="utf-8").write(svg(body, title))
print(len(ART), "illustrations")
