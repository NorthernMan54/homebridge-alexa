if [ -n "$1" ]
then
  echo "Publishing commit $1"
  #npm version patch
  git commit -m "$1"
  git push origin master --tags
fi

npm install
echo "ERROR 12 is normal, just means no changes"
npm run-script package
npm run-script publish
