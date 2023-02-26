# Helper to FitNesse based project

This React project is used to generate the html file that will be consumed by FitNesse based automation project. Generated html file is used to show available steps and is served by FitNesse itself.
This is helpful for QA to see the available methods to be used in FitNesse while writing a codeless test in FitNesse.

## Building locally

1. Run `npm install`
2. Run `npm start`
3. In prod, the steps are read from and written to local file system. In development environment, sessionStorage is used instead of file system.

## Using in FitNesse based project

1. Run `npm run build`
2. Create a FitNesse based automation project and run the fitnesse server.
3. Transfer the contents of the build (step 1 above) to `<project_location>/FitNesseRoot/files`
4. Create a file called `all-steps.json` with content like
    ```json
    {
        "generic": [
            "generic-api-steps.json",
            "generic-browser-steps.json",
            "generic-mobile-steps.json",
            "generic-setup-steps.json",
            "generic-database-steps.json",
            "generic-general-steps.json",
            "generic-report-steps.json"
        ]
    }
    ```
5. Create individual json corresponding to each area defined above. e.g. `generic-browser-steps.json` may have content in the below format.
    ```json
    [
        {
            "id": 1,
            "step": "|Launch browser and navigate to |http://someurl.com|",
            "help": ""
        },
        {
            "id": 2,
            "step": "|Click |Login|",
            "help": "This will click on first element which has this text or locator."
        }
    ]
    ```
6. Go to `http://<FitNesse server>:<port>/files/index.html` to see the steps.
