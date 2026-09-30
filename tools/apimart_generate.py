#!/usr/bin/env python3
"""Genera las hojas de postales, objetos y amigos de Lampi con APIMart (Seedream 5.0 Lite).

Uso (desde la raíz del repo):
    APIMART_API_KEY=sk-... python3 tools/apimart_generate.py            # todas las hojas
    APIMART_API_KEY=sk-... python3 tools/apimart_generate.py amigos     # solo algunas
    APIMART_API_KEY=sk-... python3 tools/apimart_generate.py --fetch    # recoger las ya enviadas

Cada hoja es UNA petición que devuelve una cuadrícula (3×3 o 4×3); luego
tools/slice_sheets.py la corta en piezas sueltas. Todas las peticiones se lanzan
a la vez y se esperan juntas. Resultados en assets/apimart/<hoja>.png y un
registro (prompt, task_id, coste) en assets/apimart/manifest.json.
"""
import base64
import io
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "apimart"
API = "https://api.apimart.ai/v1"
MODEL = "seedream-5-0-lite"

STYLE_POSTCARD = (
    "Every tile in exactly the same soft cozy 2D painterly illustration style as the reference image "
    "(Studio Ghibli inspired, gentle grain texture, rounded shapes, dreamy light), sharing one palette: "
    "deep indigo night blues, lavender and soft violet, warm amber-gold light, peach-pink accents and soft moss green. "
    "No people, no text, no letters, no borders inside the tiles; small animals only as tiny distant details when mentioned."
)
GRID9 = (
    "A clean 3x3 grid of nine separate square illustrations, like a sheet of nine postcard pictures, "
    "separated by thin straight white gutters of equal width, all tiles exactly the same size and perfectly aligned. "
)
STYLE_ICON = (
    "Each one centered alone in its own cell, clearly separated from the others with generous empty space, "
    "on one continuous plain flat pure white background, no gutters, no frames, no ground shadows, no text, no letters. "
    "Same soft cozy 2D painterly illustration style as the reference character (gentle grain, rounded shapes, soft glow), "
    "palette of lavender, soft violet, warm amber-gold, peach-pink, mint green and cream. Cute, readable at small size."
)


def cells(rows):
    names = ["left", "center", "right"] if len(rows[0]) == 3 else ["1st", "2nd", "3rd", "4th"]
    out = []
    for r, row in enumerate(rows, 1):
        for c, text in enumerate(row):
            out.append(f"Row {r} {names[c]}: {text}.")
    return " ".join(out)


