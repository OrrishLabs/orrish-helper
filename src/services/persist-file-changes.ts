async function readFile(fileName: string): Promise<Response> {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        //In development mode.
        let value = sessionStorage.getItem(fileName);
        //This will happen only the first time.
        if (!value && fileName.includes('all-steps')) {
            sessionStorage.setItem(fileName, '{"generic": ["generic-browser-steps.json","generic-api-steps.json"]}');
            sessionStorage.setItem('generic-browser-steps.json', '[{"id": 1,"step": "|Set browser name |Some name|","help": "Sample help."}]');
            sessionStorage.setItem('generic-api-steps.json', '[{"id": 1,"step": "|Set api name |Some name|","help": "Sample help."}]');
            sessionStorage.setItem('sample-browser.json', '[{"id": 1,"step": "|Set suite name |Some name|","help": "Sample help."}]');
            sessionStorage.setItem('sample-mobile.json', '[{"id": 1,"step": "|Set suite name |Some name|","help": "Sample help."}]');
            sessionStorage.setItem('sample-setup-api.json', '[{"id": 1,"step": "|Set suite name |Some name|","help": "Sample help."}]');
            sessionStorage.setItem('sample-api-GET.json', '[{"id": 1,"step": "|Set suite name |Some name|","help": "Sample help."}]');
        }
        value = sessionStorage.getItem(fileName);
        return new Promise((resolve) => {
            resolve(new Response(value));
        });
    } else {
        //In production mode.
        return fetch(window.location.origin + '/files/' + fileName, { cache: 'no-store' });
    }
}

async function deleteFile(fileName: string) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        sessionStorage.removeItem(fileName);
    } else {
        const urlToTrigger = window.location.origin + '/UpdateSteps?suite&format=junit&nohistory&DELETE_FILE=true&FILE_NAME=' + fileName;
        await fetch(urlToTrigger).then((respone) => respone.text());
    }
}

async function renameFile(oldFileName: string, newFileName: string) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        const content = sessionStorage.getItem(oldFileName);
        sessionStorage.removeItem(oldFileName);
        sessionStorage.setItem(newFileName, content);
    } else {
        const urlToTrigger = window.location.origin + '/UpdateSteps?suite&format=junit&nohistory&RENAME_FILE=true&OLD_FILE_NAME=' + oldFileName + '&NEW_FILE_NAME=' + newFileName;
        await fetch(urlToTrigger).then((respone) => respone.text());
    }
}

async function persistFile(fileName: string, suggestionsToCopy: string) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        sessionStorage.setItem(fileName, suggestionsToCopy);
    } else {
        let baseUrlToTrigger = window.location.origin + '/UpdateSteps?suite&format=junit&nohistory&FILE_NAME=' + fileName + '&CONTENT=';
        let values = suggestionsToCopy.match(/(.{1,900})/g);
        for (var i = 0; i < values.length; i++) {
            let urlToTrigger = baseUrlToTrigger + encodeURIComponent('!-' + values[i] + '-!');
            urlToTrigger += i === 0 ? '&CREATE_FILE=true' : '&APPEND_FILE=true';
            await fetch(urlToTrigger).then((respone) => respone.text());
        }
    }
}

export const fileService = {
    persistFile: persistFile,
    readFile: readFile,
    deleteFile: deleteFile,
    renameFile: renameFile
};
