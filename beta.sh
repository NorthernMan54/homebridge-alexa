#! /bin/sh

npm audit
npm audit fix
#if npm audit; then
  npm run-script document
  rm *orig* *toc\.*
  git add .
  # npm version patch -m "$1" --force
  npm version prerelease --preid beta -m "$1" --force
  npm publish --tag beta
  git commit -m "$1"
  git push origin beta --tags
#else
#  echo "Not publishing due to security vulnerabilites"
#fi