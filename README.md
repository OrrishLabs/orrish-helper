# Helper to orrish-core

This React project is used to generate the html file that will be consumed by orrish-core. 
Generated html file is used to show available steps and is served by FitNesse itself.

## Building locally
1. Run ```npm install``` 
2. In ```App.tsx```, uncomment to use the hardcoded React states. Alternatively, you can also copy the <area>.json files from orrish-core and place under public/files folder.
3. Run```npm start```
## Using in orrish-core
1. Run ```npm run build```
2. Download orrish-core project and run the fitnesse server there. 
3. Transfer the contents of the build (step 1 above) to ```orrish-core/FitNesseRoot/files```
4. Run FitNesse administration update url page to update the url.
5. Click the bottom link in FitNesse to see the available steps.
