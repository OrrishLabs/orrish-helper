import { IconButton, Snackbar, Table, TableBody, TableCell, TableRow } from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import { FileCopy } from "@material-ui/icons";
import { useState } from "react";

function MethodListTable(props: any) {

    const [snackBarMessage, setSnackBarMessage] = useState('');

    const handleClose = () => {
        setSnackBarMessage('');
    };

    let onCopyStep = (e: string) => {
        var textArea = document.createElement("textarea");
        textArea.value = e;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();document.execCommand('copy');
        setSnackBarMessage('Copied step to clipboard.');
        document.body.removeChild(textArea);
    }

    return (
        <div>
            <Snackbar
                open={snackBarMessage.length > 0}
                autoHideDuration={1000}
                onClose={handleClose}
                message={snackBarMessage}
            />
            <Table>
                <TableBody>
                    {props.stepList && props.stepList.map((e: { id: number; help: string; step: string; }) => (
                        <TableRow key={e.id}>
                            <TableCell>
                                <Tooltip title={"Copy to clipboard"}>
                                    <IconButton size="small" onClick={() => onCopyStep(e.step)}>
                                        <FileCopy />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                            <Tooltip arrow={true} title={<h2 style={{ color: "lightblue" }}>{e.help.length === 0 ? 'Step self explanatory.' : e.help}</h2>}>
                                <TableCell>
                                    {e.step}
                                </TableCell>
                            </Tooltip>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default MethodListTable;

