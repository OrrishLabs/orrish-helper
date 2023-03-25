import { createTheme, ThemeProvider } from '@mui/material';
import './App.css';
import { AvailableStepProvider } from './contexts/AvailableStepContext';
import LandingPage from './pages/LandingPage';

function App() {
    const theme = createTheme({
        palette: {
            primary: {
                main: '#5CA9FE'
            },
            secondary: {
                main: '#DFDCE3'
            }
        }
    });

    return (
        <AvailableStepProvider>
            <ThemeProvider theme={theme}>
                <LandingPage />
            </ThemeProvider>
        </AvailableStepProvider>
    );
}

export default App;
