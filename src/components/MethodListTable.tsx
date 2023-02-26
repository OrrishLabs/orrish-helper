import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useState } from 'react';
import { Step } from '../model/step.model';
import { Button, IconButton, Stack, TableCell, Tooltip } from '@mui/material';
import { ContentCopy, CopyAll, Delete, Edit, Help, PlaylistAdd } from '@mui/icons-material';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Transition, CSSTransition, TransitionGroup } from 'react-transition-group';
import SuggestionEditPage from '../pages/SuggestionEditPage';
import { sampleStepsService } from '../services/get-sample-steps';
import SplitButton from './SplitButton';
import PropTypes from 'prop-types';
import CustomSnackBar from './CustomSnackBar';
import { fileService } from '../services/persist-file-changes';
import { useAvailableSteps } from '../contexts/AvailableStepContext';

function MethodListTable(props: any) {
    const [selectedSteps, setSelectedSteps] = useState<Step[]>([]);
    const [snackBarDetails, setSnackBarDetails] = useState({ type: 'info', duration: 6000, text: '' });
    const [inTextProp, setInTextProp] = useState(false);
    const [isDialogShown, setIsDialogShown] = useState(false);
    //Below is to reset the auto complete text value by re-rendering component.
    const [randomValue, setRandomValue] = useState(Math.random());
    const suggestions = useAvailableSteps();

    let selectedStepsToCopy: Step[] = [];

    const closeSnackBar = () => {
        //This is needed for re-rendering on clicking same button again.
        setSnackBarDetails({ type: 'info', duration: 6000, text: '' });
    };

    const closeEditStepDialog = async (typeOfAction: string, suggestionsToCopy: Step[]) => {
        if (typeOfAction.includes('delete') || typeOfAction.includes('rename')) {
            setSnackBarDetails({ type: 'success', duration: 5000, text: 'Steps ' + typeOfAction + 'd.' });
            props.setRunEffectState(!props.runEffectState);
        } else if (typeOfAction.includes('save')) {
            // Saves texts.
            await fileService.persistFile(props.tabValue + '-' + props.radioSelected, JSON.stringify(suggestionsToCopy));
            setSnackBarDetails({ type: 'success', duration: 10000, text: 'Steps are saved.' });
        } else if (typeOfAction.includes('copy')) {
            let count = 0;
            for (const obj of suggestionsToCopy) {
                obj.id = ++count;
            }
            var textArea = document.createElement('textarea');
            textArea.value = JSON.stringify(suggestionsToCopy, null, 2);
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            /*
                //This does not work on unsecured sites.
                navigator.clipboard
                  .writeText(textArea.value)
                  .then(() => {
                setShowSnackBar('Steps copied to clipboard. You can use UpdateAvailableSteps page to persist the steps.');
                  })
                  .catch(e => {
                    setShowSnackBar(e)
                  });
                  */
            document.body.removeChild(textArea);
            setSnackBarDetails({ type: 'success', duration: 10000, text: 'Steps are copied to clipboard.' });
        }
        setIsDialogShown(false);
    };

    const showDialog = () => {
        setIsDialogShown(true);
    };

    const duration = 500;

    const defaultStyle = {
        transition: `opacity ${duration}ms ease-in-out`,
        opacity: 0,
        color: 'green'
    };

    const transitionStyles = {
        entering: { opacity: 1 },
        entered: { opacity: 1 },
        exiting: { opacity: 0 },
        exited: { opacity: 0 }
    };

    const setSnackBarErrorMessage = (message: string) => {
        setSnackBarDetails({ type: 'error', duration: 6000, text: message });
    };

    const appendSelectedSteps = (newValue: string) => {
        let valueSteps = suggestions.filter((e) => e.step.includes(newValue.trim()));
        if (valueSteps && valueSteps.length > 0) {
            setSelectedSteps((prevState) => [...prevState, { ...valueSteps[0], id: Math.random() }]);
            selectedStepsToCopy.push(valueSteps[0]);
        }
        setInTextProp(selectedStepsToCopy.length === 0 ? false : true);
    };

    const addSampleSteps = async () => {
        let stepsToBeAdded: Step[] = await sampleStepsService.getSampleSteps(props.radioSelected.split('-')[0]);
        stepsToBeAdded.forEach((e) => appendSelectedSteps(e.step));
    };

    const getSampleStepFor = async (text: string) => {
        let stepsToBeAdded: Step[] = await sampleStepsService.getSampleSteps(props.radioSelected.split('-')[0] + text);
        stepsToBeAdded.forEach((e) => appendSelectedSteps(e.step));
    };

    const apiSampleStepDropdownOptions = ['GET Steps', 'POST Steps', 'PUT Steps', 'DELETE Steps'];
    const setupSampleStepDropdownOptions = ['Database Setup', 'Browser Setup', 'Mobile Setup', 'API Setup', 'General Setup'];

    const onDragEnd = (result) => {
        const { destination, source } = result;
        if (!destination) return;
        if (destination.droppableId === source.draggableId && destination.index === source.index) return;

        let sourceText = selectedStepsToCopy[source.index];
        let updatedDestIndex = destination.index > source.index ? destination.index - 1 : destination.index;

        selectedStepsToCopy.splice(source.index, 1);
        selectedStepsToCopy.splice(updatedDestIndex, 0, sourceText);

        setSelectedSteps(selectedStepsToCopy);
    };

    let onDeleteStep = (step: Step) => {
        setSelectedSteps(selectedSteps.filter((e) => !(e.id === step.id)));
        const index = selectedStepsToCopy.findIndex((e) => step.id === e.id);
        selectedStepsToCopy.splice(index, 1);
        setInTextProp(selectedStepsToCopy.length === 0 ? false : true);
    };

    let onCopyStep = (step: Step) => {
        let textToCopy = selectedStepsToCopy.find((e) => step.id === e.id).step;
        var textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        setSnackBarDetails({ type: 'success', duration: 6000, text: 'Copied step to clipboard. You can paste it in FitNesse test.' });
        document.body.removeChild(textArea);
    };

    let onHelpStep = (step: Step) => {
        const index = selectedStepsToCopy.findIndex((e) => step.id === e.id);
        let text: string = selectedStepsToCopy[index].help;
        setSnackBarDetails({ type: 'info', duration: 6000, text: text });
    };

    const updateStepTextChange = (valuePassed: any) => {
        const htmlElementId = valuePassed.currentTarget.id;
        const identifier = htmlElementId.split('-')[0];
        const count = htmlElementId.split('-')[1];
        const text = valuePassed.currentTarget.innerHTML;

        const index = selectedStepsToCopy.findIndex((e) => identifier.includes(e.id));
        let items = [...selectedStepsToCopy];
        let item = { ...items[index] };

        var updatedString = item.step
            .split('|')
            .map((eachStep, index) => (index.toString().includes(count) ? text : eachStep))
            .join('|');

        item.step = updatedString;
        items[index] = item;
        selectedStepsToCopy = items;
    };

    const clearSteps = () => {
        setSelectedSteps([]);
        setInTextProp(false);
    };

    const onCopyAllSteps = () => {
        var textArea = document.createElement('textarea');
        textArea.value = '^|script|\n' + selectedStepsToCopy.map((e) => e.step).join('\n');
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        setSnackBarDetails({ type: 'success', duration: 6000, text: 'Copied steps to clipboard. You can paste it in FitNesse page and execute.' });
        document.body.removeChild(textArea);
        setSelectedSteps(selectedStepsToCopy);
    };

    const getSuggestedCellsAsPlainText = (eachStep: Step) => {
        let currentStep = eachStep.step;
        if (selectedStepsToCopy.findIndex((e) => e.id === eachStep.id) === -1) {
            selectedStepsToCopy.push(eachStep);
        }
        let rowValue;
        let isEditable = false;
        const values = currentStep.split('|');
        for (let count = 1; count < values.length; count++) {
            if (values[count].trim().length > 0) {
                if (count === 1 && values[count].startsWith('$') && values[count].trim().endsWith('=')) {
                    rowValue = rowValue
                        ? [
                            rowValue,
                            <span
                                contentEditable
                                suppressContentEditableWarning
                                id={((eachStep.id! as unknown as string) + '-' + count) as string}
                                onInput={(e) => updateStepTextChange(e)}
                                className="data"
                            >
                                {values[1]}
                            </span>
                        ]
                        : (rowValue = (
                            <span
                                contentEditable
                                suppressContentEditableWarning
                                id={((eachStep.id! as unknown as string) + '-' + count) as string}
                                onInput={(e) => updateStepTextChange(e)}
                                className="data"
                            >
                                {values[1]}
                            </span>
                        ));
                } else {
                    if (isEditable) {
                        rowValue = [
                            rowValue,
                            <span
                                contentEditable
                                suppressContentEditableWarning
                                id={((eachStep.id! as unknown as string) + '-' + count) as string}
                                onInput={(e) => updateStepTextChange(e)}
                                className="data"
                            >
                                {values[count]}
                            </span>
                        ];
                    } else {
                        rowValue = [rowValue, <span contentEditable="false">{values[count]}</span>];
                    }
                    isEditable = !isEditable;
                }
            }
        }
        return <span>{rowValue}</span>;
    };

    return (
        <div>
            {snackBarDetails.text.length > 0 && <CustomSnackBar snackBarMessage={snackBarDetails.text} duration={snackBarDetails.duration} type={snackBarDetails.type} closeSnackBar={closeSnackBar} />}
            <Transition in={inTextProp} timeout={duration}>
                {(state) => (
                    <div
                        style={{
                            ...defaultStyle,
                            ...transitionStyles[state]
                        }}
                    >
                        Modify data as needed. Drag to re-order steps.
                    </div>
                )}
            </Transition>
            <DragDropContext onDragEnd={onDragEnd}>
                <TransitionGroup component={null}>
                    {selectedSteps &&
                        selectedSteps
                            .filter((e) => e)
                            .map((e, index) => (
                                <CSSTransition timeout={duration} classNames="slide" mountOnEnter unmountOnExit key={e.id}>
                                    <Droppable droppableId={e.id.toString()}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                                <Draggable draggableId={e.id.toString()} index={index}>
                                                    {(provided) => (
                                                        <div id="editable-row" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                            <TableCell>
                                                                <IconButton size="small" onClick={() => onDeleteStep(e)}>
                                                                    <Delete />
                                                                </IconButton>
                                                            </TableCell>
                                                            <TableCell>{getSuggestedCellsAsPlainText(e)}</TableCell>
                                                            <TableCell>
                                                                <Tooltip title="Copy this step to clipboard.">
                                                                    <IconButton size="small" onClick={() => onCopyStep(e)}>
                                                                        <ContentCopy />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </TableCell>
                                                            {e.help.length > 0 && (
                                                                <TableCell>
                                                                    <IconButton size="small" onClick={() => onHelpStep(e)}>
                                                                        <Help />
                                                                    </IconButton>
                                                                </TableCell>
                                                            )}
                                                        </div>
                                                    )}
                                                </Draggable>
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </CSSTransition>
                            ))}
                </TransitionGroup>
            </DragDropContext>
            <Autocomplete
                key={randomValue}
                onChange={(event, newStep) => {
                    if (newStep && newStep.length > 0) {
                        appendSelectedSteps(newStep[0]);
                        setRandomValue(Math.random());
                    }
                }}
                id="suggestion-box"
                options={suggestions.map((e) => e.step)}
                sx={{ width: 1000 }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Type for suggestions..."
                        InputProps={{
                            ...params.InputProps
                        }}
                        size="small"
                    />
                )}
            />
            <br />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', gap: '10px' }}>
                {props.radioSelected.length > 0 && (
                    <Tooltip title={<span className="tooltip">Rename/delete radio or edit available suggestions for {props.radioSelected.split('-')[0].toUpperCase()}</span>}>
                        <Button color="secondary" variant="contained" startIcon={<Edit />} onClick={showDialog}>
                            Manage
                        </Button>
                    </Tooltip>
                )}
                <div id="bottom-buttons" />
                <div />
                <div />
                <Stack direction="row" spacing={1}>
                    {isDialogShown && (
                        <SuggestionEditPage
                            area={props.tabValue}
                            radio={props.radioSelected}
                            setSnackBarErrorMessage={setSnackBarErrorMessage}
                            closeDialog={closeEditStepDialog}
                        />
                    )}
                    {suggestions.length > 0 && props.radioSelected.includes('api') ? (
                        <SplitButton
                            buttonText="Add Sample"
                            tooltipText="Add sample API steps from dropdown."
                            options={apiSampleStepDropdownOptions}
                            handleMenuItemClick={getSampleStepFor}
                        ></SplitButton>
                    ) : props.radioSelected.includes('setup') ? (
                        <SplitButton
                            buttonText="Add Sample"
                            tooltipText="SetUp steps need to go to SetUp FitNesse page. Do not combine SetUp and test steps. "
                            options={setupSampleStepDropdownOptions}
                            handleMenuItemClick={getSampleStepFor}
                        ></SplitButton>
                    ) : props.radioSelected.includes('browser') || props.radioSelected.includes('mobile') ? (
                        <Tooltip title={<span className="tooltip">Add Sample {props.radioSelected.split('-')[0].toUpperCase()} Steps</span>}>
                            <Button color="secondary" variant="contained" startIcon={<PlaylistAdd />} onClick={addSampleSteps}>
                                Sample
                            </Button>
                        </Tooltip>
                    ) : (
                        false
                    )}
                    {selectedSteps.length > 0 && (
                        <Tooltip title={<span className="tooltip">Delete all steps above.</span>}>
                            <Button color="secondary" style={{ backgroundColor: 'lightcoral' }} variant="contained" startIcon={<Delete />} onClick={clearSteps}>
                                Clear
                            </Button>
                        </Tooltip>
                    )}
                    {selectedSteps.length > 0 && (
                        <Tooltip title={<span className="tooltip">Copy steps above to be pasted in FitNesse test.</span>}>
                            <Button color="secondary" style={{ backgroundColor: 'yellowgreen' }} variant="contained" startIcon={<CopyAll />} onClick={onCopyAllSteps}>
                                Copy
                            </Button>
                        </Tooltip>
                    )}
                </Stack>
            </div>
        </div>
    );
}

MethodListTable.propTypes = {
    tabValue: PropTypes.string.isRequired,
    radioSelected: PropTypes.string.isRequired,
    runEffectState: PropTypes.bool.isRequired,
    setRunEffectState: PropTypes.func.isRequired
};

export default MethodListTable;
