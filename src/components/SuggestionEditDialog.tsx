import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import EditableTable from './EditableTable';
import { Step } from '../model/step.model';
import { useEffect, useState } from 'react';
import { TextField, Tooltip } from '@mui/material';
import { ContentCopy, Delete, Edit, SaveOutlined } from '@mui/icons-material';

function SuggestionEditDialog(props: any) {

    const [suggestions, setSuggestions] = useState<Step[]>([]);
    const [isNewAreaTextBoxShown, setIsNewAreaTextBoxShown] = useState(false);
    const [newAreaTextBoxValue, setNewAreaTextValue] = useState('');

    let suggestionsToCopy: Step[] = [];

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
        suggestionsToCopy = (suggestionsToCopy.length === 0) ? props.suggestions : suggestionsToCopy;
        let index = suggestionsToCopy.find(e => !e.step.startsWith('|') || !e.step.endsWith('|'));
        if (index) {
            props.setSnackBarErrorMessage('Please correct the steps. All steps should start and end with |');
        } else {
            props.closeDialog(type, suggestionsToCopy);
        }
    };

    const deleteArea = async () => {
        let area = props.area;
        let radio = area + '-' + props.radio;
        let currentOrigin = window.location.origin;
        await fetch(currentOrigin + '/files/all-steps.json')
            .then(response => { return response.json(); })
            .then(async data => {
                let currentArray: string[] = data[area];
                currentArray.splice(currentArray.indexOf(radio), 1);
                let stringified = JSON.stringify(data);
                //First update the all-steps.json
                let urlToTrigger = window.location.origin + '/SaveSteps?test&nohistory&FILE_NAME=all-steps.json&CONTENT=' + stringified + "&CREATE_FILE=true";
                await fetch(urlToTrigger);
                //Next create a file
                urlToTrigger = window.location.origin + '/DeleteSteps?test&nohistory&FILE_NAME=' + radio;
                await fetch(urlToTrigger);
            });
        props.closeDialog('delete', null);
    };

    const renameArea = async () => {
        if (isNewAreaTextBoxShown) {
            let oldFileName = props.area + '-' + props.radio;
            let newFileName = props.area + '-' + newAreaTextBoxValue + '-steps.json';
            let currentOrigin = window.location.origin;
            await fetch(currentOrigin + '/files/all-steps.json')
                .then(response => { return response.json(); })
                .then(async data => {
                    let currentArray: string[] = data[props.area];
                    currentArray.splice(currentArray.indexOf(oldFileName), 1, newFileName);
                    let stringified = JSON.stringify(data);
                    //First update the all-steps.json
                    let urlToTrigger = window.location.origin + '/SaveSteps?test&nohistory&FILE_NAME=all-steps.json&CONTENT=' + stringified + "&CREATE_FILE=true";
                    await fetch(urlToTrigger);
                    //Next create a file
                    urlToTrigger = window.location.origin + '/RenameSteps?test&nohistory&OLD_FILE_NAME=' + oldFileName + '&NEW_FILE_NAME=' + newFileName;
                    await fetch(urlToTrigger);
                });

            props.closeDialog('rename', null);
        } else {
            setIsNewAreaTextBoxShown(!isNewAreaTextBoxShown);
        }
    };

    return (
        <Dialog fullWidth open={true} onClose={handleClose} maxWidth="lg">
            <DialogTitle><strong style={{ color: 'darkmagenta' }}>{props.area}</strong> steps for <strong style={{ color: 'darkmagenta' }}>{props.radio.replace('-steps.json', '')}</strong> (Double click to edit. Drag to re-order.)</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <EditableTable setSnackBarErrorMessage={props.setSnackBarErrorMessage} suggestions={suggestions} updateSuggestions={updateSuggestions}></EditableTable>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Tooltip title='You will lose all the steps under this radio button.'>
                    <Button variant='contained' color="primary" style={{ textTransform: 'none', backgroundColor: 'salmon' }} startIcon={<Delete />} onClick={() => deleteArea()}>Delete '{props.radio.replace('-steps.json', '')}'</Button>
                </Tooltip>
                <Button variant='contained' color="primary" style={{ textTransform: 'none', backgroundColor: 'yellowgreen' }} startIcon={<Edit />} onClick={() => renameArea()} disabled={isNewAreaTextBoxShown && newAreaTextBoxValue.length === 0}>{isNewAreaTextBoxShown ? 'Rename' : 'Rename \'' + props.radio.replace('-steps.json', '') + '\''}
                </Button>
                {isNewAreaTextBoxShown &&
                    <TextField style={{ width: "25%" }} onKeyPress={(e) => validateNewName(e)} onChange={handleOnChange} id="standard-basic" label="Enter new name and click Rename." variant="standard" />}
                <hr />
                <Tooltip title='Use it only if save does not work for some reason.'>
                    <Button variant='contained' color="primary" startIcon={<ContentCopy />} style={{ textTransform: 'none' }} onClick={() => copyOrSave('copy')}>Copy</Button>
                </Tooltip>
                <Button variant='contained' color="primary" style={{ textTransform: 'none', backgroundColor: 'green' }} startIcon={<SaveOutlined />} onClick={() => copyOrSave('save')}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}

export default SuggestionEditDialog;
