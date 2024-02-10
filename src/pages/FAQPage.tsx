import { ArrowDownward } from "@mui/icons-material";
import { Accordion, AccordionSummary, Typography, AccordionDetails } from "@mui/material";
import React from "react";

const FAQPage = () => {
    const [expanded, setExpanded] = React.useState<string | false>(false);

    const handleChange =
        (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
            setExpanded(isExpanded ? panel : false);
        };

    return (
        <div style={{ width: '80%', padding: '0 10%' }}>
            <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                <AccordionSummary
                    expandIcon={<ArrowDownward />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                >
                    <Typography sx={{ width: '33%', flexShrink: 0 }}>
                        Create test
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>How to create test</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <ul>
                        <li>Click the "Test" button on top to go to test creation page.</li>
                        <li>Click the help icon to see the steps to write a test.</li>
                        <li>Once you are ready with the steps, copy the text and go to home page. Navigate to your desired folder and create a test page. Paste the content of the created steps and click Test.</li>
                    </ul>
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                <AccordionSummary
                    expandIcon={<ArrowDownward />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                >
                    <Typography sx={{ width: '33%', flexShrink: 0 }}>
                        Create data driven test
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>Repeat steps with different data</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <ul>
                        <li>Create a test or populate existing steps by clicking the relevant buttons.</li>
                        <li>Now click the Data Driven button which will open up a table of rows and columns.</li>
                        <li>Once you fill up the table with right data, ensure that the parameters are used in the scenario. Copy the content and paste it in FitNesse page to test.</li>
                    </ul>
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                <AccordionSummary
                    expandIcon={<ArrowDownward />}
                    aria-controls="panel2bh-content"
                    id="panel2bh-header"
                >
                    <Typography sx={{ width: '33%', flexShrink: 0 }}>Other tasks</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                        Important tasks
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Following tasks can be peformed using this helper tool.
                        <ul>
                            <li>Encrypt or decrypt texts.</li>
                        </ul>
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </div>
    );
};

export default FAQPage;
