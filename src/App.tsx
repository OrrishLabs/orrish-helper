import { useState } from 'react';
import RadioButton from './components/RadioButton';
import MethodListTable from './components/MethodListTable';
import './App.css';
import { Button, Snackbar } from '@material-ui/core';
import FormDialog from './components/FormDialog';

function App() {

  /*Hardcoded value for testing
  const [radioValues, setRadioValues] = useState(["1", "2"]);
  const [steps, setSteps] = useState([{ id: 1, "step": "|Set request headers |applicationReferenceId=$value,first_name=FirstName,last_name=LastName|", "help": "help1" }, { id: 2, "step": "|Set form values|key1:value1,key2:value2|  ", "help": "help2" }]);
  //*/
  ///*
  const [radioValues, setRadioValues] = useState([]);
  const [steps, setSteps] = useState([]);
  //*/
  const [stepsAsString, setStepsAsString] = useState('');
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [radioSelected, setRadioSelected] = useState('');

  const handleClose = () => {
    setSnackBarMessage('');
  };

  let currentOrigin = window.location.origin;
  const fetchAreasHandler = () => {
    fetch(currentOrigin + '/files/all-steps.json')
      .then(response => { return response.json(); })
      .then(data => {
        setRadioValues(data.steps);
      })
  };

  const changedRadioSelection = (value: string) => {
    setRadioSelected(value);
    fetch(currentOrigin + '/files/' + value)
      .then(response => {
        return response.json();
      })
      .then(data => {
        setStepsAsString(JSON.stringify(data));
        setSteps(data);
      }).catch(e =>
        setStepsAsString('')
      );
  };

  const updateDialog = () => {
    setShowDialog(true);
  };

  const dialogClosed = () => {
    setShowDialog(false);
  };

  let getAllTexts = () => {
    setTimeout(() => {
      var textArea = document.createElement("textarea");
      textArea.value = stepsAsString;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      /*
      //This does not work on unsecured sites.
      navigator.clipboard
        .writeText(textArea.value)
        .then(() => {
          setSnackBarMessage('Steps copied to clipboard. You can use UpdateAvailableSteps page to append any steps to it.');
        })
        .catch(e => {
          setSnackBarMessage(e)
        });
        */
      setSnackBarMessage('Steps copied to clipboard. You can use UpdateAvailableSteps page to append any steps to it.');
      document.body.removeChild(textArea);
    }, 100);
  };

  return (
    <div className='margin center-align'>
      <Snackbar
        open={snackBarMessage.length > 0}
        autoHideDuration={6000}
        onClose={handleClose}
        message={snackBarMessage}
      />
      {showDialog && stepsAsString.length > 0 && <FormDialog open={true} dialogClosed={dialogClosed} getAllTexts={getAllTexts} stepsAsString={stepsAsString} />}
      {steps.length > 0
        ? (<Button variant='contained' color="primary" onClick={updateDialog}>View {radioSelected.split('-')[0]} Steps</Button>)
        : <Button variant='contained' color="primary" onClick={fetchAreasHandler}>Populate All Steps</Button>}
      <RadioButton values={radioValues} valueSelected={changedRadioSelection} />
      <MethodListTable stepList={steps}></MethodListTable>
    </div>
  );
}

export default App;
