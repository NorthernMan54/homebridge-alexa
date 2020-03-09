#! /bin/sh

#if npm audit; then
  npm run-script document
  rm *orig* *toc\.*
  git add .
  npm version patch -m "$1" --force
  npm publish
  git commit -m "$1"
  git push origin master --tags
#else
  echo "Not publishing due to security vulnerabilites"
#fi
