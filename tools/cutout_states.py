#!/usr/bin/env python3
"""Recorta los estados de Lampi (fondo blanco) y los exporta para la app Expo.

Uso (desde la raíz del repo):  python3 tools/cutout_states.py

Mismo método que el recorte de la variante B:
- Cuerpo: píxeles lavanda/violeta más todo lo que encierran (ojos, mejillas,
  barriga), opaco.
- Halo y orbes de las antenas: "color a alfa" sobre blanco, para conservar el
  brillo cálido como semitransparencia.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "app" / "assets" / "lumi"
SIZE = 640  # lado máximo en la app (@3x de ~210 pt)
CLOSE = 31  # px (sobre 2048) del cierre morfológico

SOURCES = {
    "radiante": ROOT / "assets" / "Radiante.png",
    "contenta": ROOT / "assets" / "web" / "lumi-recorte.png",  # ya recortada
    "cansada": ROOT / "assets" / "Cansada.png",
    "apagadita": ROOT / "assets" / "Apagadita.png",
}


def cutout(img: Image.Image) -> Image.Image:
    rgb = np.asarray(img.convert("RGB")).astype(np.float32)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]

    ctoa = np.max(255 - rgb, axis=-1) / 255  # "color a alfa" respecto al blanco

    # 1. Semilla opaca: lo lavanda/violeta que no es papel (cuerpo, antenas,
    #    contorno de los destellos) y el núcleo saturado de los orbes.
    seed = (b > g + 6) | (ctoa > 0.5)
    m = Image.fromarray(np.where(seed, 255, 0).astype(np.uint8)).copy()
    # Cierre morfológico: tapa los huecos del contorno para que los brillos
    # blancos de dentro (orbes, mano, destellos) no se cuelen como fondo.
    m = m.filter(ImageFilter.MaxFilter(CLOSE))
    # 2. Todo lo no-cuerpo alcanzable desde el borde es fondo; lo que queda
    #    encerrado (ojos, mejillas, barriga) es cuerpo.
    ImageDraw.floodfill(m, (0, 0), 128)
    closed = Image.fromarray(np.where(np.asarray(m) != 128, 255, 0).astype(np.uint8)).copy()
    body = np.asarray(closed.filter(ImageFilter.MinFilter(CLOSE))) > 0

    # Blancos encerrados (núcleo de los destellos, reflejos): no tocan el papel
    # del borde, así que son luz y no fondo.
    paper = Image.fromarray(np.where(rgb.min(axis=-1) > 243, 255, 0).astype(np.uint8)).copy()
    ImageDraw.floodfill(paper, (0, 0), 128)
    body |= np.asarray(paper) == 255
    body_a = np.asarray(
        Image.fromarray((body * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6))
    ).astype(np.float32) / 255

    # 3. Halo: alfa por "color a alfa", pero el color conserva el tono llevado
    #    a brillo máximo (despremultiplicar oscurece los tonos medios).
    glow_a = np.clip((ctoa - 0.03) / 0.97, 0, 1)
    alpha = np.maximum(body_a, glow_a)
    bright = rgb * (255 / np.maximum(rgb.max(axis=-1, keepdims=True), 1))
    w = body_a[..., None]
    color = np.clip(w * rgb + (1 - w) * bright, 0, 255)

    out = np.dstack([color, alpha * 255]).astype(np.uint8)
    im = Image.fromarray(out, "RGBA")
    return im.crop(im.getbbox())


OUT.mkdir(parents=True, exist_ok=True)
for name, src in SOURCES.items():
    img = Image.open(src)
    im = img if img.mode == "RGBA" and name == "contenta" else cutout(img)
    im.thumbnail((SIZE, SIZE), Image.LANCZOS)
    dest = OUT / f"{name}.png"
    im.save(dest, optimize=True)
    print(f"{dest.relative_to(ROOT)}  {im.size}  {dest.stat().st_size // 1024} KB")
