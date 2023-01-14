import { createTheme, ThemeProvider } from '@mui/material';
import './App.css';
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
        <ThemeProvider theme={theme}>
            <LandingPage />
        </ThemeProvider>
    );
}

export default App;
