#!/usr/bin/env python3
"""Compone objetos sobre los PNG de Lampi con las anclas de app/src/lumi/outfit-anchors.json.

Uso (desde la raíz):  python3 tools/outfit_preview.py [id ...]   (por defecto, un surtido)
Salida: assets/apimart/outfit-preview.png (una fila por objeto, una columna por estado).
Con STATES=contenta (un estado) los objetos se tilan en una rejilla de 6 columnas.
Los tamaños base deben coincidir con los de app/src/components/outfit.tsx (SLOT_SCALE).
"""
import json
import os
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LUMI = ROOT / "app" / "assets" / "lumi"
ICONS = ROOT / "app" / "assets" / "collection"
ANCHORS = json.loads((ROOT / "app" / "src" / "lumi" / "outfit-anchors.json").read_text())
FIT = json.loads((ROOT / "app" / "src" / "lumi" / "outfit-fit.json").read_text())
SLOT_SCALE = {"cabeza": 0.30, "cuello": 0.27, "mano": 0.32}
SLOT_OF = {
    "cabeza": "trebol seta bellota pluma hoja flor-luna trocito-luna nenufar pina polvo-estrella gorro-dormir antifaz-estrellas corona-luz".split(),
    "cuello": "bufanda moneda llave boton concha campanilla cristal geoda reloj lazo-luna medallon-sol capa-estrellas".split(),
    "mano": "farolillo catalejo mapa carta taza vela fresa galleta barquito gota burbuja engranaje piedra semilla canica calcetin ovillo varita-luz paraguas-nube linterna-dorada".split(),
}
slot_of = {i: s for s, ids in SLOT_OF.items() for i in ids}
DEFAULT = ["seta", "corona-luz", "bufanda", "medallon-sol", "farolillo", "catalejo", "varita-luz", "taza"]
CELL = 360


def render(state, item):
    base = Image.open(LUMI / f"{state}.png").convert("RGBA")
    k = CELL / max(base.size)
    base = base.resize((round(base.width * k), round(base.height * k)), Image.LANCZOS)
    canvas = Image.new("RGBA", (CELL, CELL), (30, 24, 70, 255))
    ox, oy = (CELL - base.width) // 2, (CELL - base.height) // 2
    canvas.alpha_composite(base, (ox, oy))
    slot = slot_of[item]
    ax, ay = ANCHORS[state][slot]
    fit = FIT.get(item, {})
    s = round(CELL * SLOT_SCALE[slot] * fit.get("scale", 1))
    icon = Image.open(ICONS / f"{item}.webp").convert("RGBA").resize((s, s), Image.LANCZOS)
    if fit.get("rotate"):
        icon = icon.rotate(-fit["rotate"], resample=Image.BICUBIC)
    canvas.alpha_composite(icon, (round(ox + ax * base.width - s / 2), round(oy + ay * base.height - s / 2)))
    return canvas


ids = sys.argv[1:] or DEFAULT
only = [x for x in os.environ.get("STATES", "").split(",") if x]
states = only or list(ANCHORS)
if len(states) == 1:
    cols = 6
    rows = -(-len(ids) // cols)
    sheet = Image.new("RGBA", (CELL * cols, CELL * rows))
    for n, item in enumerate(ids):
        sheet.alpha_composite(render(states[0], item), (n % cols * CELL, n // cols * CELL))
else:
    sheet = Image.new("RGBA", (CELL * len(states), CELL * len(ids)))
    for r, item in enumerate(ids):
        for c, state in enumerate(states):
            sheet.alpha_composite(render(state, item), (c * CELL, r * CELL))
out = ROOT / "assets" / "apimart" / "outfit-preview.png"
sheet.save(out)
print(out)
