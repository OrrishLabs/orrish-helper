import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

function FormDialog(props: any) {

    const [open, setOpen] = React.useState(props.open);

/*
    const handleClickOpen = () => {
        setOpen(true);
    };
*/
    const handleClose = () => {
        setOpen(false);
        props.dialogClosed();
    };

    const copyAndClose = () => {
        handleClose();
        props.getAllTexts();
    }

    return (
        <div>
            <Dialog open={open} onClose={handleClose} maxWidth="lg">
                <DialogTitle>View Suggestions</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Step</TableCell>
                                        <TableCell>Help</TableCell>

                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {JSON.parse(props.stepsAsString).map((row: { id: number; step: string; help: string }) => (
                                        <TableRow
                                            key={row.id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell>
                                                {row.step}
                                            </TableCell>
                                            <TableCell>{row.help}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
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
