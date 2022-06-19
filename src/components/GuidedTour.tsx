import { useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { Button } from "@mui/material";


const GuidedTour = () => {
    const [run, setRun] = useState(false);
    const [steps] = useState<Step[]>([
        {
            target: '#radio-group',
            content: 'Select one of the radio buttons to populate suggestions.',
            disableBeacon: true,
            placement: "auto"

        }, {
            target: '#suggestion-box',
            content: 'Type here for suggestions on the selected radio or click from dropdown.',
        },
        {
            target: '#editable-row',
            content: 'The data in green are editable. You can edit them to reflect the right data.',
        },
        {
            target: '#bottom-buttons',
            content: 'Buttons will appear on selecting a radio. Tooltip on each button shows more details.',
        }
    ]);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
        }
    };

    const handleClickStart = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        setRun(true);
    };

    return (
        <Button color="primary" variant="contained" style={{ textTransform: 'none' }} onClick={handleClickStart}>
            <Joyride
                callback={handleJoyrideCallback}
                continuous={true}
                run={run}
                scrollToFirstStep={true}
                showProgress={true}
                showSkipButton={true}
                steps={steps}
                disableCloseOnEsc={true}
                styles={{
                    options: {
                        zIndex: 10000,
                    },
                    buttonNext: { color: "primary", backgroundColor: "" },
                    buttonBack: { color: "primary" },
                }} />Show How To Create Test
        </Button >
    );
};

export default GuidedTour;
