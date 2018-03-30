npm version patch
git add .
git commit -m "$1"
git push origin master --tags
npm publish
