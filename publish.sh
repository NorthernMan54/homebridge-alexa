git add .
git commit -m "$1"
npm version patch
git push origin master --tags
npm publish
