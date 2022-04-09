import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from "@mui/material";

function StepAreaRadioButton(props: any) {

    return (
        <FormControl className="center-align margin">
            <FormLabel>Select a radio to populate steps.</FormLabel>
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
        </FormControl>);
}
export default StepAreaRadioButton;
