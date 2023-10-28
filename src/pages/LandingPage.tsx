import WriteTestPage from './WriteTestPage';
import { useState } from 'react';
import { Button } from '@mui/material';
import OthersPage from './OthersPage';
import FAQPage from './FAQPage';

const LandingPage = () => {

    enum PAGE {
        TEST,
        OTHER,
        FAQ
    }

    const [pageText, setPageText] = useState(PAGE.TEST);

    return (
        <>
            <div className="margin" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '20px' }}>
                <Button href={window.location.origin} color="primary" variant="contained" style={{ textTransform: 'none' }}>
                    Back to FitNesse</Button>
                {(pageText !== PAGE.TEST) && <Button onClick={() => setPageText(PAGE.TEST)} color="primary" variant="contained" style={{ textTransform: 'none' }}>
                    Test
                </Button>}
                {(pageText !== PAGE.OTHER) && <Button onClick={() => setPageText(PAGE.OTHER)} color="primary" variant="contained" style={{ textTransform: 'none' }}>
                    Other Tasks
                </Button>}
                {(pageText !== PAGE.FAQ) && <Button onClick={() => setPageText(PAGE.FAQ)} color="primary" variant="contained" style={{ textTransform: 'none' }}>
                    FAQ
                </Button>}
            </div>
            {(pageText === PAGE.TEST) && <WriteTestPage />}
            {(pageText === PAGE.OTHER) && <OthersPage />}
            {(pageText === PAGE.FAQ) && <FAQPage />}
        </>
    );
};

export default LandingPage;
