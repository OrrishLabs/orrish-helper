# Helper to FitNesse based project

This React project is used to generate the html file that will be consumed by FitNesse based automation project.
Generated html file is used to show available steps and is served by FitNesse itself.
This is helpful for QA to see the available methods to be used in FitNesse while writing a codeless test in FitNesse.

## Building locally

1. Run ```npm install```
2. In ```App.tsx```, uncomment to use the hardcoded React states. Alternatively, you can also create the ```all-steps.json``` and individual ```.json``` files as explained below
   and place under public/files folder.
3. Run```npm start```

## Using in FitNesse based project

1. Run ```npm run build```
2. Create a FitNesse based automation project and run the fitnesse server.
3. Transfer the contents of the build (step 1 above) to ```<project_location>/FitNesseRoot/files```
    1. Create a file called ```all-steps.json``` with content like
   ```json
      {
        "steps": [
            "api-steps.json",
            "browser-steps.json",
            "mobile-steps.json",
            "setup-steps.json",
            "database-steps.json",
            "general-steps.json",
            "report-steps.json"
        ]
      }
   ```
    2. Create individual json corresponding to each area defined above. e.g. ```browser-steps.json``` may have content in the
       below format.
    ```json
   [
       {
         "id":1,
         "step":"|Launch browser and navigate to |http://someurl.com|","help":""
       },
       {
         "id":2,
         "step":"|Click |Login|","help":"This will click on first element which has this text or locator."
       }
   ]
    ```
4. Go to ```http://<FitNesse server>:<port>/files/index.html``` to see the steps.
5. To update steps, you have to go to ```<project_location>/FitNesseRoot/files/<your_area>.json```
