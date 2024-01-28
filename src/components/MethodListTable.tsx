import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useEffect, useState } from 'react';
import { Step } from '../model/step.model';
import { Button, IconButton, Stack, TableCell, Tooltip } from '@mui/material';
import { Add, ClearAll, ClearRounded, ContentCopy, CopyAll, CopyAllOutlined, CopyAllRounded, CopyAllSharp, CopyAllTwoTone, Delete, Edit, GridOn, Help, List, PlaylistAdd } from '@mui/icons-material';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Transition, CSSTransition, TransitionGroup } from 'react-transition-group';
import SuggestionEditPage from '../pages/SuggestionEditPage';
import ExistingTestEditPage from '../pages/ExistingTestEditPage';
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
    const [isEditSuggestionsDialogShown, setIsEditSuggestionsDialogShown] = useState(false);
    const [isEditExistingCaseDialogShown, setIsEditExistingCaseDialogShown] = useState(false);
    //Below is to reset the auto complete text value by re-rendering component.
    const [randomValue, setRandomValue] = useState(Math.random());
    const [isShowDataDrivenGrid, setShowDataDrivenGrid] = useState(false);
    const [dataRows, setDataRows] = useState<Map<number, string[]>>(new Map());
    const [dataRowHeaders, setDataHeaders] = useState(['testName']);

    const eachUnderScoreValue = "_";
    const suggestions = useAvailableSteps();

    useEffect(() => {
        setDataRows((prev) => new Map(prev).set(1, ['Data Set 1']));
    }, []);

    const onClickAddColumn = () => {
        setDataHeaders((prev) => {
            prev.splice(prev.length, 0, 'variable' + prev.length);
            return prev;
        });
        setDataRows((prev) => {
            let map = new Map(prev);
            map.forEach(e => e.splice(e.length, 0, ''));
            return map;
        });
    };

    const onClickAddRow = () => {
        setDataRows((prev) => {
            let map = new Map(prev);
            let columnLength = map.values().next().value.length;
            let arr: string[] = []
            for (let i = 0; i < columnLength; i++) {
                if (i === 0) {
                    arr.push('Data Set ' + (map.size + 1));
                } else {
                    arr.push('');
                }
            }
            map.set(map.size + 1, arr);
            return map;
        });
    }

    const onClickDeleteColumn = (index: number) => {
        let headers = [...dataRowHeaders];
        headers.splice(index, 1);
        setDataHeaders(headers);

        let rows = new Map(dataRows);
        rows.forEach((row) => {
            row.splice(index, 1);
        });
        setDataRows(rows);
    }

    const updateDataRowHeaders = (index: number, value: any) => {
        setDataHeaders((prev) => {
            if (value.currentTarget.value.length > 0) {
                prev[index] = value.currentTarget.value;
            }
            return prev;
        });
    }

    const updateDataRowValues = (rowNumber: number, columnNumber: number, event: any) => {
        setDataRows((prev) => {
            var values = dataRows.get(rowNumber);
            values[columnNumber] = event.currentTarget.value;
            return prev;
        })
    }

    const onClickConvertButton = () => {
        var fullStringToCopy = '';
        var allUnderscores = '';
        var scenarioTableArguments = '';
        var pipeParameters = '|';
        dataRowHeaders.forEach(element => {
            allUnderscores += eachUnderScoreValue;
            scenarioTableArguments += element + ',';
            pipeParameters += element + '|';
        });
        scenarioTableArguments = scenarioTableArguments.slice(0, scenarioTableArguments.length - 1);
        fullStringToCopy += '^|scenario|Execute ' + allUnderscores + '|' + scenarioTableArguments + '|\n';
        fullStringToCopy += getSelectedStepsTextValueOnCopy();

        if (dataRowHeaders.some(element => element.trim().length === 0 || element.includes(' '))) {
            setSnackBarDetails({
                type: 'error', duration: 6000, text: 'You have not entered the value for one of the headers.'
            });
            return;
        };
        for (let element of dataRowHeaders) {
            if (!fullStringToCopy.includes('@' + element)) {
                let text = (element === 'testName') ? 'The first line in  top table (aka scenario table) should be "Set test name @testName"' : 'Use the data table parameter @' + element + ' in your scenario table on top.';
                setSnackBarDetails({
                    type: 'error', duration: 6000, text: text
                });
                return;
            }
        };
        fullStringToCopy += '\n!|Execute|\n' + pipeParameters + '\n';
        for (let i = 1; i <= dataRows.size; i++) {
            const eachRow = dataRows.get(i);
            var eachRowValues = '|';
            eachRow.forEach(column => {
                eachRowValues += column + '|';
            });
            fullStringToCopy += eachRowValues + '\n';
        }
        actualCopyAction(fullStringToCopy);
        setSnackBarDetails({ type: 'success', duration: 6000, text: 'Copied steps to clipboard. You can paste it in test page and execute.' });
        setSelectedSteps(selectedSteps);
    }

    const closeSnackBar = () => {
        //This is needed for re-rendering on clicking same button again.
        setSnackBarDetails({ type: 'info', duration: 6000, text: '' });
    };

    const closeEditTestCaseDialog = async (data: string) => {
        let stepCount = 0;
        setIsEditExistingCaseDialogShown(false);
        data.split("\n").forEach(e => {
            if (e.startsWith('|') && e.endsWith('|')) {
                ++stepCount;
                let step: Step = { id: Math.random(), step: e, help: '' }
                setSelectedSteps((prevState) => [...prevState, step]);
            }
        });
        if (stepCount > 0) {
            setSnackBarDetails({ type: 'info', duration: 3000, text: 'Populated ' + stepCount + ' step' + (stepCount === 1 ? '.' : 's.') });
            setInTextProp(true);
        } else {
            setSnackBarDetails({ type: 'error', duration: 3000, text: 'No valid step found.' });
        }
    }

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
        setIsEditSuggestionsDialogShown(false);
    };

    const showEditExistingCaseDialog = () => {
        setIsEditExistingCaseDialogShown(true);
    };

    const showEditSuggestionsDialog = () => {
        setIsEditSuggestionsDialogShown(true);
    };

    const showDataDrivenGrid = () => {
        setShowDataDrivenGrid(true);
        setSnackBarDetails({ type: 'info', duration: 10000, text: 'For better report, use the first line on the top table as "Set test name @testName"' });
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
        }
        setInTextProp(true);
    };

    const addSampleSteps = async () => {
        let value = await sampleStepsService.getSampleSteps(props.radioSelected.split('-')[0]);
        let stepsToBeAdded: Step[] = value;
        stepsToBeAdded.forEach((e) => appendSelectedSteps(e.step));
    };

    const getSampleStepFor = async (text: string) => {
        let value = await sampleStepsService.getSampleSteps(props.radioSelected.split('-')[0] + text);
        let stepsToBeAdded: Step[] = value;
        stepsToBeAdded.forEach((e) => appendSelectedSteps(e.step));
    };

    const apiSampleStepDropdownOptions = ['GET Steps', 'POST Steps', 'PUT Steps', 'DELETE Steps'];
    const setupSampleStepDropdownOptions = ['Database Setup', 'Browser Setup', 'Mobile Setup', 'API Setup', 'General Setup'];

    const onDragEnd = (result) => {
        const { destination, source } = result;
        if (!destination) return;
        if (destination.droppableId === source.draggableId && destination.index === source.index) return;

        let sourceText = selectedSteps[source.index];
        let updatedDestIndex = destination.index > source.index ? destination.index - 1 : destination.index;

        selectedSteps.splice(source.index, 1);
        selectedSteps.splice(updatedDestIndex, 0, sourceText);

        setSelectedSteps(selectedSteps);
        props.setRunEffectState(!props.runEffectState);
    };

    let onDeleteStep = (step: Step) => {
        setSelectedSteps(selectedSteps.filter((e) => !(e.id === step.id)));
        setInTextProp(selectedSteps.length === 0 ? false : true);
    };

    let onCopyStep = (step: Step) => {
        let textToCopy = selectedSteps.find((e) => step.id === e.id).step;
        var textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        setSnackBarDetails({ type: 'success', duration: 6000, text: 'Copied step to clipboard. You can paste it in the test case.' });
        document.body.removeChild(textArea);
    };

    let onHelpStep = (step: Step) => {
        setSnackBarDetails({ type: 'info', duration: 6000, text: step.help });
    };

    const updateStepTextChange = (valuePassed: any) => {
        const htmlElementId = valuePassed.currentTarget.id;
        const identifier = htmlElementId.split('-')[0];
        const count = htmlElementId.split('-')[1];
        const text = valuePassed.currentTarget.innerHTML;

        const index = selectedSteps.findIndex((e) => identifier.includes(e.id));
        let items = [...selectedSteps];
        let item = { ...items[index] };

        var updatedString = item.step
            .split('|')
            .map((eachStep, index) => (index.toString().includes(count) ? text : eachStep))
            .join('|');

        item.step = updatedString;
        items[index] = item;
        setSelectedSteps(items);
    };

    const clearSteps = () => {
        setSelectedSteps([]);
        setInTextProp(false);
        setDataHeaders(['testName']);
        setDataRows(new Map());
        setShowDataDrivenGrid(false);
    };

    const getSelectedStepsTextValueOnCopy = (): string => {
        return selectedSteps.map((e) => e.step).join('\n');
    }

    const actualCopyAction = (textToCopy) => {
        var textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

    }

    const onCopyAllSteps = () => {
        let textToCopy = '^|script|\n' + getSelectedStepsTextValueOnCopy();
        actualCopyAction(textToCopy);
        setSnackBarDetails({ type: 'success', duration: 6000, text: 'Copied steps to clipboard. You can paste it in test page and execute.' });
        setSelectedSteps(selectedSteps);
    };

    const getSelectedCellsAsPlainText = (eachStep: Step) => {
        let currentStep = eachStep.step;
        if (selectedSteps.findIndex((e) => e.id === eachStep.id) === -1) {
            selectedSteps.push(eachStep);
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
                                onBlur={(e) => updateStepTextChange(e)}
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
                                onBlur={(e) => updateStepTextChange(e)}
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
                                onBlur={(e) => updateStepTextChange(e)}
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
                                                            <TableCell>{getSelectedCellsAsPlainText(e)}</TableCell>
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
                        appendSelectedSteps(newStep);
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
            {selectedSteps.length > 1 && isShowDataDrivenGrid &&
                <div style={{ maxWidth: '90vw', overflowX: 'auto' }}>
                    <hr />
                    <table>
                        <tbody>
                            <tr>
                                {dataRowHeaders.map((eachHeader: string) =>
                                    <td>
                                        {dataRowHeaders.indexOf(eachHeader) > 0 && <IconButton size="small" onClick={() => onClickDeleteColumn(dataRowHeaders.indexOf(eachHeader))}>
                                            <Delete />
                                        </IconButton>}
                                    </td>
                                )}
                            </tr>
                            <tr>
                                {dataRowHeaders.map((e: string, index: number) => (
                                    <td>
                                        <input placeholder={e} disabled={index === 0}
                                            onBlur={(value) => updateDataRowHeaders(index, value)}
                                        ></input>
                                    </td>
                                ))}
                            </tr>
                            {[...dataRows.keys()].map(key =>
                                <tr>
                                    {dataRows.get(key).map(val => (
                                        <td>
                                            <input type='text' placeholder={val ? val : 'Enter Value'}
                                                onBlur={(value) => updateDataRowValues(key, dataRows.get(key).indexOf(val), value)}></input>
                                        </td>
                                    ))}
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Stack direction="row" spacing={1}>
                        <Button color="success" variant="outlined" size='small' startIcon={<Add />} onClick={onClickAddRow}>
                            Add Row
                        </Button>
                        <Button color="info" size='small' variant="outlined" startIcon={<Add />} onClick={onClickAddColumn}>
                            Add Column
                        </Button>
                    </Stack>
                    <hr />
                </div>
            }
            <br />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '10px' }}>
                {selectedSteps.length === 0 && (
                    <Tooltip title={<span className="tooltip">Populate steps to modify existing test case.</span>}>
                        <Button color="secondary" variant="contained" startIcon={<List />} onClick={showEditExistingCaseDialog}>
                            Populate
                        </Button>
                    </Tooltip>
                )}
                {selectedSteps.length > 1 && (
                    <Tooltip title={<span className="tooltip">Make steps data driven.</span>}>
                        <Button color="secondary" variant="contained" startIcon={<GridOn />} onClick={showDataDrivenGrid}>
                            Data Driven
                        </Button>
                    </Tooltip>
                )}
                {props.radioSelected.length > 0 && (
                    <Tooltip title={<span className="tooltip">Rename/delete this area or edit available suggestions for {props.radioSelected.split('-')[0].toUpperCase()}</span>}>
                        <Button color="secondary" variant="contained" startIcon={<Edit />} onClick={showEditSuggestionsDialog}>
                            Manage Steps
                        </Button>
                    </Tooltip>
                )}
                <Stack direction="row" spacing={1}>
                    {isEditExistingCaseDialogShown && (
                        <ExistingTestEditPage closeDialog={closeEditTestCaseDialog} />
                    )}
                    {isEditSuggestionsDialogShown && (
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
                            tooltipText="SetUp steps need to go to SetUp page. Do not combine SetUp and test steps. "
                            options={setupSampleStepDropdownOptions}
                            handleMenuItemClick={getSampleStepFor}
                        ></SplitButton>
                    ) : props.radioSelected.includes('browser') || props.radioSelected.includes('mobile') ? (
                        <Tooltip title={<span className="tooltip">Add Sample {props.radioSelected.split('-')[0].toUpperCase()} Steps</span>}>
                            <IconButton style={{ background: '##5CA9FE' }} onClick={addSampleSteps}>
                                <Add />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        false
                    )}
                    {selectedSteps.length > 0 && (
                        <Tooltip title={<span className="tooltip">Delete all steps above.</span>}>
                            <IconButton style={{ background: 'lightcoral' }} onClick={clearSteps}>
                                <ClearRounded />
                            </IconButton>
                        </Tooltip>
                    )}
                    {selectedSteps.length > 0 && (
                        <Tooltip title={<span className="tooltip">Copy steps above to be pasted in test case.</span>}>
                            <IconButton style={{ background: 'yellowgreen' }} onClick={isShowDataDrivenGrid
                                ? onClickConvertButton
                                : onCopyAllSteps}>
                                <CopyAllTwoTone />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            </div>
        </div >
    );
}

MethodListTable.propTypes = {
    tabValue: PropTypes.string.isRequired,
    radioSelected: PropTypes.string.isRequired,
    runEffectState: PropTypes.bool.isRequired,
    setRunEffectState: PropTypes.func.isRequired
};

export default MethodListTable;
