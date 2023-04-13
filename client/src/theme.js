import { createTheme } from "@mui/material";
import { cyan, teal, grey } from "@mui/material/colors";

export const theme = createTheme({
  palette: {
    primary: {
      main: cyan[700],
      light: cyan[400]
    },
    secondary: {
      main: grey[500],
    },
    custom: {
      light: '#42a5f5',
      main: '#1976d2',
      dark: '#1565c0',
    },
  },
});
