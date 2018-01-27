git add .
git commit -m "$1"
git push origin master --tags

npm install
npm run-script package
npm run-script publish
