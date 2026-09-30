#!/usr/bin/env bash
# Prepara los vídeos de Seedance (assets/apimart/*.mp4) para la app (app/assets/video/).
# Uso (desde la raíz del repo): bash tools/encode_videos.sh
# - fondo-hogar: bucle sin corte fundiendo los últimos 0,4 s con el principio, y su
#   primer fotograma como póster (app/assets/images/fondo-hogar-video.jpg).
# - lumi-vuelve: tal cual. (La versión actual lleva además un retoque a mano de la
#   sombra bajo los pies; ver PROCESO.md, sesión 4.)
# H.264 1080×1920 sin audio, con faststart. Requiere ffmpeg.
set -euo pipefail
SRC=assets/apimart
DST=app/assets/video
mkdir -p "$DST"
D=0.4
L=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC/fondo-hogar.mp4")
OFF=$(python3 -c "print(round($L - 2 * $D, 3))")
ffmpeg -v error -y -i "$SRC/fondo-hogar.mp4" -filter_complex \
  "[0:v]split[a][b];[a]trim=start=$D,setpts=PTS-STARTPTS[main];[b]trim=end=$D,setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=$D:offset=$OFF,scale=1080:1920:flags=lanczos,format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -profile:v high -preset slow -crf 24 -movflags +faststart "$DST/fondo-hogar.mp4"
ffmpeg -v error -y -i "$DST/fondo-hogar.mp4" -frames:v 1 -q:v 3 app/assets/images/fondo-hogar-video.jpg
ffmpeg -v error -y -i "$SRC/lumi-vuelve.mp4" -vf "scale=1080:1920:flags=lanczos,format=yuv420p" \
  -an -c:v libx264 -profile:v high -preset slow -crf 23 -movflags +faststart "$DST/lumi-vuelve.mp4"
ls -la "$DST"
