// theme.js
import { createTheme } from '@mui/material/styles';

const colors = {
  forest: '#386641',
  boxGreen: '#7aa374',
  softCream: '#f2e8cf',
  lightCream: '#fbf7ef',
  burgundy: '#bc4749',
  black: '#0f0f0f',
};

export const getTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,

      primary: {
        main: colors.forest,                // Navbar stays forest
        contrastText: colors.lightCream,
      },

      secondary: {
        main: colors.burgundy,
      },

      background: {
        default: mode === 'dark'
          ? colors.black                   // 🖤 dark page background
          : colors.lightCream,

        paper: mode === 'dark'
          ? '#1b2a1b'                       // 🌲 dark box green
          : colors.boxGreen,
      },

      text: {
        primary: mode === 'dark'
          ? colors.lightCream              // cream text on dark
          : '#1f2d1f',

        secondary: mode === 'dark'
          ? colors.softCream
          : '#3a4f3a',
      },

      divider: mode === 'dark'
        ? '#2f3f2f'
        : '#cfd6c9',
    },

    typography: {
      fontFamily: "'Google Sans Code', monospace",
      h1: { fontFamily: "'Jersey 20', sans-serif" },
      h2: { fontFamily: "'Jersey 20', sans-serif" },
      h3: { fontFamily: "'Jersey 20', sans-serif" },
      h4: { fontFamily: "'Jersey 20', sans-serif" },
      h5: { fontFamily: "'Jersey 20', sans-serif" },
      h6: { fontFamily: "'Jersey 20', sans-serif" },
    },

    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor:
              mode === 'dark' ? '#1b2a1b' : colors.boxGreen,
            borderRadius: 12,
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor:
              mode === 'dark' ? '#1b2a1b' : colors.boxGreen,
            borderRadius: 12,
          },
        },
      },
    },
  });
