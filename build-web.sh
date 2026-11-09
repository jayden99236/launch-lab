#!/bin/sh
# Wraps launch-lab.html into standalone pages:
#   android/app/src/main/assets/index.html  (bundled in the app)
#   docs/index.html                         (GitHub Pages, adds a download footer)
cd "$(dirname "$0")"
REPO_URL="https://github.com/jayden99236/launch-lab"
head_html() {
cat <<'H'
<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Launch Lab: a physics learning game for grades 8 to 12 with lessons, simulations and adaptive difficulty.">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
</head><body>
H
}
mkdir -p android/app/src/main/assets docs
{ head_html; cat launch-lab.html; echo '</body></html>'; } > android/app/src/main/assets/index.html
{
  head_html; cat launch-lab.html
  cat <<F
<footer class="site-foot"><div><span class="label">Launch Lab</span> · free and open source</div><div class="site-links"><a class="btn small primary" href="$REPO_URL/releases/latest/download/LaunchLab.apk">Download the Android app</a><a class="btn small" href="$REPO_URL">Source on GitHub</a></div></footer>
<style>.site-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;border-top:1px solid var(--line);background:var(--card);padding-block:14px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));color:var(--muted);font-size:13px}.site-links{display:flex;gap:8px;flex-wrap:wrap}.site-foot a{text-decoration:none;color:inherit}.site-foot a.primary{color:var(--accent-ink)}</style>
F
  echo '</body></html>'
} > docs/index.html
touch docs/.nojekyll
echo "Wrote android assets and docs/index.html"
