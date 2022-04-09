import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { ReactElement, useEffect, useState } from "react";
import { Step } from "../model/step.model";
import { Button, IconButton, Snackbar, TableCell, Tooltip } from "@mui/material";
import { Add, CopyAll, Delete, Edit } from "@mui/icons-material";
import ConditionalWrapper from "../components/ConditionalWrapper";
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Transition } from 'react-transition-group';
import SuggestionEditDialog from './SuggestionEditDialog';
import { sampleStepsService } from '../services/get-sample-steps';
import SplitButton from './SplitButton';

function MethodListTable(props: any) {

    const [suggestions, setSuggestions] = useState<Step[]>(props.stepList);
    const [selectedSteps, setSelectedSteps] = useState<Step[]>([]);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [inProp, setInProp] = useState(false);
    const [isDialogShown, setIsDialogShown] = useState(false);

    useEffect(() => {
        setSuggestions(props.stepList);
    }, [props.stepList]);

    let selectedStepsToCopy: Step[] = [];

    const closeDialog = (snackBarMessage: string, suggestionsToCopy: Step[]) => {
        setIsDialogShown(false);
        setTimeout(() => {
            if (snackBarMessage && snackBarMessage.length > 0) {
                setSnackBarMessage(snackBarMessage);
                let count = 0;
                for (const obj of suggestionsToCopy) {
                    obj.id = ++count;
                }
                var textArea = document.createElement("textarea");
                textArea.value = JSON.stringify(suggestionsToCopy);
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                /*
                //This does not work on unsecured sites.
                navigator.clipboard
                  .writeText(textArea.value)
                  .then(() => {
                setSnackBarMessage('Steps copied to clipboard. You can use UpdateAvailableSteps page to persist the steps.');
                  })
                  .catch(e => {
                    setSnackBarMessage(e)
                  });
                  */
                document.body.removeChild(textArea);
            }
        }, 100)
    };

    const showDialog = () => {
        setIsDialogShown(true);
    };

    const duration = 1000;

    const defaultStyle = {
        transition: `opacity ${duration}ms ease-in-out`,
        opacity: 0,
        'color': 'green',
    }

    const transitionStyles = {
        entering: { opacity: 1 },
        entered: { opacity: 1 },
        exiting: { opacity: 0 },
        exited: { opacity: 0 },
    };

    const appendSelectedSteps = (newValue: string) => {
        let valueSteps = suggestions.filter(e => e.step.includes(newValue.trim()));
        if (valueSteps && valueSteps.length > 0) {
            valueSteps[0].id = Math.random();
            setSelectedSteps((prevState) => [...prevState, valueSteps[0]]);
            selectedStepsToCopy.push(valueSteps[0]);
        }
        setInProp(selectedStepsToCopy.length === 0 ? false : true);
    };

    const addSampleSteps = async () => {
        let stepsToBeAdded: Step[] = await sampleStepsService.getSampleSteps(props.radioSelected.split('-')[0]);
        stepsToBeAdded.forEach(e => appendSelectedSteps(e.step));
    }

    const getSampleStepFor = async (text: string) => {
        let stepsToBeAdded: Step[] = await sampleStepsService.getSampleSteps(props.radioSelected.split('-')[0] + text);
        stepsToBeAdded.forEach(e => appendSelectedSteps(e.step));
    }

    const apiSampleStepDropdownOptions = ['Append GET Steps', 'Append POST Steps', 'Append PUT Steps', 'Append DELETE Steps'];
    const setupSampleStepDropdownOptions = ['Append Database Setup', 'Append Browser Setup', 'Append Mobile Setup', 'Append API Setup', 'Append general Setup'];

    const handleClose = () => {
        setSnackBarMessage('');
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

    let onDeleteStep = (step: Step) => {
        setSelectedSteps(selectedSteps.filter(e => !(e.id === step.id)));
        const index = selectedStepsToCopy.findIndex(e => step.id === e.id);
        selectedStepsToCopy.splice(index, 1);
        setInProp(selectedStepsToCopy.length === 0 ? false : true);
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

    const clearSteps = () => {
        setSelectedSteps([]);
        setInProp(false);
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

    return (
        <div>
            <Snackbar
                open={snackBarMessage.length > 0}
                autoHideDuration={6000}
                onClose={handleClose}
                message={snackBarMessage}
            />
            <Transition in={inProp} timeout={duration}>
                {state => (
                    <div style={{
                        ...defaultStyle,
                        ...transitionStyles[state]
                    }}>
                        Modify data as needed. Drag to re-order steps.
                    </div>
                )}
            </Transition>
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
                                        <div
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
                                        </div>
                                    )}
                                </Draggable>
                                {provided.placeholder}
                            </div>)}
                    </Droppable>))}
            </DragDropContext>
            <Autocomplete
                onChange={(event, newValue: string) => {
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
                    size="small"
                />}
            />
            <br />
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: "10px" }}>
                {isDialogShown && <SuggestionEditDialog setSnackBarMessage={setSnackBarMessage} closeDialog={closeDialog} suggestions={suggestions} />}

                {suggestions.length > 0 &&
                    props.radioSelected.includes("api")
                    //? <Button style={{ textTransform: 'none' }} variant='contained' color="primary" onClick={showDialog}>Add Sample API Steps</Button>
                    ? <SplitButton options={apiSampleStepDropdownOptions} getSampleStepFor={getSampleStepFor}></SplitButton>
                    : props.radioSelected.includes("setup")
                        ? <SplitButton options={setupSampleStepDropdownOptions} getSampleStepFor={getSampleStepFor}></SplitButton>
                        : props.radioSelected.includes("browser") || props.radioSelected.includes("mobile")
                            //? <Button style={{ textTransform: 'none' }} variant='contained' color="primary" onClick={addSampleSteps}>Add Sample {props.radioSelected.split('-')[0].toUpperCase()} Steps</Button>
                            ? <Tooltip title={"Add Sample " + props.radioSelected.split('-')[0].toUpperCase() + " Steps"}><Button color="primary" variant="contained" endIcon={<Add />} onClick={addSampleSteps}>Add</Button></Tooltip>
                            : false}

                {suggestions.length > 0 && <Tooltip title={"Edit " + props.radioSelected.split('-')[0].toUpperCase() + " Suggestions"}><Button color="primary" variant="contained" endIcon={<Edit />} onClick={showDialog}>Edit</Button></Tooltip>}
                {selectedSteps.length > 0 && <Tooltip title="Copy Steps Above"><Button color="primary" variant="contained" endIcon={<CopyAll />} onClick={onCopySteps}>Copy</Button></Tooltip>}
                {selectedSteps.length > 0 && <Tooltip title="Delete All Steps Above"><Button color="primary" variant="contained" endIcon={<Delete />} onClick={clearSteps}>Delete</Button></Tooltip>}
            </div>
        </div >
    );
};

export default MethodListTable;
