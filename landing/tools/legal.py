"""Genera las páginas legales de la landing a partir de los mismos textos que usa la app.

Uso (desde la raíz del repo): python3 landing/tools/legal.py
Fuente: app/src/legal/content.json. Salida: landing/privacidad.html y landing/terminos.html.
"""
import json
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "app/src/legal/content.json"
OUT = ROOT / "landing"

PAGE = """<!doctype html>
<!-- Generado por landing/tools/legal.py desde app/src/legal/content.json. No lo edites a mano. -->
<html lang="es-ES">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} · Lumi</title>
<meta name="description" content="{intro}">
<meta name="theme-color" content="#13112E">
<link rel="icon" type="image/png" href="img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,500..800,100,1&family=Figtree:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="styles.css">
</head>
<body class="legal-page">
<header class="legal-top">
  <a class="wordmark" href="./" aria-label="Lumi, inicio">Lumi</a>
</header>
<main class="wrap narrow legal">
  <h1>{title}</h1>
  <p class="legal-intro">{intro}</p>
{sections}
  <p class="legal-updated">Última actualización: {updated}</p>
</main>
<footer class="foot">
  <div class="wrap foot-inner">
    <span class="wordmark small">Lumi</span>
    <p><a href="privacidad.html">Privacidad</a> · <a href="terminos.html">Términos</a></p>
  </div>
</footer>
</body>
</html>
"""


def render(doc: dict) -> str:
    sections = "\n".join(
        "  <section>\n    <h2>{}</h2>\n{}\n  </section>".format(
            escape(s["heading"]), "\n".join(f"    <p>{escape(p)}</p>" for p in s["body"])
        )
        for s in doc["sections"]
    )
    return PAGE.format(
        title=escape(doc["title"]),
        intro=escape(doc["intro"]),
        updated=escape(doc["updated"]),
        sections=sections,
    )


def main() -> None:
    docs = json.loads(SOURCE.read_text(encoding="utf-8"))
    for key, doc in docs.items():
        path = OUT / f"{key}.html"
        path.write_text(render(doc), encoding="utf-8")
        print(f"Escrito {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
