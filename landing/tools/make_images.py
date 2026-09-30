"""Genera las imágenes optimizadas de la landing a partir de los assets del repo.

Uso (desde la raíz del repo): python3 landing/tools/make_images.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "landing" / "img"
OUT.mkdir(parents=True, exist_ok=True)

# Los cuatro estados de Lampi (recortes transparentes de la app)
for name in ["radiante", "contenta", "cansada", "apagadita"]:
    im = Image.open(ROOT / f"app/assets/lumi/{name}.png").convert("RGBA")
    im.thumbnail((420, 420), Image.LANCZOS)
    im.save(OUT / f"lumi-{name}.webp", "WEBP", quality=82, method=6)

# La pradera nocturna, en dos tamaños
bg = Image.open(ROOT / "assets/Vertical-mobile-app-home-background-coz.png").convert("RGB")
W, H = bg.size
for width, suffix in [(1000, ""), (600, "-600")]:
    bg.resize((width, round(H * width / W)), Image.LANCZOS).save(
        OUT / f"pradera{suffix}.webp", "WEBP", quality=70, method=6
    )

# Recortes de la pradera para las postales (coordenadas a resolución completa)
CROPS = {
    "postal-lago": (620, 80, 1536, 760),
    "postal-musgo": (0, 1950, 820, 2560),
    "postal-setas": (880, 2080, 1536, 2600),
}
for key, box in CROPS.items():
    c = bg.crop(box)
    c.thumbnail((520, 400), Image.LANCZOS)
    c.save(OUT / f"{key}.webp", "WEBP", quality=74, method=6)

# Imagen para compartir (Open Graph, 1200x630)
strip = bg.resize((1200, round(H * 1200 / W)), Image.LANCZOS)
og = strip.crop((0, 1420, 1200, 2050)).convert("RGBA")
lumi = Image.open(ROOT / "app/assets/lumi/radiante.png").convert("RGBA")
lumi.thumbnail((340, 340), Image.LANCZOS)
og.alpha_composite(lumi, (600 - lumi.width // 2, 230))
og.convert("RGB").save(OUT / "og.jpg", quality=82)

# Favicon
fav = Image.open(ROOT / "app/assets/lumi/contenta.png").convert("RGBA")
fav.thumbnail((96, 96), Image.LANCZOS)
fav.save(OUT / "favicon.png")

for p in sorted(OUT.iterdir()):
    print(f"{p.name:24} {p.stat().st_size // 1024:5d} KB")
