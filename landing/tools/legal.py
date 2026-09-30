"""Genera las páginas legales de la landing a partir de los mismos textos que usa la app.

Uso (desde la raíz del repo): python3 landing/tools/legal.py
Fuente: app/src/legal/i18n/<idioma>.json (y el correo de contacto de app/src/legal/content.json).
Salida: landing/privacidad.html, landing/terminos.html y landing/ayuda.html, con un bloque por
idioma; i18n.js enseña el del navegador.
"""
import json
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "app/src/legal/content.json"
TEXTS = ROOT / "app/src/legal/i18n"
LANGS = ["es", "en", "zh", "hi", "fr"]

# Lo que rodea al texto de cada documento.
CHROME = {
    "es": {"more": "¿Algo más?", "write": "Escríbenos a", "updated": "Última actualización"},
    "en": {"more": "Anything else?", "write": "Write to us at", "updated": "Last updated"},
    "zh": {"more": "还有别的问题？", "write": "写信给我们：", "updated": "最后更新"},
    "hi": {"more": "कुछ और?", "write": "हमें लिखो:", "updated": "आख़िरी अपडेट"},
    "fr": {"more": "Autre chose ?", "write": "Écris-nous à", "updated": "Dernière mise à jour"},
}
OUT = ROOT / "landing"

PAGE = """<!doctype html>
<!-- Generado por landing/tools/legal.py desde app/src/legal/i18n/*.json. No lo edites a mano. -->
<html lang="es-ES">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} · Lampi</title>
<meta name="description" content="{intro}">
<meta name="theme-color" content="#13112E">
{alternates}
<link rel="icon" type="image/png" href="img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,500..800,100,1&family=Figtree:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="styles.css">
<script src="texts.js" defer></script>
<script src="i18n.js" defer></script>
</head>
<body class="legal-page">
<header class="legal-top">
  <a class="wordmark" href="./" aria-label="Lampi, inicio">Lampi</a>
</header>
<main class="wrap narrow legal">
{blocks}
</main>
<footer class="foot">
  <div class="wrap foot-inner">
    <span class="wordmark small">Lampi</span>
    <p><a href="ayuda.html">Ayuda</a> · <a href="privacidad.html">Privacidad</a> · <a href="terminos.html">Términos</a></p>
    <p class="langs" data-langs><a href="?lang=es" hreflang="es" lang="es">Español</a> · <a href="?lang=en" hreflang="en" lang="en">English</a> · <a href="?lang=zh" hreflang="zh-Hans" lang="zh-Hans">中文</a> · <a href="?lang=hi" hreflang="hi" lang="hi">हिन्दी</a> · <a href="?lang=fr" hreflang="fr" lang="fr">Français</a></p>
  </div>
</footer>
</body>
</html>
"""


BLOCK = """  <article data-lang="{lang}" lang="{lang}" data-title="{title} · Lampi"{hidden}>
    <h1>{title}</h1>
    <p class="legal-intro">{intro}</p>
{sections}
{contact}
    <p class="legal-updated">{updated_label}: {updated}</p>
  </article>"""


def block(lang: str, doc: dict, key: str, contact_email: str) -> str:
    chrome = CHROME[lang]
    sections = "\n".join(
        "    <section>\n      <h2>{}</h2>\n{}\n    </section>".format(
            escape(s["heading"]), "\n".join(f"      <p>{escape(p)}</p>" for p in s["body"])
        )
        for s in doc["sections"]
    )
    contact = (
        f'    <section>\n      <h2>{escape(chrome["more"])}</h2>\n      <p>{escape(chrome["write"])} <a href="mailto:{escape(contact_email)}">{escape(contact_email)}</a></p>\n    </section>'
        if key == "ayuda" and contact_email
        else ""
    )
    return BLOCK.format(
        lang=lang,
        hidden="" if lang == "es" else " hidden",
        title=escape(doc["title"]),
        intro=escape(doc["intro"]),
        sections=sections,
        contact=contact,
        updated_label=escape(chrome["updated"]),
        updated=escape(doc["updated"]),
    )


def render(key: str, texts: dict, contact_email: str) -> str:
    es = texts["es"][key]
    return PAGE.format(
        title=escape(es["title"]),
        intro=escape(es["intro"]),
        alternates="\n".join(
            f'<link rel="alternate" hreflang="{h}" href="{key}.html?lang={l}">'
            for h, l in [("es", "es"), ("en", "en"), ("zh-Hans", "zh"), ("hi", "hi"), ("fr", "fr")]
        )
        + f'\n<link rel="alternate" hreflang="x-default" href="{key}.html">',
        blocks="\n".join(block(lang, texts[lang][key], key, contact_email) for lang in LANGS),
    )


def main() -> None:
    contact_email = json.loads(SOURCE.read_text(encoding="utf-8")).get("contactEmail", "")
    texts = {lang: json.loads((TEXTS / f"{lang}.json").read_text(encoding="utf-8")) for lang in LANGS}
    for key in texts["es"]:
        path = OUT / f"{key}.html"
        path.write_text(render(key, texts, contact_email), encoding="utf-8")
        print(f"Escrito {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
