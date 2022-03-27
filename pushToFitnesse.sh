FILE_LOCATION=~/FitNesseRoot/files
npm run build
cp -rf build/* $FILE_LOCATION/
sed -i "" "s|/static/|static/|g" $FILE_LOCATION/index.html 
