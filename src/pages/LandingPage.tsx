import { Close } from '@mui/icons-material';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Tab, Tabs, TextField } from '@mui/material';
import { _ } from 'ag-grid-community';
import { useState, useEffect, useReducer } from 'react';
import CustomSnackBar from '../components/CustomSnackBar';
import GuidedTour from '../components/GuidedTour';
import MethodListTable from '../components/MethodListTable';
import StepAreaRadioButton from '../components/StepAreaRadioButton';
import { fileService } from '../services/persist-file-changes';
import OthersPage from './OthersPage';

const LandingPage = () => {

    const ACTIONS = {
        UPDATE_TAB_VALUE: 'update',
        RADIO_SELECTED: 'radioChanged'
    }

    const reducer = (state, action) => {
        switch (action.type) {
            case ACTIONS.UPDATE_TAB_VALUE:
                return action.payload;
            case ACTIONS.RADIO_SELECTED:
                return ({ ...state, radioSelected: action.payload.radioSelected });
            default:
                return state;
        }
    };

    const [currentTabValueState, currentTabValueDispatch] = useReducer(reducer, { currentTabValue: 'generic', radioValues: [], radioSelected: '' });
    const [allStepsJson, setAllStepsJson] = useState({});
    const [steps, setSteps] = useState([]);
    const [openOthersDialog, setOpenOthersDialog] = useState(false);
    const [openNewAreaDialog, setOpenNewAreaDialog] = useState(false);
    const [newAreaTextValue, setNewAreaTextValue] = useState('');
    const [showSnackBar, setShowSnackBar] = useState(false);
    const [runEffect, setRunEffect] = useState(false);
    const [saveClicked, setSaveClicked] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            await fileService.readFile('all-steps.json').then(async (response) => {
                const data = await response.json();
                setAllStepsJson(data);
                let currentValue: string[] = data.generic;
                currentTabValueDispatch({ type: ACTIONS.UPDATE_TAB_VALUE, payload: { currentTabValue: 'generic', radioValues: currentValue.map((e) => e.replace('generic-', '')) }, radioSelected: '' })
            });
        };
        fetchData();
    }, [runEffect, ACTIONS.UPDATE_TAB_VALUE]);

    const closeSnackBar = () => {
        //This is needed for re-rendering on clicking same button again.
        setShowSnackBar(false);
    };

    const handleTabValueChange = (event: React.SyntheticEvent, newValue: string) => {
        let nodes = allStepsJson[newValue].map((e: string) => e.replace(newValue + '-', ''));
        currentTabValueDispatch({ type: ACTIONS.UPDATE_TAB_VALUE, payload: { currentTabValue: newValue, radioValues: nodes }, radioSelected: '' });
    };

    const changedRadioSelection = (radioValue: string) => {
        currentTabValueDispatch({ type: ACTIONS.RADIO_SELECTED, payload: { radioSelected: radioValue } })
        fileService
            .readFile(currentTabValueState.currentTabValue + '-' + radioValue)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                setSteps(data);
            })
            .catch((e) => {
                setSteps([]);
            });
    };

    const handleOpenOthersDialog = () => {
        setOpenOthersDialog(true);
    };

    const handleCloseOpenOthersDialog = () => {
        setOpenOthersDialog(false);
    };

    const handleOpenNewAreaDialog = () => {
        setOpenNewAreaDialog(true);
    };

    const handleSaveNewAreaDialog = async () => {
        setSaveClicked(true);
        await addNewArea();
        setSaveClicked(false);
        handleCloseNewAreaDialog();
        setShowSnackBar(true);
    };

    const handleCloseNewAreaDialog = () => {
        setOpenNewAreaDialog(false);
        setNewAreaTextValue('');
    };

    const validateNewName = (e) => {
        const validChars = new RegExp('[0-9a-zA-Z_]');
        if (!validChars.test(e.key)) {
            e.preventDefault();
        }
    };

    const handleTeamTextBoxChange = (event) => {
        setNewAreaTextValue((prevState) => {
            let radio = prevState ? prevState.split('-')[1] : '';
            return event.target.value + '-' + radio;
        });
    };

    const handleAreaTextBoxChange = (event) => {
        setNewAreaTextValue((prevState) => {
            let team = prevState ? prevState.split('-')[0] : '';
            return team + '-' + event.target.value;
        });
    };

    const addNewArea = async () => {
        if (newAreaTextValue.length > 0) {
            let area = newAreaTextValue.split('-')[0];
            let radio = newAreaTextValue.split('-')[1];
            let stringified = '';
            if (Object.keys(allStepsJson).length === 0) {
                stringified = '{"' + area + '": ["' + area + '-' + radio + '-steps.json"]}';
            } else if (Object.keys(allStepsJson).includes(area)) {
                let copiedAllStepsJson = _.deepCloneObject(allStepsJson);
                copiedAllStepsJson[area].push(area + '-' + radio + '-steps.json');
                stringified = JSON.stringify(copiedAllStepsJson);
            } else {
                stringified = JSON.stringify(allStepsJson).replace('}', ',"' + area + '":["' + area + '-' + radio + '-steps.json"]}');
            }
            //First update the all-steps.json by replacing the file.
            await fileService.persistFile('all-steps.json', stringified);
            //Next create a file
            await fileService.persistFile(newAreaTextValue + '-steps.json', '[{"id": 1,"step": "|sample step|","help": ""}]');
            setRunEffect(!runEffect);
        }
    };

    return (
        <div className="margin center-align">
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', gap: '20px' }}>
                <GuidedTour />
                <Button id="add-new-area" onClick={handleOpenNewAreaDialog} color="primary" variant="contained" style={{ textTransform: 'none' }}>
                    Add New Area
                </Button>
                <Button onClick={handleOpenOthersDialog} color="primary" variant="contained" style={{ textTransform: 'none' }}>
                    Other Tasks
                </Button>
            </div>
            <div style={{ width: '70%' }}>
                <Tabs variant="fullWidth" value={currentTabValueState.currentTabValue} onChange={handleTabValueChange}>
                    {Object.keys(allStepsJson).map((e: string) => (
                        <Tab color="#9CCBF7" value={e} label={e} />
                    ))}
                    ;
                </Tabs>
                <StepAreaRadioButton tabValue={currentTabValueState.currentTabValue} radioValues={currentTabValueState.radioValues} valueSelected={changedRadioSelection} />
                <Dialog open={openNewAreaDialog} onClose={handleCloseNewAreaDialog} style={{ textAlign: 'center' }}>
                    <DialogTitle>Add New Area</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Team name will appear as new/current tab. Area name will appear as radio button.</DialogContentText>
                        <br />
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', gap: '10px' }}>
                            <TextField autoFocus onKeyPress={(e) => validateNewName(e)} onChange={handleTeamTextBoxChange} fullWidth id="standard-basic" label="Team name" variant="standard" />
                            <TextField onKeyPress={(e) => validateNewName(e)} onChange={handleAreaTextBoxChange} fullWidth id="standard-basic" label="Area name" variant="standard" />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        {saveClicked && <CircularProgress variant="indeterminate" color="info" />}
                        <Button onClick={handleSaveNewAreaDialog} disabled={!(newAreaTextValue.split('-')[0].length > 0) || !(newAreaTextValue.split('-')[1].length > 0)}>
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog fullScreen maxWidth="lg" open={openOthersDialog} onClose={handleCloseNewAreaDialog} style={{ textAlign: 'center' }}>
                    <DialogTitle style={{ display: 'flex', justifyContent: 'space-between' }}>
                        Other Tasks
                        <IconButton onClick={handleCloseOpenOthersDialog}>
                            <Close />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        You can encrypt/decrypt text here to put in FitNesse tests. This is useful for avoiding plain text password etc. in the test case.
                        <OthersPage />
                    </DialogContent>
                </Dialog>
            </div>
            <MethodListTable runEffectState={runEffect} setRunEffectState={setRunEffect} tabValue={currentTabValueState.currentTabValue} stepList={steps} radioSelected={currentTabValueState.radioSelected ?? ''}></MethodListTable>
            {showSnackBar && <CustomSnackBar snackBarMessage="Steps added." type={'success'} duration={6000} closeSnackBar={closeSnackBar} />}
        </div>
    );
};

export default LandingPage;