SHEETS = {
    "postales-a": {
        "size": "1:1", "ref": "assets/3x3-grid-separate-square-expeditions.png",
        "ids": ["puente-raices", "charca-ranas", "cascada-timida", "playa-conchas", "muelle-barcas",
                "isla-reloj", "mercadillo-buhos", "tejados-aldea", "montana-manta"],
        "prompt": GRID9 + STYLE_POSTCARD + " " + cells([
            ["a natural bridge made of giant intertwined tree roots over a gentle stream, moss and ferns, soft dusk light",
             "a small pond at night with lily pads, reeds and fireflies, tiny frog silhouettes on the pads",
             "a small shy waterfall half hidden behind ferns and mossy rocks, lavender mist, soft morning light"],
            ["a warm sandy beach with pink seashells and gentle waves at golden sunset",
             "a small wooden pier at dusk with many white paper boats floating on calm water, warm lanterns",
             "a tiny island in a calm sea with an old clock tower whose hands show a quarter past eleven, pastel twilight"],
            ["a cozy night market in a forest clearing with paper lanterns and small wooden stalls, tiny owl silhouettes on branches",
             "rooftops of a sleeping village at night, chimneys with warm smoke, a small cat silhouette on a roof, big moon",
             "a round snowy mountain that looks soft like a quilted blanket, warm pastel light, cozy"],
        ]),
    },
    "postales-b": {
        "size": "1:1", "ref": "assets/3x3-grid-separate-square-expeditions.png",
        "ids": ["jardin-estrellas", "observatorio-cometas", "pradera-suave", "nube-baja", "dientes-de-leon",
                "bosque-musgo", "faro-dormido", "lago-lunas", "madriguera-vecino"],
        "prompt": GRID9 + STYLE_POSTCARD + " " + cells([
            ["a garden of glowing white moonflowers at night with small fallen stars resting among the flowers",
             "an old abandoned observatory dome on a hill, its telescope pointing at a sky full of comets",
             "a gentle meadow with tall soft grass, clover and tiny flowers under a pale morning sky"],
            ["a fluffy cloud resting on the ground on a round grassy hilltop at pastel dawn",
             "a hill covered in dandelions at golden sunset, fluffy seeds flying in a neat line",
             "an ancient mossy forest floor so soft it looks like a bed, beams of green-gold light, fireflies"],
            ["a small sleeping lighthouse on a cliff by a calm sea at twilight, its lamp off, first stars",
             "a still lake at night reflecting two crescent moons, lavender mist, reeds",
             "a cozy round wooden burrow door in a mossy hill, warm glowing window, smoke from a tiny chimney, evening"],
        ]),
    },
    "objetos-1": {
        "size": "1:1", "ref": "assets/fa783b9e-d615-4151-b0b7-0f5ef3977612.png",
        "ids": ["piedra", "semilla", "trebol", "seta", "cristal", "farolillo", "bellota", "pluma", "hoja"],
        "prompt": "A 3x3 grid of nine small collectible objects for a cozy game inventory. " + STYLE_ICON + " " + cells([
            ["a smooth lavender river stone with a soft highlight", "a single dandelion flying seed", "a three-leaf mint green clover"],
            ["a small glowing peach mushroom with white dots", "a little aqua crystal", "a glowing amber paper lantern"],
            ["an acorn with its little hat", "a soft lavender owl feather", "a golden autumn leaf"],
        ]),
    },
    "objetos-2": {
        "size": "1:1", "ref": "assets/fa783b9e-d615-4151-b0b7-0f5ef3977612.png",
        "ids": ["concha", "gota", "llave", "boton", "galleta", "taza", "barquito", "canica", "campanilla"],
        "prompt": "A 3x3 grid of nine small collectible objects for a cozy game inventory. " + STYLE_ICON + " " + cells([
            ["a pink scallop seashell", "a single sparkling dewdrop", "a tiny ornate golden key"],
            ["a lost round wooden button with four holes", "an oat biscuit", "a small cream teacup without a handle"],
            ["a white folded paper boat", "a glass marble with water swirling inside", "a bluebell flower"],
        ]),
    },
    "objetos-3": {
        "size": "1:1", "ref": "assets/fa783b9e-d615-4151-b0b7-0f5ef3977612.png",
        "ids": ["flor-luna", "fresa", "ovillo", "mapa", "carta", "reloj", "engranaje", "vela", "catalejo"],
        "prompt": "A 3x3 grid of nine small collectible objects for a cozy game inventory. " + STYLE_ICON + " " + cells([
            ["a glowing white and lavender moonflower", "a wild strawberry with a leaf", "a peach ball of wool yarn"],
            ["a crumpled old paper map", "a sealed envelope with a wax seal and no address", "a brass pocket watch"],
            ["a small brass cog", "a lit wax candle with a warm flame", "a small brass spyglass"],
        ]),
    },
    "objetos-4": {
        "size": "1:1", "ref": "assets/fa783b9e-d615-4151-b0b7-0f5ef3977612.png",
        "ids": ["polvo-estrella", "trocito-luna", "pina", "geoda", "nenufar", "bufanda", "moneda", "calcetin", "burbuja"],
        "prompt": "A 3x3 grid of nine small collectible objects for a cozy game inventory. " + STYLE_ICON + " " + cells([
            ["a small glass jar full of glowing golden stardust", "a glowing crescent-shaped piece of the moon", "a pinecone"],
            ["a geode cracked open with purple crystals inside", "a pink water lily on a green pad", "a tiny knitted scarf with lavender and amber stripes"],
            ["an old gold coin with a star engraved", "a single odd striped sock", "an iridescent soap bubble"],
        ]),
    },
    "tutorial": {
        "size": "1:1", "ref": "assets/fa783b9e-d615-4151-b0b7-0f5ef3977612.png",
        "ids": ["mano", "estrella", "flecha", "brillos", "corazon", "varita", "medalla", "pergamino", "corona"],
        "prompt": "A 3x3 grid of nine small friendly UI sticker icons for an interactive tutorial in a cozy game. " + STYLE_ICON + " " + cells([
            ["a cute soft lavender cartoon hand with one finger pointing up, round chubby fingers, peach blush, gentle amber glow at the fingertip",
             "a single glowing golden five-point star with rounded tips and a soft warm halo",
             "a curved hand-drawn arrow made of warm amber light, thick rounded stroke, slightly sparkling"],
            ["a small cluster of three tiny golden sparkles of different sizes",
             "a soft glowing peach-pink heart with a tiny highlight",
             "a little magic wand with a lavender handle and a glowing golden star at the tip"],
            ["a round golden medal with a star in the middle and two short lavender ribbons",
             "a small rolled parchment scroll tied with an amber ribbon",
             "a tiny golden crown with three rounded points and a violet gem"],
        ]),
    },
    "amigos": {
        "size": "4:3", "ref": "assets/fa783b9e-d615-4151-b0b7-0f5ef3977612.png",
        "ids": ["musguito", "hollin", "nubecilla", "chispin", "topito", "pinchito",
                "ranita", "caracolina", "burbujo", "pinzas", "mochuelito", "estrellita"],
        "prompt": (
            "A grid of 3 rows by 4 columns with twelve tiny cute creature friends of the reference character, full body, "
            "chibi proportions like the reference (soft round bodies, big glossy eyes, peach blush cheeks, gentle smiles). "
            + STYLE_ICON + " " + cells([
                ["a round mint-green moss creature with two little sprout antennae",
                 "a small round fluffy charcoal-indigo ember creature with a soft violet rim glow, tiny amber sparks and big white eyes",
                 "a tiny soft lavender-white cloud creature with a sleepy smile",
                 "a tiny amber firefly creature with translucent lavender wings and a glowing belly"],
                ["a chubby lavender mole with round golden glasses and a pink nose, holding a biscuit",
                 "a small hedgehog with soft violet spines and a cream face",
                 "a little mint-green frog singing with its mouth open",
                 "a lavender snail with a peach spiral shell"],
                ["a small aqua fish with a floating bubble above it",
                 "a small peach crab happily waving its claws",
                 "a fluffy lavender baby owl with big round eyes and a tiny amber beak",
                 "a small pale golden star with a shy smile and a soft glow"],
            ])
        ),
    },
}


