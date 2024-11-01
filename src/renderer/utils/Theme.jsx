import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1c4b43',
      light: '#496F68',
      dark: '#13342E',
      contrastText: '#fff',
    },
    secondary: {
      main: '#e7dbba',
      light: '#EBE2C7',
      dark: '#A19982',
      contrastText: '##000000de',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  // Add other theme settings if necessary
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'inherit', // Inherit border color when focused
            boxShadow: 'none', // Remove any box-shadow
          },
        },
        notchedOutline: {
          borderWidth: '1px', // Keep border width consistent
        },
      },
    },
  },
});

export default theme;
