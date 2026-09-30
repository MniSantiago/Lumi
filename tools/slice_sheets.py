#!/usr/bin/env python3
"""Corta las hojas de assets/apimart/ (ver tools/apimart_generate.py) en piezas sueltas.

Uso (desde la raíz del repo):  python3 tools/slice_sheets.py [hoja ...]

- Postales: detecta las calles blancas entre casillas y guarda cada ilustración
  cuadrada en assets/apimart/postales/<destino>.jpg (768 px, como las de la app).
- Objetos y amigos: corta la casilla, quita el fondo blanco y deja la pieza
  centrada en un PNG transparente cuadrado en assets/apimart/{objetos,amigos}/<id>.png.
Además genera assets/apimart/<hoja>-contacto.jpg para revisar el resultado.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "apimart"


def grid_shape(ids, size):
    return (3, 4) if size == "4:3" and len(ids) == 12 else (3, 3)


def gutters(profile, n, white=0.93):
    """Posiciones de corte a lo largo de un eje: centros de las bandas blancas más cercanas a k/n."""
    L = len(profile)
    is_white = profile > white
    cuts = [0]
    for k in range(1, n):
        target = round(L * k / n)
        best, window = None, L // (3 * n)
        for d in range(window):
            for p in (target - d, target + d):
                if 0 <= p < L and is_white[p]:
                    best = p
                    break
            if best is not None:
                break
        if best is None:
            best = target
        a = b = best
        while a > 0 and is_white[a - 1]:
            a -= 1
        while b < L - 1 and is_white[b + 1]:
            b += 1
        cuts.append((a, b))
    cuts.append(L)
    spans, start = [], 0
    for c in cuts[1:-1]:
        spans.append((start, c[0]))
        start = c[1] + 1
    spans.append((start, L))
    return spans


def trim_white(im, thr=242, pad=0):
    a = np.array(im.convert("L"))
    ys, xs = np.where(a < thr)
    if len(xs) == 0:
        return im
    return im.crop((max(xs.min() - pad, 0), max(ys.min() - pad, 0),
                    min(xs.max() + 1 + pad, im.width), min(ys.max() + 1 + pad, im.height)))


def postcards(name, meta, im):
    rows, cols = grid_shape(meta["ids"], meta["size"])
    g = np.array(im.convert("L")).astype(float) / 255
    # una columna/fila es calle si casi todos sus píxeles son blancos
    ys = gutters((g > 0.93).mean(axis=1), rows, white=0.85)
    xs = gutters((g > 0.93).mean(axis=0), cols, white=0.85)
    out = SRC / "postales"
    out.mkdir(exist_ok=True)
    tiles = []
    for r, (y0, y1) in enumerate(ys):
        for c, (x0, x1) in enumerate(xs):
            tile = trim_white(im.crop((x0, y0, x1, y1)), thr=235)
            s = min(tile.size)
            tile = tile.crop(((tile.width - s) // 2, (tile.height - s) // 2,
                              (tile.width - s) // 2 + s, (tile.height - s) // 2 + s))
            # recorta 1,5 % por borde para quitar restos de calle
            m = round(s * 0.015)
            tile = tile.crop((m, m, s - m, s - m)).resize((768, 768), Image.LANCZOS).convert("RGB")
            pid = meta["ids"][r * cols + c]
            tile.save(out / f"{pid}.jpg", quality=86)
            tiles.append((pid, tile))
    return tiles


SOLID_THRESHOLD = 0.16  # por debajo es brillo o sombra suave: se queda translúcido


def cutout_white(im):
    """Quita el fondo liso de una casilla conservando brillos suaves (color a alfa contra el fondo)."""
    from scipy import ndimage as ndi
    a = np.array(im.convert("RGB")).astype(float)
    border = np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3), a[:, :8].reshape(-1, 3), a[:, -8:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    # cuánto se aleja cada píxel del fondo hacia lo oscuro o lo coloreado (0 = fondo)
    dark = np.clip((bg - a) / np.maximum(bg, 1), 0, 1).max(-1)
    alpha = np.clip((dark - 0.035) * 1.8, 0, 1)
    # silueta del objeto: todo lo que se aparta del fondo, cerrado y relleno, para que
    # las zonas claras de dentro (papel, cera, reflejos) sigan siendo opacas
    solid = ndi.binary_closing(dark > SOLID_THRESHOLD, iterations=4)
    solid = ndi.binary_fill_holes(solid)
    lab, n = ndi.label(solid)
    if n:
        sizes = ndi.sum(solid, lab, range(1, n + 1))
        solid = np.isin(lab, [i + 1 for i, sz in enumerate(sizes) if sz > max(60, sizes.max() * 0.004)])
    solid = np.array(Image.fromarray((solid * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.2))).astype(float) / 255
    alpha = np.maximum(alpha, solid)
    rec = np.clip((a - bg * (1 - alpha[..., None])) / np.maximum(alpha[..., None], 1e-3), 0, 255)
    col = a * solid[..., None] + rec * (1 - solid[..., None])
    return Image.fromarray(np.dstack([col, alpha * 255]).astype(np.uint8), "RGBA")


def icons(name, meta, im, folder, size=512):
    rows, cols = grid_shape(meta["ids"], meta["size"])
    out = SRC / folder
    out.mkdir(exist_ok=True)
    W, H = im.size
    tiles = []
    for r in range(rows):
        for c in range(cols):
            cw, ch = W // cols, H // rows
            m = round(min(cw, ch) * 0.05)  # margen: esquiva el marco tenue de algunas casillas
            cell = im.crop((c * cw + m, r * ch + m, (c + 1) * cw - m, (r + 1) * ch - m)).convert("RGB")
            rgba = cutout_white(cell)
            a = np.array(rgba)[..., 3]
            ys, xs = np.where(a > 12)
            rgba = rgba.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)) if len(xs) else rgba
            s = round(max(rgba.size) * 1.12)
            canvas = Image.new("RGBA", (s, s), (0, 0, 0, 0))
            canvas.alpha_composite(rgba, ((s - rgba.width) // 2, (s - rgba.height) // 2))
            canvas = canvas.resize((size, size), Image.LANCZOS)
            pid = meta["ids"][r * cols + c]
            canvas.save(out / f"{pid}.png", optimize=True)
            tiles.append((pid, canvas))
    return tiles


def contact(name, tiles, cols):
    th = 256
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * th, rows * (th + 22)), (27, 24, 64))
    d = ImageDraw.Draw(sheet)
    for i, (pid, t) in enumerate(tiles):
        t = t.copy()
        t.thumbnail((th, th))
        x, y = (i % cols) * th, (i // cols) * (th + 22)
        if t.mode == "RGBA":
            sheet.paste(t, (x, y), t)
        else:
            sheet.paste(t, (x, y))
        d.text((x + 6, y + th + 4), pid, fill=(230, 224, 251))
    sheet.save(SRC / f"{name}-contacto.jpg", quality=85)


def sheet_file(name):
    for ext in (".png", ".jpg", ".jpeg", ".webp"):
        if (SRC / f"{name}{ext}").exists():
            return SRC / f"{name}{ext}"


def main(names):
    manifest = json.loads((SRC / "manifest.json").read_text())
    for name in names or [n for n in manifest if sheet_file(n)]:
        meta = manifest[name]
        im = Image.open(sheet_file(name)).convert("RGB")
        if name.startswith("postales"):
            tiles = postcards(name, meta, im)
        elif name.startswith("objetos"):
            tiles = icons(name, meta, im, "objetos")
        else:
            tiles = icons(name, meta, im, "amigos")
        contact(name, tiles, grid_shape(meta["ids"], meta["size"])[1])
        print(f"{name:11s} -> {len(tiles)} piezas")


if __name__ == "__main__":
    main(sys.argv[1:])
