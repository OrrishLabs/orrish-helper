import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { ReactElement, useState } from "react";
import { Step } from "../model/step.model";
import { Button, IconButton, Snackbar, TableCell, TableRow, Tooltip } from "@mui/material";
import { Delete } from "@mui/icons-material";
import ConditionalWrapper from "../components/ConditionalWrapper";
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

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
        textArea.value = "!|script|\n" + selectedStepsToCopy.map(e => e.step).join('\n');
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        setSnackBarMessage('Copied steps to clipboard. You can paste it in FitNesse page and execute.');
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
                if (count === 1 && values[count].startsWith("$") && values[count].trim().endsWith("=")) {
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
        return <span>{rowValue}</span>;
    };

    const onDragEnd = (result) => {
        const { destination, source } = result;
        if (!destination)
            return;
        if (destination.droppableId === source.draggableId && destination.index === source.index)
            return;

        let sourceText = selectedStepsToCopy[source.index]
        let updatedDestIndex = destination.index === 0 ? 0 : destination.index - 1;

        selectedStepsToCopy.splice(source.index, 1);
        selectedStepsToCopy.splice(updatedDestIndex, 0, sourceText)

        let count = 1;

        selectedStepsToCopy = selectedStepsToCopy.map(e => { return { ...e, id: count++ } });
        setSelectedSteps(selectedStepsToCopy);

    }

    return (
        <div>
            <Snackbar
                open={snackBarMessage.length > 0}
                autoHideDuration={6000}
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
            <DragDropContext onDragEnd={onDragEnd}>
                {selectedSteps && selectedSteps.filter(e => e).map((e, index) => (
                    <Droppable droppableId={e.id.toString()}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <Draggable draggableId={e.id.toString()} index={index}>
                                    {(provided) => (
                                        <TableRow
                                            key={e.id}
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <TableCell>
                                                <IconButton size="small" onClick={() => onDeleteStep(e)}>
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>
                                                <ConditionalWrapper
                                                    condition={e.help && e.help.length > 0}
                                                    wrapper={(children: ReactElement<any, any>) =>
                                                        <Tooltip arrow={true} followCursor={true} title={e.help}>
                                                            {children}
                                                        </Tooltip>}
                                                >
                                                    {getSuggestedCellsAsPlainText(e)}
                                                </ConditionalWrapper>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </Draggable>
                                {provided.placeholder}
                            </div>)}
                    </Droppable>))}
            </DragDropContext>

            <br />
            <Button variant='contained' color="primary" onClick={onCopySteps}>Copy Steps</Button>
        </div>
    );
};

export default MethodListTable;
