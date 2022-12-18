import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tab, Tabs, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomSnackBar from "../components/CustomSnackBar";
import GuidedTour from "../components/GuidedTour";
import MethodListTable from "../components/MethodListTable";
import StepAreaRadioButton from "../components/StepAreaRadioButton";

const HomePage = () => {

    const navigate = useNavigate();

    /*Hardcoded value for testing
    const [radioValues, setRadioValues] = useState(["1", "2"]);
    const [steps, setSteps] = useState([{ id: 1, "step": "|Set request headers |applicationReferenceId=$value,first_name=FirstName,last_name=LastName|", "help": "help1" }, { id: 2, "step": "|Set form values|key1:value1,key2:value2|  ", "help": "help2" }]);
    //*/
    ///*
    const [currentTabValue, setCurrentTabValue] = useState('generic');
    const [allStepsJson, setAllStepsJson] = useState({});
    const [radioValues, setRadioValues] = useState([]);
    const [steps, setSteps] = useState([]);
    //*/
    const [radioSelected, setRadioSelected] = useState('');
    const [openNewAreaDialog, setOpenNewAreaDialog] = useState(false);
    const [newAreaTextValue, setNewAreaTextValue] = useState('');
    const [showSnackBar, setShowSnackBar] = useState(false);

    let currentOrigin = window.location.origin;
    useEffect(() => {
        if (radioValues.length === 0) {
            fetch(currentOrigin + '/files/all-steps.json')
                .then(response => { return response.json(); })
                .then(data => {
                    setAllStepsJson(data);
                    let currentValue: string[] = data.generic;
                    setRadioValues(currentValue.map(e => {
                        return e.replace(currentTabValue + '-', "");
                    }));
                });
        }
    }, [currentOrigin, radioValues.length, currentTabValue]);

    const closeSnackBar = () => {
        //This is needed for re-rendering on clicking same button again.
        setShowSnackBar(false);
    }

    const handleTabValueChange = (event: React.SyntheticEvent, newValue: string) => {
        setCurrentTabValue(newValue);
        let nodes = allStepsJson[newValue].map(e => e.replace(newValue + "-", ""));
        setRadioValues(nodes);
    };

    const changedRadioSelection = (radioValue: string) => {
        setRadioSelected(radioValue);
        fetch(currentOrigin + '/files/' + currentTabValue + '-' + radioValue)
            .then(response => {
                return response.json();
            })
            .then(data => {
                setSteps(data);
            }).catch(e => {
                setSteps([]);
            });
    };

    const handleOpenNewAreaDialog = () => {
        setOpenNewAreaDialog(true);
    };

    const handleSaveNewAreaDialog = () => {
        addSteps();
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
            let radio = prevState ? prevState.split("-")[1] : '';
            return event.target.value + '-' + radio;
        });
    };

    const handleAreaTextBoxChange = (event) => {
        setNewAreaTextValue((prevState) => {
            let team = prevState ? prevState.split("-")[0] : '';
            return team + '-' + event.target.value;
        });
    };

    const addSteps = async () => {
        if (newAreaTextValue.length > 0) {
            let area = newAreaTextValue.split("-")[0];
            let radio = newAreaTextValue.split("-")[1];

            let stringified = '';
            if (Object.keys(allStepsJson).length === 0) {
                stringified = '{"' + area + '": ["' + area + '-' + radio + '-steps.json"]}';
            } else if (Object.keys(allStepsJson).includes(area)) {
                allStepsJson[area].push(area + '-' + radio + '-steps.json');
                stringified = JSON.stringify(allStepsJson);
            } else {
                stringified = JSON.stringify(allStepsJson).replace('}', ',"' + area + '":["' + area + '-' + radio + '-steps.json]}');
            }
            //First update the all-steps.json
            let urlToTrigger = window.location.origin + '/SaveSteps?test&nohistory&FILE_NAME=all-steps.json&CONTENT=' + stringified + "&CREATE_FILE=true";
            await fetch(urlToTrigger);
            //Next create a file
            urlToTrigger = window.location.origin + '/SaveSteps?test&nohistory&FILE_NAME=' + newAreaTextValue + '-steps.json&CONTENT=[{"id": 1,"step": "","help": ""}]&CREATE_FILE=true';
            await fetch(urlToTrigger);
        }
    };

    return (<div className='margin center-align'>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", gap: "20px" }}>
            <GuidedTour />
            <Button id='add-new-area' onClick={handleOpenNewAreaDialog} color="primary" variant="contained" style={{ textTransform: 'none' }}>Add New Area</Button>
            <Button onClick={() => navigate('/others')} color="primary" variant="contained" style={{ textTransform: 'none' }}>Other Tasks</Button>
        </div>
        <div style={{ width: "70%" }}>
            <Tabs variant="fullWidth" value={currentTabValue} onChange={handleTabValueChange}>
                {Object.keys(allStepsJson).map((e: string) =>
                    <Tab color="#9CCBF7" value={e} label={e} />
                )};
            </Tabs>
            <StepAreaRadioButton radioValues={radioValues} tabValue={currentTabValue} valueSelected={changedRadioSelection} />
            <Dialog open={openNewAreaDialog} onClose={handleCloseNewAreaDialog} style={{ textAlign: "center" }}>
                <DialogTitle>Add New Area</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Team name will appear as tab. Area name will appear as radio button.
                    </DialogContentText>
                    <br />
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", gap: "10px" }}>
                        <TextField autoFocus onKeyPress={(e) => validateNewName(e)} onChange={handleTeamTextBoxChange} fullWidth id="standard-basic" label="Team name" variant="standard" />
                        <TextField onKeyPress={(e) => validateNewName(e)} onChange={handleAreaTextBoxChange} fullWidth id="standard-basic" label="Area name" variant="standard" />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSaveNewAreaDialog} disabled={!(newAreaTextValue.split('-')[0].length > 0) || !(newAreaTextValue.split('-')[1].length > 0)} >Save</Button>
                </DialogActions>
            </Dialog>
        </div>
        <MethodListTable tabValue={currentTabValue} stepList={steps} radioSelected={radioSelected}></MethodListTable>
        {showSnackBar && <CustomSnackBar snackBarMessage='Steps added.' type={'success'} duration={6000} closeSnackBar={closeSnackBar} />}
    </div >);
}

export default HomePage;
