#!/usr/bin/env python3
"""Sintetiza los efectos de sonido de Lampi (app/assets/sounds/*.wav).

Son campanitas suaves hechas con senos y una envolvente de decaimiento: sin
samples externos, sin licencias y de pocos KB. Se regeneran con:

    python3 tools/make_sounds.py
"""
from pathlib import Path
import wave

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "app" / "assets" / "sounds"

# Notas (Hz) de una escala pentatónica de Do mayor: nada suena mal junto.
C5, D5, E5, G5, A5, C6, E6, G6 = 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1318.5, 1568.0


def bell(freq, dur, gain=1.0, decay=7.0, attack=0.004):
    """Campanilla: fundamental + armónicos inarmónicos que se apagan antes."""
    t = np.arange(int(SR * dur)) / SR
    wave_ = (
        np.sin(2 * np.pi * freq * t)
        + 0.35 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t * decay * 0.6)
        + 0.12 * np.sin(2 * np.pi * freq * 3.98 * t) * np.exp(-t * decay * 1.2)
    )
    env = np.exp(-t * decay) * np.minimum(1.0, t / attack)
    return gain * wave_ * env


def mix(parts, total):
    out = np.zeros(int(SR * total))
    for start, sig in parts:
        i = int(SR * start)
        n = min(len(sig), len(out) - i)
        out[i : i + n] += sig[:n]
    return out


def glide(f0, f1, dur, gain=1.0, decay=3.0):
    """Barrido suave de frecuencia (la llegada de Lampi)."""
    t = np.arange(int(SR * dur)) / SR
    freq = f0 + (f1 - f0) * (t / dur) ** 1.5
    phase = 2 * np.pi * np.cumsum(freq) / SR
    env = np.sin(np.pi * np.minimum(1.0, t / dur)) ** 0.7 * np.exp(-t * decay * 0.4)
    return gain * (np.sin(phase) + 0.25 * np.sin(2 * phase)) * env


SOUNDS = {
    # Tocar a Lampi: un «bip» redondo y corto.
    "tap": mix([(0, bell(G5, 0.22, 0.9, decay=16))], 0.22),
    # Cambiar un valor / elegir: un tic casi imperceptible.
    "select": mix([(0, bell(C6, 0.09, 0.6, decay=40))], 0.09),
    # Guardar, soltar la app, despertar a Lampi: dos notas que suben.
    "success": mix([(0, bell(E5, 0.5, 0.8, decay=7)), (0.1, bell(A5, 0.6, 0.8, decay=6))], 0.7),
    # Abrir/guardar una postal: arpegio con brillo.
    "postcard": mix(
        [(0, bell(C5, 0.8, 0.7, 5)), (0.12, bell(E5, 0.8, 0.7, 5)), (0.24, bell(G5, 0.9, 0.7, 5)), (0.38, bell(C6, 1.2, 0.8, 4))],
        1.6,
    ),
    # Ganar puntos / objeto nuevo: tres chispas rápidas hacia arriba.
    "reward": mix(
        [(0, bell(G5, 0.35, 0.6, 11)), (0.07, bell(C6, 0.35, 0.6, 11)), (0.14, bell(E6, 0.5, 0.7, 9)), (0.22, bell(G6, 0.6, 0.5, 8))],
        0.9,
    ),
    # Lampi vuelve de la expedición: un deslizar cálido y una campanilla.
    "arrival": mix([(0, glide(330, 523, 0.6, 0.55)), (0.5, bell(G5, 0.9, 0.7, 5)), (0.62, bell(C6, 1.0, 0.6, 4.5))], 1.7),
}


def write(name, data):
    data = data / max(1e-9, np.max(np.abs(data))) * 0.55  # margen: nunca satura
    n = len(data)
    fade = min(n // 4, int(SR * 0.02))
    data[-fade:] *= np.linspace(1, 0, fade)  # sin clic al final
    pcm = (data * 32767).astype("<i2")
    path = OUT / f"{name}.wav"
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"{path.name}: {n / SR:.2f}s, {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for key, sig in SOUNDS.items():
        write(key, sig)
