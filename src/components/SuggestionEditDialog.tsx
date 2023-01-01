import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import EditableTable from './EditableTable';
import { Step } from '../model/step.model';
import { useEffect, useState } from 'react';
import { CircularProgress, TextField, Tooltip } from '@mui/material';
import { Delete, Edit, SaveOutlined } from '@mui/icons-material';

function SuggestionEditDialog(props: any) {
    const [suggestions, setSuggestions] = useState<Step[]>([]);
    const [newAreaTextBoxValue, setNewAreaTextValue] = useState('');
    const [saveClicked, setSaveClicked] = useState(false);

    let suggestionsToCopy: Step[] = [];
    let currentOrigin = window.location.origin;

    useEffect(() => {
        setSuggestions(props.suggestions);
    }, [props]);

    const updateSuggestions = (data: Step[]) => {
        suggestionsToCopy = data;
    };

    const handleClose = () => {
        props.closeDialog('', []);
    };

    const handleOnChange = (event) => {
        setNewAreaTextValue(event.target.value);
    };

    const validateNewName = (e) => {
        const validChars = new RegExp('[0-9a-zA-Z_]');
        if (!validChars.test(e.key)) {
            e.preventDefault();
        }
    };

    const copyOrSave = (type: string) => {
        suggestionsToCopy = suggestionsToCopy.length === 0 ? props.suggestions : suggestionsToCopy;
        let index = suggestionsToCopy.find((e) => !e.step.startsWith('|') || !e.step.endsWith('|'));
        if (index) {
            props.setSnackBarErrorMessage('Please correct the steps. All steps should start and end with |');
        } else {
            setSaveClicked(true);
            props.closeDialog(type, suggestionsToCopy);
        }
    };

    const deleteArea = async () => {
        setSaveClicked(true);
        let area = props.area;
        let radio = area + '-' + props.radio;
        await fetch(currentOrigin + '/files/all-steps.json', { cache: 'no-store' })
            .then((response) => {
                return response.json();
            })
            .then(async (data) => {
                let currentArray: string[] = data[area];
                currentArray.splice(currentArray.indexOf(radio), 1);
                if (currentArray.length === 0) {
                    delete data[area];
                }
                let stringified = JSON.stringify(data);
                //First update the all-steps.json by recreating the file
                let urlToTrigger = currentOrigin + '/UpdateSteps?suite&format=junit&nohistory&FILE_NAME=all-steps.json&CONTENT=' + stringified + '&CREATE_FILE=true';
                await fetch(urlToTrigger).then((respone) => respone.text());
                //Next create a file
                urlToTrigger = currentOrigin + '/UpdateSteps?suite&format=junit&nohistory&DELETE_FILE=true&FILE_NAME=' + radio;
                await fetch(urlToTrigger).then((respone) => respone.text());
            });
        setSaveClicked(false);
        props.closeDialog('delete', null);
    };

    const renameArea = async () => {
        setSaveClicked(true);
        let oldFileName = props.area + '-' + props.radio;
        let newFileName = props.area + '-' + newAreaTextBoxValue + '-steps.json';
        let currentOrigin = window.location.origin;
        await fetch(currentOrigin + '/files/all-steps.json', { cache: 'no-store' })
            .then((response) => {
                return response.json();
            })
            .then(async (data) => {
                let currentArray: string[] = data[props.area];
                currentArray.splice(currentArray.indexOf(oldFileName), 1, newFileName);
                let stringified = JSON.stringify(data);
                //First update the all-steps.json by re-creating the file
                let urlToTrigger = currentOrigin + '/UpdateSteps?suite&format=junit&nohistory&FILE_NAME=all-steps.json&CONTENT=' + stringified + '&CREATE_FILE=true';
                await fetch(urlToTrigger).then((respone) => respone.text());
                //Next rename the file
                urlToTrigger = currentOrigin + '/UpdateSteps?suite&format=junit&nohistory&RENAME_FILE=true&OLD_FILE_NAME=' + oldFileName + '&NEW_FILE_NAME=' + newFileName;
                await fetch(urlToTrigger).then((respone) => respone.text());
            });
        setSaveClicked(false);
        props.closeDialog('rename', null);
    };

    return (
        <Dialog open={true} onClose={handleClose} maxWidth="xl">
            <DialogTitle>
                <strong style={{ color: 'darkmagenta' }}>{props.area}</strong> steps for <strong style={{ color: 'darkmagenta' }}>{props.radio.replace('-steps.json', '')}</strong> (Double click to
                edit. Drag to re-order.)
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <EditableTable setSnackBarErrorMessage={props.setSnackBarErrorMessage} suggestions={suggestions} updateSuggestions={updateSuggestions}></EditableTable>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Tooltip title="You will lose all the steps under this radio button.">
                    <Button variant="contained" color="primary" disabled={saveClicked} style={{ textTransform: 'none', backgroundColor: 'salmon' }} startIcon={<Delete />} onClick={() => deleteArea()}>
                        Delete '{props.radio.replace('-steps.json', '')}'
                    </Button>
                </Tooltip>
                <hr />
                <TextField style={{ width: '20%' }} onKeyPress={(e) => validateNewName(e)} onChange={handleOnChange} id="standard-basic" label="New name." variant="standard" />
                <Button
                    variant="contained"
                    color="primary"
                    style={{ textTransform: 'none', backgroundColor: 'yellowgreen' }}
                    startIcon={<Edit />}
                    onClick={() => renameArea()}
                    disabled={newAreaTextBoxValue.length === 0 || saveClicked || newAreaTextBoxValue === props.radio.replace('-steps.json', '')}
                >
                    {"Rename '" + props.radio.replace('-steps.json', '') + "'"}
                </Button>

                <hr />
                {saveClicked && <CircularProgress variant="indeterminate" color="primary" />}
                <hr />
                <Button
                    disabled={saveClicked}
                    variant="contained"
                    color="primary"
                    style={{ textTransform: 'none', backgroundColor: 'green' }}
                    startIcon={<SaveOutlined />}
                    onClick={() => copyOrSave('save')}
                >
                    Save Steps
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default SuggestionEditDialog;
