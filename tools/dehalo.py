#!/usr/bin/env python3
"""Quita el contorno crema (resto del fondo blanco) de objetos recortados y regenera su .webp.

Uso (desde la raíz del repo, con pillow, numpy y scipy):
    python3 tools/dehalo.py corona-luz varita-luz          # escribe app/assets/collection/<id>.webp
    OUT=/tmp/x python3 tools/dehalo.py corona-luz          # escribe en otra carpeta (para revisar)

Fuente: assets/apimart/objetos/<id>.png. Marca como halo los píxeles claros y poco
saturados (crema) o semitransparentes que se tocan con el borde de la imagen, los vuelve
transparentes y suaviza el borde nuevo. Los brillos crema de dentro del objeto no se
tocan porque no están conectados con el exterior.
"""
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "apimart" / "objetos"
OUT = Path(os.environ.get("OUT", ROOT / "app" / "assets" / "collection"))
SIZE = 320


def dehalo(im: Image.Image) -> Image.Image:
    a = np.asarray(im.convert("RGBA")).astype(np.float32)
    r, g, b, alpha = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    # Crema: muy claro y con el azul alto (el dorado y el naranja del objeto tienen el azul bajo).
    cream = (r > 225) & (g > 205) & (b > 150) & ((r - b) < 90)
    candidate = cream | (alpha < 250)
    labels, _ = ndimage.label(candidate)
    edge = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    halo = np.isin(labels, edge[edge > 0])
    # Un píxel más hacia dentro: la franja de transición crema-naranja.
    halo = ndimage.binary_dilation(halo, iterations=1) & (cream | halo | (b > 110))
    keep = ndimage.gaussian_filter((~halo).astype(np.float32), sigma=0.7)
    out = a.copy()
    out[..., 3] = alpha * np.clip((keep - 0.5) * 2, 0, 1)
    return Image.fromarray(out.round().astype(np.uint8), "RGBA")


def main(ids: list[str]) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for item in ids:
        im = dehalo(Image.open(SRC / f"{item}.png"))
        im = im.resize((SIZE, SIZE), Image.LANCZOS)
        path = OUT / f"{item}.webp"
        im.save(path, "WEBP", quality=88)
        print(path)


if __name__ == "__main__":
    main(sys.argv[1:] or ["corona-luz", "varita-luz"])
