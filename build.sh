#! /bin/bash

# Formats files, downloads and checks coverage for tachyons

rm -rf public/tachyons.min.css

prettier-standard

curl -q https://cdn.jsdelivr.net/npm/tachyons/css/tachyons.min.css > tachyons.min.css

purgecss --css ./tachyons.min.css --content public/index.html --output public

rm -rf tachyons.min.css
