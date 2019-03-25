#! /bin/sh

if npm audit; then
  rm *orig* *toc\.*
  npm run-script document
  git add .
  npm version patch -m "$1" --force
  npm publish
  git commit -m "$1"
  git push origin master --tags
else
  echo "Not publishing due to security vulnerabilites"
fi
