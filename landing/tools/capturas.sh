#!/bin/sh
# Capturas de la App Store (6,9": 1320 × 2868) con titular, en los 5 idiomas.
# Uso: sh landing/tools/capturas.sh
# Entrada: capturas/<idioma>/<n>.png, las del simulador del iPhone 17 Pro Max con el idioma puesto
#   (1 Hogar, 2 postal nocturna, 3 escudo, 4 Colección, 5 resumen semanal).
# Salida: capturas/<idioma>/tienda/<n>.png, listas para subir. Los titulares están en capturas.html.
DIR="$(cd "$(dirname "$0")/../.." && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
for lang in es en zh hi fr; do
  for n in 1 2 3 4 5; do
    [ -f "$DIR/capturas/$lang/$n.png" ] || { echo "Falta capturas/$lang/$n.png"; continue; }
    mkdir -p "$DIR/capturas/$lang/tienda"
    "$CHROME" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
      --force-device-scale-factor=1 --window-size=1320,2868 --virtual-time-budget=5000 \
      --screenshot="$DIR/capturas/$lang/tienda/$n.png" \
      "file://$DIR/landing/tools/capturas.html?lang=$lang&n=$n" >/dev/null 2>&1
    echo "capturas/$lang/tienda/$n.png"
  done
done
