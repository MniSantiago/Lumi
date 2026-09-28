#!/usr/bin/env python3
"""Genera el icono de la app, el icono adaptativo de Android, el splash y el favicon.

Uso (desde la raíz del repo):  python3 tools/make_icons.py [carpeta_preview]

Composición del icono (1024×1024, opaco, sRGB):
- Fondo: noche en degradado (índigo #2A2560 arriba → #13112E abajo) con una
  viñeta suave y unas pocas estrellas tenues en la parte alta, lejos de Lumi.
- Detrás de Lumi, un resplandor ámbar radial (#FFC96B → #FFE3A3 en el centro)
  a la altura de la barriga: su luz es el mensaje de la app.
- Lumi "contenta" (recorte de alta resolución de la web), grande y algo baja,
  porque sus ojos grandes son lo que se lee a 60 px. Las antenas quedan dentro
  del margen de la máscara redondeada de iOS.
Todo se hace con Pillow + numpy para que sea reproducible.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "app" / "assets" / "images"
LUMI = ROOT / "assets" / "web" / "lumi-recorte.png"  # contenta, 1385×1556, transparente

S = 1024  # lado de los PNG

# Paleta (PROCESO.md §4)
NOCHE = (0x1B, 0x18, 0x40)
NOCHE_HONDA = (0x13, 0x11, 0x2E)
INDIGO = (0x2A, 0x25, 0x60)
AMBAR = (0xFF, 0xC9, 0x6B)
AMBAR_CLARO = (0xFF, 0xE3, 0xA3)
LAVANDA_CLARO = (0xE6, 0xE0, 0xFB)
VIOLETA = (0x8C, 0x7B, 0xD8)


def rgba_f(img: Image.Image) -> np.ndarray:
    return np.asarray(img.convert("RGBA")).astype(np.float32) / 255


def to_img(arr: np.ndarray) -> Image.Image:
    return Image.fromarray((np.clip(arr, 0, 1) * 255 + 0.5).astype(np.uint8))


def over(dst: np.ndarray, src: np.ndarray) -> np.ndarray:
    """Composición "source over" con alfa recta (no premultiplicada)."""
    sa, da = src[..., 3:4], dst[..., 3:4]
    oa = sa + da * (1 - sa)
    rgb = (src[..., :3] * sa + dst[..., :3] * da * (1 - sa)) / np.maximum(oa, 1e-6)
    return np.concatenate([rgb, oa], axis=-1)


def grid():
    y, x = np.mgrid[0:S, 0:S].astype(np.float32)
    return x / S, y / S


def night_background() -> np.ndarray:
    """Degradado vertical de noche con viñeta; opaco."""
    x, y = grid()
    top, bottom = np.array(INDIGO) / 255, np.array(NOCHE_HONDA) / 255
    t = np.clip(y * 1.05, 0, 1)[..., None] ** 0.9
    rgb = top * (1 - t) + bottom * t
    # Viñeta: oscurece las esquinas para centrar la mirada en Lumi.
    d = np.sqrt((x - 0.5) ** 2 + (y - 0.52) ** 2)[..., None]
    rgb *= 1 - 0.25 * np.clip((d - 0.35) / 0.4, 0, 1)
    return np.concatenate([rgb, np.ones_like(rgb[..., :1])], axis=-1)


def radial_glow(cx, cy, r, color, strength, core=None) -> np.ndarray:
    """Resplandor radial con caída suave (gaussiana); cx, cy, r en fracción de S."""
    x, y = grid()
    d2 = ((x - cx) ** 2 + (y - cy) ** 2) / r**2
    a = strength * np.exp(-d2 * 2.2)
    rgb = np.broadcast_to(np.array(color, np.float32) / 255, (S, S, 3)).copy()
    if core is not None:  # centro más claro, casi crema
        k = np.exp(-d2 * 6)[..., None]
        rgb = rgb * (1 - k) + np.array(core, np.float32) / 255 * k
    return np.concatenate([rgb, a[..., None]], axis=-1)


def stars() -> np.ndarray:
    """Pocas estrellas, tenues y grandes (a 60 px las pequeñas desaparecen)."""
    # (x, y, radio, intensidad): solo en la franja alta y los laterales.
    pts = [(120, 150, 8, 0.9), (900, 120, 10, 0.95), (935, 380, 5, 0.6),
           (80, 430, 5, 0.55), (520, 50, 4, 0.5)]
    arr = np.zeros((S, S, 4), np.float32)
    x, y = np.mgrid[0:S, 0:S].astype(np.float32)[::-1]
    for px, py, r, k in pts:
        d2 = ((x - px) ** 2 + (y - py) ** 2) / r**2
        a = k * (np.exp(-d2 * 1.5) + 0.25 * np.exp(-d2 * 0.08))
        # destello en cruz, muy corto
        cross = np.exp(-(((x - px) / (r * 3.2)) ** 2) - ((y - py) / (r * 0.35)) ** 2) \
            + np.exp(-(((y - py) / (r * 3.2)) ** 2) - ((x - px) / (r * 0.35)) ** 2)
        arr[..., 3] = np.maximum(arr[..., 3], np.clip(a + 0.6 * k * cross, 0, 1))
    arr[..., :3] = np.array(LAVANDA_CLARO, np.float32) / 255
    return arr


def place_lumi(width_frac: float, top_frac: float) -> tuple[np.ndarray, tuple]:
    """Lumi escalada a width_frac·S de ancho, con su borde superior en top_frac·S."""
    lumi = Image.open(LUMI).convert("RGBA")
    w = round(S * width_frac)
    h = round(lumi.height * w / lumi.width)
    lumi = lumi.resize((w, h), Image.LANCZOS)
    canvas = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    x0, y0 = (S - w) // 2, round(S * top_frac)
    canvas.alpha_composite(lumi, (x0, y0))
    return rgba_f(canvas), (x0, y0, w, h)


def lumi_layers(width_frac, top_frac, glow=1.0):
    """Resplandor ámbar + Lumi, sobre transparente (se reutiliza en todos los PNG)."""
    lumi, (x0, y0, w, h) = place_lumi(width_frac, top_frac)
    cx = (x0 + w / 2) / S
    belly_y = (y0 + h * 0.62) / S
    out = np.zeros((S, S, 4), np.float32)
    # Halo amplio y cálido, y otro más concentrado detrás de la barriga.
    # El halo amplio va en violeta (no ensucia la noche de marrón) y el ámbar
    # queda concentrado cerca del cuerpo, como si la luz saliera de la barriga.
    out = over(out, radial_glow(cx, belly_y - 0.06, width_frac * 0.95, VIOLETA, 0.22 * glow))
    out = over(out, radial_glow(cx, belly_y, width_frac * 0.62, AMBAR, 0.42 * glow, core=AMBAR_CLARO))
    # Luz alrededor de los orbes de las antenas (medidos en el recorte:
    # x ≈ 0.31 y 0.68 del ancho, y ≈ 0.15 del alto).
    for fx in (0.31, 0.68):
        ox, oy = (x0 + w * fx) / S, (y0 + h * 0.15) / S
        out = over(out, radial_glow(ox, oy, width_frac * 0.16, AMBAR, 0.6 * glow, core=AMBAR_CLARO))
    # Los halos se apagan del todo antes del borde: en las capas transparentes
    # (splash, primer plano de Android) no debe verse el cuadrado del lienzo.
    x, y = grid()
    d = np.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2)
    out[..., 3] *= np.clip((0.5 - d) / 0.12, 0, 1)
    out = over(out, lumi)
    return out, lumi


def save_rgb(arr, path, size=None):
    img = to_img(arr[..., :3]).convert("RGB")
    if size:
        img = img.resize((size, size), Image.LANCZOS)
    img.save(path, optimize=True)
    return img


def save_rgba(arr, path):
    img = to_img(arr)
    img.save(path, optimize=True)
    return img


def main():
    preview_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else None

    # --- Icono de iOS / genérico: opaco -----------------------------------
    bg = night_background()
    bg = over(bg, stars())
    # Lumi muy grande: los pies se salen un poco por abajo y la cara gana
    # tamaño, que es lo que tiene que leerse a 60 px.
    fg, _ = lumi_layers(width_frac=0.82, top_frac=0.10)
    icon = over(bg, fg)
    icon_img = save_rgb(icon, IMG / "icon.png")

    # --- Android adaptativo ------------------------------------------------
    # Primer plano: Lumi dentro de la zona segura (círculo de 66 % ≈ 676 px).
    # Con 0.50 de ancho, Lumi mide ~512×575 px y cabe en ese círculo.
    afg, alumi = lumi_layers(width_frac=0.50, top_frac=0.215)
    save_rgba(afg, IMG / "android-icon-foreground.png")
    save_rgb(over(night_background(), stars()), IMG / "android-icon-background.png")
    # Monocromo: silueta blanca de Lumi (el alfa opaco del cuerpo, sin halo).
    a = np.clip((alumi[..., 3] - 0.55) / 0.35, 0, 1)
    # Engorda un poco la silueta para que los tallos de las antenas no se corten.
    a = np.asarray(to_img(a).filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(1.5))).astype(np.float32) / 255
    # Ojos calados: los píxeles oscuros de la cara (iris marrón) quedan
    # transparentes, así la silueta sigue siendo Lumi y no una mancha.
    lum = alumi[..., :3] @ np.array([0.299, 0.587, 0.114], np.float32)
    eyes = (lum < 0.42) & (alumi[..., 3] > 0.9)
    # Solo en la franja de los ojos (entre el 28 % y el 52 % del alto de Lumi),
    # para no calar la boca ni las sombras de los pies.
    rows = np.where(alumi[..., 3].max(axis=1) > 0.5)[0]
    top, h = rows[0], rows[-1] - rows[0]
    band = np.zeros_like(eyes)
    band[int(top + 0.28 * h):int(top + 0.52 * h)] = True
    eyes &= band
    # Cierre morfológico: los brillos blancos del iris no dejan islas dentro.
    eyes = np.asarray(to_img(eyes.astype(np.float32)).filter(ImageFilter.MaxFilter(17))
                      .filter(ImageFilter.MinFilter(13)).filter(ImageFilter.GaussianBlur(1.5))).astype(np.float32) / 255
    a = a * (1 - eyes)
    mono = np.zeros((S, S, 4), np.float32)
    mono[..., :3] = 1
    mono[..., 3] = a
    save_rgba(mono, IMG / "android-icon-monochrome.png")

    # --- Splash: Lumi con un halo suave, transparente ----------------------
    sfg, _ = lumi_layers(width_frac=0.62, top_frac=0.14, glow=0.8)
    save_rgba(sfg, IMG / "splash-icon.png")

    # --- Favicon web -------------------------------------------------------
    icon_img.resize((48, 48), Image.LANCZOS).save(IMG / "favicon.png", optimize=True)

    # --- Hoja de prueba: el icono a 180, 120 y 60 px (con máscara redondeada)
    if preview_dir:
        sheet = Image.new("RGB", (1680, 1024 + 80), (40, 40, 48))
        # Fondo claro a la derecha para ver el icono sobre un fondo de pantalla claro.
        sheet.paste((225, 222, 235), (1064, 560, sheet.width, sheet.height))
        sheet.paste(icon_img, (40, 40))
        x = 1064 + 20
        for size in (180, 120, 60):
            small = icon_img.resize((size, size), Image.LANCZOS)
            mask = Image.new("L", (size * 4, size * 4), 0)
            from PIL import ImageDraw
            ImageDraw.Draw(mask).rounded_rectangle((0, 0, size * 4 - 1, size * 4 - 1), radius=int(size * 4 * 0.225), fill=255)
            mask = mask.resize((size, size), Image.LANCZOS)
            for yy in (60, 620):
                sheet.paste(small, (x, yy), mask)
            x += size + 30
        # Android: primer plano sobre fondo, recortado en círculo.
        ad = over(over(night_background(), stars()), afg)
        ad_img = to_img(ad[..., :3]).resize((180, 180), Image.LANCZOS)
        cm = Image.new("L", (720, 720), 0)
        from PIL import ImageDraw
        ImageDraw.Draw(cm).ellipse((0, 0, 719, 719), fill=255)
        sheet.paste(ad_img, (1084, 300), cm.resize((180, 180), Image.LANCZOS))
        mono_img = Image.open(IMG / "android-icon-monochrome.png").resize((120, 120), Image.LANCZOS)
        sheet.paste((70, 70, 90), (1300, 330, 1420, 450))
        sheet.paste(mono_img, (1300, 330), mono_img)
        splash = Image.open(IMG / "splash-icon.png").resize((180, 180), Image.LANCZOS)
        sheet.paste(NOCHE, (1450, 300, 1630, 480))
        sheet.paste(splash, (1450, 300), splash)
        fav = Image.open(IMG / "favicon.png")
        sheet.paste(fav, (1084, 900))
        preview_dir.mkdir(parents=True, exist_ok=True)
        sheet.save(preview_dir / "icon-preview.png")


if __name__ == "__main__":
    main()
