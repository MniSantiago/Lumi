#!/usr/bin/env python3
"""Genera lumi-mockup.html a partir de la plantilla, incrustando las imágenes.

Uso (desde la raíz del repo):  python3 tools/build.py

El mockup se publica como artifact, y ahí solo se ven imágenes incrustadas
como data URI; por eso la plantilla lleva marcadores {{LUMI}} y {{BG}}.
"""
import base64
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "src" / "lumi-mockup.template.html"
OUT = ROOT / "lumi-mockup.html"
ASSETS = {
    "{{LUMI}}": ROOT / "assets" / "web" / "lumi.webp",
    "{{BG}}": ROOT / "assets" / "web" / "fondo-hogar.webp",
}


def data_uri(path: Path) -> str:
    mime = {"webp": "image/webp", "png": "image/png", "jpg": "image/jpeg"}[path.suffix[1:]]
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


html = TEMPLATE.read_text(encoding="utf-8")
for marker, path in ASSETS.items():
    assert marker in html, f"Falta el marcador {marker} en la plantilla"
    html = html.replace(marker, data_uri(path))
OUT.write_text(html, encoding="utf-8")
print(f"Escrito {OUT.name} ({OUT.stat().st_size / 1024:.0f} KB)")
