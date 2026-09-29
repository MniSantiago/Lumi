"""Comprueba los límites de caracteres de Apple en las fichas de la App Store.

Uso (desde la raíz del repo): python3 tools/check_ficha.py
Revisa FICHA_APP_STORE.md (español) y ficha/<idioma>.md (los demás idiomas).
"""
import re
import sys
from pathlib import Path

LIMITS = {
    "Nombre": 30,
    "Subtítulo": 30,
    "Palabras clave": 100,
    "Texto promocional": 170,
    "Descripción": 4000,
    "Novedades de esta versión": 4000,
}

ROOT = Path(__file__).resolve().parents[1]
FILES = [ROOT / "FICHA_APP_STORE.md", *sorted((ROOT / "ficha").glob("*.md"))]


def check(text: str) -> bool:
    ok = True
    for section, limit in LIMITS.items():
        match = re.search(rf"^## {re.escape(section)}.*?\n```\n(.*?)\n```", text, re.S | re.M)
        if not match:
            print(f"  ✗ {section}: no encuentro el bloque")
            ok = False
            continue
        value = match.group(1)
        if section == "Palabras clave" and (", " in value or " ," in value):
            print(f"  ✗ {section}: sin espacios después de las comas")
            ok = False
        fits = len(value) <= limit
        ok &= fits
        print(f"  {'✓' if fits else '✗'} {section}: {len(value)}/{limit}")
    return ok


all_ok = True
for path in FILES:
    print(path.relative_to(ROOT))
    all_ok &= check(path.read_text(encoding="utf-8"))

sys.exit(0 if all_ok else 1)
