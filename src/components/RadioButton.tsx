import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from "@mui/material";

function RadioButton(props: any) {
    let isDataAvailable = () => {
        return props.values.length === 0
            ? 'Click above button to fetch step details.'
            : 'Select a radio below to see more details';
    }
    return (<div className="margin">
        <FormControl className="center-align">
            <FormLabel>{isDataAvailable()}</FormLabel>
            <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                name="radio-buttons-group"
                row
                onChange={e => props.valueSelected(e.target.value)}
            >
                {props.values.map((e: string) =>
                    <FormControlLabel key={e} value={e} control={<Radio />} label={e.split(".json")[0].split("-")[0]} />
                )}
            </RadioGroup>
        </FormControl>
    </div>);
}
export default RadioButton;
