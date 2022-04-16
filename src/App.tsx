import { useEffect, useState } from 'react';
import StepAreaRadioButton from './components/StepAreaRadioButton';
import MethodListTable from './components/MethodListTable';
import GuidedTour from './components/GuidedTour';
import './App.css';

function App() {

  /*Hardcoded value for testing
  const [radioValues, setRadioValues] = useState(["1", "2"]);
  const [steps, setSteps] = useState([{ id: 1, "step": "|Set request headers |applicationReferenceId=$value,first_name=FirstName,last_name=LastName|", "help": "help1" }, { id: 2, "step": "|Set form values|key1:value1,key2:value2|  ", "help": "help2" }]);
  //*/
  ///*
  const [radioValues, setRadioValues] = useState([]);
  const [steps, setSteps] = useState([]);
  //*/
  const [radioSelected, setRadioSelected] = useState('');

  let currentOrigin = window.location.origin;

  useEffect(() => {
    if (radioValues.length === 0) {
      fetch(currentOrigin + '/files/all-steps.json')
        .then(response => { return response.json(); })
        .then(data => {
          setRadioValues(data.steps);
        });
    }
  }, [currentOrigin, radioValues.length]);

  const changedRadioSelection = (value: string) => {
    setRadioSelected(value);
    fetch(currentOrigin + '/files/' + value)
      .then(response => {
        return response.json();
      })
      .then(data => {
        setSteps(data);
      }).catch(e => {
        setSteps([]);
      });
  };


  return (
    <div className='margin center-align'>
      <GuidedTour />
      <StepAreaRadioButton values={radioValues} valueSelected={changedRadioSelection} />
      <MethodListTable stepList={steps} radioSelected={radioSelected}></MethodListTable>
    </div>
  );
}

export default App;
