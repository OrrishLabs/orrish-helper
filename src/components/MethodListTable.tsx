import { IconButton, Snackbar, Table, TableBody, TableCell, TableRow } from "@material-ui/core";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Delete } from "@material-ui/icons";
import { useState } from "react";
import { Step } from "../model/step.model";
import { Button, Tooltip } from "@mui/material";

function MethodListTable(props: any) {

    const suggestions: Step[] = props.stepList;
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [selectedSteps, setSelectedSteps] = useState<Step[]>([]);
    let selectedStepsToCopy: Step[] = [];

    const appendSelectedSteps = (newValue: string) => {
        let valueSteps = JSON.parse(JSON.stringify(suggestions.filter(e => e.step.includes(newValue))));
        if (valueSteps && valueSteps.length > 0) {
            valueSteps[0].id = Math.random();
            setSelectedSteps((prevState) => [...prevState, valueSteps[0]]);
            selectedStepsToCopy.push(valueSteps[0]);
        }
    };

    const handleClose = () => {
        setSnackBarMessage('');
    };

    let onDeleteStep = (step: Step) => {
        setSelectedSteps(selectedSteps.filter(e => !(e.id === step.id)));
        const index = selectedStepsToCopy.findIndex(e => step.id === e.id);
        selectedStepsToCopy.splice(index, 1);
    };

    const onCopySteps = () => {
        var textArea = document.createElement("textarea");
        textArea.value = "|script|\n" + selectedStepsToCopy.map(e => e.step).join('\n');
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        setSnackBarMessage('Copied step to clipboard.');
        document.body.removeChild(textArea);
        setSelectedSteps(selectedStepsToCopy);
    };

    const updateStepTextChange = (valuePassed: any) => {
        const htmlElementId = valuePassed.currentTarget.id;
        const identifier = htmlElementId.split("-")[0];
        const count = htmlElementId.split("-")[1];
        const text = valuePassed.currentTarget.innerHTML;

        const index = selectedStepsToCopy.findIndex(e => identifier.includes(e.id));
        let items = [...selectedStepsToCopy];
        let item = { ...items[index] };

        var updatedString = item.step.split("|").map((eachStep, index) =>
            (index.toString().includes(count)) ? text : eachStep
        ).join("|");

        item.step = updatedString;
        items[index] = item;
        selectedStepsToCopy = items;
    };

    const getSuggestedCellsAsPlainText = (eachStep: Step) => {
        let currentStep = eachStep.step;
        if (selectedStepsToCopy.findIndex(e => e.id === eachStep.id) === -1) {
            selectedStepsToCopy.push(eachStep);
        }
        let rowValue;
        let isEditable = false;
        const values = currentStep.split("|");
        for (let count = 1; count < values.length; count++) {
            if (values[count].trim().length > 0) {
                if (count === 1 && values[count].startsWith("$")) {
                    rowValue = (rowValue)
                        ? [rowValue, (<span contentEditable suppressContentEditableWarning id={eachStep.id! as unknown as string + "-" + count as string} onInput={e => updateStepTextChange(e)} className="data">{values[1]}</span>)]
                        : rowValue = (<span contentEditable suppressContentEditableWarning id={eachStep.id! as unknown as string + "-" + count as string} onInput={e => updateStepTextChange(e)} className="data">{values[1]}</span>);
                } else {
                    if (isEditable) {
                        rowValue = [rowValue, (<span contentEditable suppressContentEditableWarning id={eachStep.id! as unknown as string + "-" + count as string} onInput={e => updateStepTextChange(e)} className="data">{values[count]}</span>)];
                    } else {
                        rowValue = [rowValue, (<span contentEditable="false">{values[count]}</span>)];
                    }
                    isEditable = !isEditable;
                }
            }
        }
        return rowValue;
    };

    return (
        <div>
            <Snackbar
                open={snackBarMessage.length > 0}
                autoHideDuration={1000}
                onClose={handleClose}
                message={snackBarMessage}
            />
            <br />
            <Autocomplete
                onChange={(event, newValue) => {
                    if (newValue && newValue.length > 0) {
                        appendSelectedSteps(newValue);
                    }
                }}
                id="controllable-states-demo"
                options={suggestions.map(e => e.step)}
                sx={{ width: 1000 }}
                renderInput={(params) => <TextField
                    {...params} label="Type for suggestion..."
                    InputProps={{
                        ...params.InputProps
                    }}
                />}
            />
            <Table>
                <TableBody>
                    {selectedSteps && selectedSteps.filter(e => e).map((e) => (
                        <TableRow key={e.id}>
                            <TableCell>
                                <Tooltip title={"Delete this step."}>
                                    <IconButton size="small" onClick={() => onDeleteStep(e)}>
                                        <Delete />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                            <Tooltip arrow={true} title={<h2 style={{ color: "lightblue" }}>{e.help && e.help.length === 0 ? 'Step self explanatory.' : e.help}</h2>}>
                                <TableCell>
                                    {getSuggestedCellsAsPlainText(e)}
                                </TableCell>
                            </Tooltip>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <br />
            <Button variant='contained' color="primary" onClick={onCopySteps}>Copy Steps</Button>
        </div>
    );
};

export default MethodListTable;
