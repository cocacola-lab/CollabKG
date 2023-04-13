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
  },
});
