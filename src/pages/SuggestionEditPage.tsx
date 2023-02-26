import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import EditableTable from '../components/EditableTable';
import { Step } from '../model/step.model';
import {  useState } from 'react';
import { CircularProgress, IconButton, TextField, Tooltip } from '@mui/material';
import { Close, Delete, Edit, SaveOutlined } from '@mui/icons-material';
import { fileService } from '../services/persist-file-changes';

function SuggestionEditPage(props: any) {
    const [newAreaTextBoxValue, setNewAreaTextValue] = useState('');
    const [saveClicked, setSaveClicked] = useState(false);

    let suggestionsToCopy: Step[] = [];

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
        await fileService
            .readFile('all-steps.json')
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
                await fileService.persistFile('all-steps.json', stringified);
                //Next delete a file
                await fileService.deleteFile(radio);
            });
        setSaveClicked(false);
        props.closeDialog('delete', null);
    };

    const renameArea = async () => {
        setSaveClicked(true);
        let oldFileName = props.area + '-' + props.radio;
        let newFileName = props.area + '-' + newAreaTextBoxValue + '-steps.json';
        await fileService
            .readFile('all-steps.json')
            .then((response) => {
                return response.json();
            })
            .then(async (data) => {
                let currentArray: string[] = data[props.area];
                currentArray.splice(currentArray.indexOf(oldFileName), 1, newFileName);
                let stringified = JSON.stringify(data);
                //First update the all-steps.json by re-creating the file
                await fileService.persistFile('all-steps.json', stringified);
                //Next rename the file
                await fileService.renameFile(oldFileName, newFileName);
            });
        setSaveClicked(false);
        props.closeDialog('rename', null);
    };

    return (
        <Dialog fullScreen maxWidth="lg" open={true} onClose={handleClose}>
            <DialogTitle style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                    <strong style={{ color: 'darkmagenta' }}>{props.area}</strong> steps for <strong style={{ color: 'darkmagenta' }}>{props.radio.replace('-steps.json', '')}</strong> (Double click to
                    edit. Drag to re-order.)
                </span>
                <IconButton onClick={handleClose}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <EditableTable setSnackBarErrorMessage={props.setSnackBarErrorMessage} updateSuggestions={updateSuggestions}></EditableTable>
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

export default SuggestionEditPage;
