"""Recorta las capturas de móvil a 390 px y quita el fondo sobrante del final de las capturas completas."""
import sys
from pathlib import Path

from PIL import Image

out = Path(sys.argv[1])
for name, scale in [("mobile-top.png", 2), ("mobile-full.png", 1)]:
    p = out / name
    if p.exists():
        im = Image.open(p)
        im.crop((0, 0, 390 * scale, im.height)).save(p)

for name in ["mobile-full.png", "desktop-full.png"]:
    p = out / name
    if not p.exists():
        continue
    im = Image.open(p).convert("RGB")
    px = im.load()
    bottom = im.height - 1
    bg = px[im.width // 2, bottom]
    # sube mientras la fila central sea del color de fondo de la página (#13112E) o del frame
    while bottom > 0 and all(abs(a - b) < 3 for a, b in zip(px[im.width // 2, bottom], bg)) and all(
        abs(a - b) < 3 for a, b in zip(px[8, bottom], bg)
    ):
        bottom -= 1
    im.crop((0, 0, im.width, min(im.height, bottom + 2))).save(p, optimize=True)
