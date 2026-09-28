#!/bin/sh
# Capturas de la landing con Chrome headless. Uso: sh landing/tools/shoot.sh [carpeta_salida]
# El móvil se captura dentro de tools/frame.html porque Chrome headless no baja de 500 px de ancho.
DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$DIR/preview}"
mkdir -p "$OUT"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
shot() { "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor="$3" --window-size="$2" --virtual-time-budget=4000 --screenshot="$OUT/$1" "$4" >/dev/null 2>&1; }
shot mobile-top.png 500,844 2 "file://$DIR/tools/frame.html?w=390&h=844"
shot mobile-full.png 500,9800 1 "file://$DIR/tools/frame.html?w=390&h=9800"
shot desktop-top.png 1440,900 1 "file://$DIR/index.html"
shot desktop-full.png 1440,8200 1 "file://$DIR/index.html"
python3 "$DIR/tools/crop.py" "$OUT"
ls -la "$OUT"
