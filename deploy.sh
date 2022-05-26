#!/usr/bin/env sh

# abort on errors
set -e

# remove dist (including gh-pages git)
rm -rf dist

# build
GITHUB_PAGES=true npm run build

# navigate into the build output directory
cd dist

git init
git checkout -b main
git add -A
git commit -m 'deploy'

git push -f git@github.com:tfoxy/chat-media-manager.git main:gh-pages

cd -