def key():
    k = os.environ.get("APIMART_API_KEY") or Path("~/.apimart_key").expanduser().read_text().strip()
    return k


def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method,
                                 data=json.dumps(body).encode() if body else None,
                                 headers={"Authorization": f"Bearer {key()}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def data_uri(path, max_side=1280):
    im = Image.open(ROOT / path).convert("RGB")
    im.thumbnail((max_side, max_side))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=88)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def load_manifest():
    p = OUT / "manifest.json"
    return json.loads(p.read_text()) if p.exists() else {}


def save_manifest(m):
    (OUT / "manifest.json").write_text(json.dumps(m, ensure_ascii=False, indent=2))


def submit(names):
    manifest = load_manifest()
    for name in names:
        s = SHEETS[name]
        body = {"model": MODEL, "prompt": s["prompt"], "size": s["size"], "resolution": "4K", "n": 1,
                "image_urls": [data_uri(s["ref"])], "watermark": False}
        try:
            tid = call("POST", "/images/generations", body)["data"][0]["task_id"]
            print(f"{name:11s} enviada  {tid}")
        except urllib.error.HTTPError as e:
            print(f"{name:11s} ERROR {e.code}: {e.read().decode()[:300]}")
            tid = None
        manifest[name] = {"ids": s["ids"], "size": s["size"], "prompt": s["prompt"], "task_id": tid}
        save_manifest(manifest)  # se guarda enseguida: si el proceso se corta, --fetch las recupera


def fetch(names=None, wait=170):
    """Descarga las hojas enviadas que aún no tienen archivo. Espera como mucho `wait` segundos."""
    manifest = load_manifest()
    pending = {n: m["task_id"] for n, m in manifest.items()
               if m.get("task_id") and not m.get("file") and not m.get("url") and not m.get("error")
               and (not names or n in names)}
    t0 = time.time()
    while pending:
        for name, tid in list(pending.items()):
            d = call("GET", f"/tasks/{tid}")["data"]
            if d["status"] == "completed":
                url = d["result"]["images"][0]["url"][0]
                dest = OUT / f"{name}.png"
                manifest[name].update(cost=d.get("cost"), credits_cost=d.get("credits_cost"), url=url,
                                      url_expires_at=d["result"]["images"][0].get("expires_at"))
                try:
                    with urllib.request.urlopen(url, timeout=120) as r:
                        Image.open(io.BytesIO(r.read())).save(dest)
                    manifest[name]["file"] = dest.name
                    print(f"{name:11s} lista    {dest.relative_to(ROOT)}  coste={d.get('cost')} $")
                except OSError as e:
                    # Algunas redes bloquean el servidor de imágenes: se guarda el enlace (dura 24 h)
                    # para descargarlo a mano como assets/apimart/<hoja>.png (o .jpg).
                    print(f"{name:11s} generada, pero no se pudo descargar ({e}); enlace en manifest.json")
                save_manifest(manifest)
                del pending[name]
            elif d["status"] in ("failed", "cancelled"):
                manifest[name]["error"] = d.get("error")
                save_manifest(manifest)
                print(f"{name:11s} {d['status']}: {d.get('error')}")
                del pending[name]
        if not pending or time.time() - t0 > wait:
            break
        time.sleep(8)
    for name in pending:
        print(f"{name:11s} sigue en curso; vuelve a ejecutar con --fetch")


if __name__ == "__main__":
    args = sys.argv[1:]
    if args[:1] == ["--fetch"]:
        fetch(args[1:])
    else:
        OUT.mkdir(parents=True, exist_ok=True)
        submit(args or list(SHEETS))
        fetch(args or list(SHEETS))
