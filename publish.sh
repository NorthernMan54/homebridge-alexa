#! /bin/sh

if ~/npm/bin/nsp check --filter 2; then
  npm run-script document
  git add .
  git commit -m "$1"
  #git push origin master --tags
  npm version patch
  git push origin master --tags
  npm publish
else
  echo "Not publishing due to security vulnerabilites"
fi
