#!/bin/sh
# Assembles src/ into launch-lab.html (the web artifact), then wraps it for the Android app.
cd "$(dirname "$0")"
{
  cat src/head.html
  echo '<script>'
  echo '(() => {'
  cat src/content.js src/gen.js src/scenes.js src/app.js
  echo '})();'
  echo '</script>'
} > launch-lab.html
echo "Wrote launch-lab.html ($(wc -c < launch-lab.html) bytes)"
./build-web.sh
