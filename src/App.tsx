import { createTheme, ThemeProvider } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './pages/Home';
import OthersPage from './pages/Others';

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
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />}></Route>
          <Route path='others' element={<OthersPage />}></Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
