async function getSampleSteps(area: string) {

    let fileName = 'sample-' + (area.includes('Setup') ? 'setup-' : '');
    fileName += area.toLowerCase().includes('browser')
        ? 'browser.json'
        : area.toLowerCase().includes('mobile')
            ? 'mobile.json'
            : area.toLowerCase().includes('api')
                ? 'api.json'
                : area.toLowerCase().includes('database')
                    ? 'database.json'
                    : area.toLowerCase().includes('general')
                        ? 'general.json'
                        : '';

    fileName += area.includes('GET')
        ? 'GET.json'
        : area.includes('POST')
            ? 'POST.json'
            : area.includes('PUT')
                ? 'PUT.json'
                : area.includes('DELETE')
                    ? 'DELETE.json'
                    : '';

    if ((fileName.split('.json').length - 1) === 2) {
        fileName = fileName.replace('.json', '-');
    }


    const currentOrigin = window.location.origin;
    const response = await fetch(currentOrigin + '/files/' + fileName, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    const body = await response.json();
    return body;
}

export const sampleStepsService = {
    getSampleSteps
}
