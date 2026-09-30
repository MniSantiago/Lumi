#!/usr/bin/env python3
"""Genera el fotograma de parpadeo de Lumi (ojos cerrados) alineado píxel a píxel
con la ilustración del estado, para intercambiarlos unos milisegundos en la app.

Uso (desde la raíz del repo):  python3 tools/make_blink.py
Requiere: pillow, numpy, scipy, opencv-python-headless.

- Localiza los ojos (manchas marrón oscuro en la mitad superior del cuerpo).
- Rellena su hueco con la piel de alrededor (inpainting de OpenCV).
- Dibuja un párpado cerrado: un arco suave con dos pestañas, del mismo marrón.
Escribe assets/lumi/<estado>-parpadeo.png.
"""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

APP = Path(__file__).resolve().parent.parent / "app"
STATES = ["contenta", "cansada"]  # los que tienen los ojos abiertos
LINE = (74, 44, 58, 255)          # marrón de los ojos, algo más oscuro
SS = 4                            # supermuestreo para trazos suaves


def find_eyes(rgba):
    a = rgba.astype(int)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    h = al.shape[0]
    eye = (al > 200) & (r < 150) & (g < 115) & (b < 120) & (r >= b - 5)
    eye[int(h * 0.6):] = False
    eye = ndi.binary_closing(eye, iterations=2)
    lab, n = ndi.label(eye)
    sizes = ndi.sum(eye, lab, range(1, n + 1))
    comps = []
    for i in np.argsort(sizes)[::-1][:3]:
        ys, xs = np.where(lab == i + 1)
        comps.append((sizes[i], xs.min(), ys.min(), xs.max(), ys.max(), lab == i + 1))
    # los dos ojos: los dos componentes grandes más altos y a la misma altura
    comps.sort(key=lambda c: c[2])
    eyes = sorted(comps[:2], key=lambda c: c[1])
    return eyes


def blink(name):
    src = APP / "assets" / "lumi" / f"{name}.png"
    im = Image.open(src).convert("RGBA")
    rgba = np.array(im)
    eyes = find_eyes(rgba)
    # el ojo entero (iris, blanco y brillos): una elipse algo mayor que la mancha marrón
    yy, xx = np.mgrid[: rgba.shape[0], : rgba.shape[1]]
    mask = np.zeros(rgba.shape[:2], bool)
    for _, x0, y0, x1, y1, _m in eyes:
        cx, cy, rx, ry = (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2 * 1.28 + 4, (y1 - y0) / 2 * 1.28 + 4
        mask |= ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1
    # el relleno se toma de la piel lavanda: el colorete de las mejillas (más rojo que azul)
    # se neutraliza en la copia de trabajo para que no suba hacia el párpado
    src_rgb = rgba[..., :3].copy()
    ri, gi, bi = (src_rgb[..., k].astype(int) for k in range(3))
    ring = ndi.binary_dilation(mask, iterations=14) & ~mask & (rgba[..., 3] > 200)
    skin = ring & (bi >= ri)
    tone = np.median(src_rgb[skin], axis=0) if skin.any() else np.array([200, 185, 240])
    blush = (ri - bi > 4) & (rgba[..., 3] > 200)
    src_rgb[blush & ndi.binary_dilation(mask, iterations=40)] = tone
    rgb = cv2.cvtColor(src_rgb, cv2.COLOR_RGB2BGR)
    filled = cv2.inpaint(rgb, mask.astype(np.uint8) * 255, 9, cv2.INPAINT_TELEA)
    # suaviza el parche para que no se note la textura del relleno
    blur = cv2.GaussianBlur(filled, (0, 0), 3)
    soft = ndi.gaussian_filter(mask.astype(float), 2)[..., None]
    patched = (filled * (1 - soft) + blur * soft).astype(np.uint8)
    out = rgba.copy()
    feather = np.clip(ndi.gaussian_filter(mask.astype(float), 1.5) * 1.6, 0, 1)[..., None]
    out[..., :3] = (cv2.cvtColor(patched, cv2.COLOR_BGR2RGB) * feather + rgba[..., :3] * (1 - feather)).astype(np.uint8)

    # párpados cerrados, dibujados con supermuestreo
    over = Image.new("RGBA", (im.width * SS, im.height * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    for i, (_, x0, y0, x1, y1, _) in enumerate(eyes):
        w, h = x1 - x0, y1 - y0
        cx, cy = (x0 + x1) / 2, y0 + h * 0.58
        box = [(cx - w * 0.46) * SS, (cy - h * 0.28) * SS, (cx + w * 0.46) * SS, (cy + h * 0.28) * SS]
        d.arc(box, start=15, end=165, fill=LINE, width=int(max(4, w * 0.075) * SS))
        # pestaña exterior
        side = -1 if i == 0 else 1
        ex, ey = cx + side * w * 0.44, cy + h * 0.06
        d.line([ex * SS, ey * SS, (ex + side * w * 0.12) * SS, (ey - h * 0.1) * SS],
               fill=LINE, width=int(max(3, w * 0.05) * SS))
    over = over.resize(im.size, Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.4))
    result = Image.fromarray(out, "RGBA")
    result.alpha_composite(over)
    dest = src.with_name(f"{name}-parpadeo.png")
    result.save(dest, optimize=True)
    print(f"{name}: ojos en {[(int(e[1]), int(e[2]), int(e[3]), int(e[4])) for e in eyes]} -> {dest.name}")


if __name__ == "__main__":
    for s in STATES:
        blink(s)
