import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import EditableTable from './EditableTable';
import { Step } from '../model/step.model';
import { useEffect, useState } from 'react';

function SuggestionEditDialog(props: any) {

    const [suggestions, setSuggestions] = useState<Step[]>([]);

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

    const copyAndClose = () => {
        suggestionsToCopy = (suggestionsToCopy.length === 0) ? props.suggestions : suggestionsToCopy;
        props.closeDialog('Steps copied to clipboard. You can use UpdateAvailableSteps page to persist the steps.', suggestionsToCopy);
    };

    return (
        <Dialog open={true} onClose={handleClose} maxWidth="lg">
            <DialogTitle>Suggestions (Double click to edit. Drag to re-order.)</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <EditableTable setSnackBarMessage={props.setSnackBarMessage} suggestions={suggestions} updateSuggestions={updateSuggestions}></EditableTable>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant='contained' color="primary" onClick={copyAndClose}>Copy As Json</Button>
            </DialogActions>
        </Dialog>
    );
}

export default SuggestionEditDialog;
