import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import EditableTable from '../components/EditableTable';
import { Step } from '../model/step.model';

function FormDialog(props: any) {

    const [open, setOpen] = React.useState(props.open);

    let suggestions: Step[] = JSON.parse(props.stepsAsString);

    const updateSuggestions = (data: Step[]) => {
        suggestions = data;
    };

    const handleClose = () => {
        setOpen(false);
        props.dialogClosed();
    };

    const copyAndClose = () => {
        handleClose();
        props.getAllTexts(suggestions);
    }

    return (
        <div>
            <Dialog open={open} onClose={handleClose} maxWidth="lg">
                <DialogTitle>Suggestions (Double click to edit. Drag to re-order.)</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <EditableTable stepsAsString={props.stepsAsString} updateSuggestions={updateSuggestions}></EditableTable>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' color="primary" onClick={copyAndClose}>Copy As Json</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default FormDialog;
