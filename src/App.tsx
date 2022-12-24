import { createTheme, ThemeProvider } from '@mui/material';
import './App.css';
import HomePage from './pages/Home';

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
            <HomePage />
        </ThemeProvider>
    );
}

export default App;
