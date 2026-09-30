#!/usr/bin/env python3
"""Anima ilustraciones de Lampi con Seedance 2.5 (APIMart), con primer y último fotograma.

Uso (desde la raíz del repo):
    APIMART_API_KEY=sk-... python3 tools/apimart_video.py              # todos los vídeos
    APIMART_API_KEY=sk-... python3 tools/apimart_video.py fondo-hogar  # solo uno
    APIMART_API_KEY=sk-... python3 tools/apimart_video.py --fetch      # recoger los enviados

- fondo-hogar: bucle perfecto (primer fotograma = último) del fondo de la home.
- lumi-vuelve: del prado vacío a Lampi sonriendo en el claro (fotograma compuesto a mano).
Los fotogramas están en assets/apimart/video-frames/. Registro en assets/apimart/videos.json;
los vídeos se descargan en assets/apimart/<nombre>.mp4 (si la red lo permite; si no, el
enlace queda en el registro durante 24 h). Para la app: tools/encode_videos.sh.
"""
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FRAMES = ROOT / "assets" / "apimart" / "video-frames"
OUT = ROOT / "assets" / "apimart"
LOG = OUT / "videos.json"
API = "https://api.apimart.ai/v1"

STYLE = (
    "Soft cozy 2D painterly animation, Studio Ghibli inspired, gentle and dreamy, keep the exact art style, "
    "colours and composition of the images. Camera completely static, no zoom, no pan. No text."
)

JOBS = {
    "fondo-hogar": {
        "first": "fondo-hogar.jpg",
        "last": "fondo-hogar.jpg",
        "duration": 6,
        "resolution": "1080p",
        "prompt": (
            "A magical calm night meadow comes alive in a seamless loop: many glowing amber fireflies drift slowly "
            "and lazily in soft curving paths and twinkle, stars twinkle gently, the lavender mist and clouds flow "
            "very slowly, grass and flowers sway softly in a light breeze, the glowing mushrooms pulse softly, "
            "the warm window of the little burrow flickers like candlelight. No characters appear. " + STYLE
        ),
    },
    "lumi-vuelve": {
        "first": "fondo-hogar.jpg",
        "last": "lumi-llega.jpg",
        "duration": 5,
        "resolution": "1080p",
        "prompt": (
            "Lampi, the tiny round lavender light spirit with two glowing amber antennae and a glowing belly, comes "
            "home from an adventure: she floats down from the starry sky like a little falling star, trailing golden "
            "sparkles, while the fireflies swirl around to welcome her, lands softly on the grass of the clearing "
            "with a small squishy bounce, then raises her little arms and smiles with a big happy face, her light "
            "glowing brighter. Joyful, tender, magical. " + STYLE
        ),
    },
}


def key():
    return os.environ.get("APIMART_API_KEY") or Path("~/.apimart_key").expanduser().read_text().strip()


def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method,
                                 data=json.dumps(body).encode() if body else None,
                                 headers={"Authorization": f"Bearer {key()}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.load(r)


def data_uri(name):
    return "data:image/jpeg;base64," + base64.b64encode((FRAMES / name).read_bytes()).decode()


def host(name, log):
    """Seedance solo acepta fotogramas por URL pública. APIMart no tiene subida de archivos,
    así que se pide a Seedream una copia idéntica del fotograma: su resultado queda en una
    URL pública durante 24 h. Se reutiliza mientras no caduque."""
    cache = log.setdefault("_hosted", {})
    c = cache.get(name)
    if c and c["expires_at"] > time.time() + 3600:
        return c["url"]
    body = {"model": "seedream-5-0-lite", "size": "9:16", "resolution": "2K", "n": 1,
            "prompt": "Return exactly the same image with no changes at all: identical composition, characters, "
                      "colours, style and details.",
            "image_urls": [data_uri(name)], "watermark": False}
    tid = call("POST", "/images/generations", body)["data"][0]["task_id"]
    for _ in range(40):
        time.sleep(5)
        d = call("GET", f"/tasks/{tid}")["data"]
        if d["status"] == "completed":
            img = d["result"]["images"][0]
            cache[name] = {"url": img["url"][0], "expires_at": img.get("expires_at", time.time() + 86400),
                           "cost": d.get("cost")}
            save(log)
            print(f"   fotograma {name} alojado")
            return cache[name]["url"]
        if d["status"] in ("failed", "cancelled"):
            raise RuntimeError(f"no se pudo alojar {name}: {d.get('error')}")
    raise TimeoutError(f"alojar {name} tarda demasiado")


def load():
    return json.loads(LOG.read_text()) if LOG.exists() else {}


def save(m):
    LOG.write_text(json.dumps(m, ensure_ascii=False, indent=2))


def submit(names):
    log = load()
    for name in names:
        j = JOBS[name]
        body = {
            "model": "seedance-2.5",
            "prompt": j["prompt"],
            "duration": j["duration"],
            "resolution": j["resolution"],
            "size": "adaptive",  # con primer/último fotograma sigue la proporción de la imagen (9:16)
            "generate_audio": False,
            "watermark": False,
            "image_with_roles": [
                {"url": host(j["first"], log), "role": "first_frame"},
                {"url": host(j["last"], log), "role": "last_frame"},
            ],
        }
        try:
            tid = call("POST", "/videos/generations", body)["data"][0]["task_id"]
            print(f"{name:12s} enviado  {tid}")
        except urllib.error.HTTPError as e:
            print(f"{name:12s} ERROR {e.code}: {e.read().decode()[:400]}")
            tid = None
        log[name] = {k: v for k, v in j.items()} | {"task_id": tid}
        save(log)


def fetch(names=None, wait=170):
    log = load()
    pending = {n: m["task_id"] for n, m in log.items()
               if not n.startswith("_") and m.get("task_id") and not m.get("url") and not m.get("error") and (not names or n in names)}
    t0 = time.time()
    while pending:
        for name, tid in list(pending.items()):
            d = call("GET", f"/tasks/{tid}")["data"]
            if d["status"] == "completed":
                res = d.get("result", {})
                items = res.get("videos") or res.get("images") or []
                url = items[0]["url"][0] if isinstance(items[0]["url"], list) else items[0]["url"]
                log[name].update(url=url, cost=d.get("cost"))
                dest = OUT / f"{name}.mp4"
                try:
                    with urllib.request.urlopen(url, timeout=150) as r:
                        dest.write_bytes(r.read())
                    log[name]["file"] = dest.name
                    print(f"{name:12s} listo    {dest.relative_to(ROOT)}  coste={d.get('cost')} $")
                except OSError as e:
                    print(f"{name:12s} generado, sin descarga ({e}); enlace en videos.json")
                save(log)
                del pending[name]
            elif d["status"] in ("failed", "cancelled"):
                log[name]["error"] = d.get("error")
                save(log)
                print(f"{name:12s} {d['status']}: {d.get('error')}")
                del pending[name]
            else:
                print(f"{name:12s} {d['status']} {d.get('progress', '')}%")
        if not pending or time.time() - t0 > wait:
            break
        time.sleep(10)


if __name__ == "__main__":
    args = sys.argv[1:]
    if args[:1] == ["--fetch"]:
        fetch(args[1:])
    else:
        submit(args or list(JOBS))
        fetch(args or list(JOBS), wait=30)
