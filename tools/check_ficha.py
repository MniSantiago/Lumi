"""Comprueba los límites de caracteres de Apple en FICHA_APP_STORE.md.

Uso (desde la raíz del repo): python3 tools/check_ficha.py
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

text = (Path(__file__).resolve().parents[1] / "FICHA_APP_STORE.md").read_text(encoding="utf-8")
ok = True
for section, limit in LIMITS.items():
    match = re.search(rf"^## {re.escape(section)}.*?\n```\n(.*?)\n```", text, re.S | re.M)
    if not match:
        print(f"✗ {section}: no encuentro el bloque")
        ok = False
        continue
    value = match.group(1)
    if section == "Palabras clave" and (", " in value or " ," in value):
        print(f"✗ {section}: sin espacios después de las comas")
        ok = False
    mark = "✓" if len(value) <= limit else "✗"
    ok &= len(value) <= limit
    print(f"{mark} {section}: {len(value)}/{limit}")

sys.exit(0 if ok else 1)
