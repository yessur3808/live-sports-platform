import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { App } from "./App.tsx";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#2dd4bf" },
    secondary: { main: "#fb923c" },
    background: { default: "#07131b", paper: "#0d1c26" },
    text: { primary: "#e6f1f5", secondary: "#9db3bf" },
    divider: "rgba(158, 184, 197, 0.2)",
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily:
      '"Space Grotesk", "Plus Jakarta Sans", "Avenir Next", "Segoe UI", sans-serif',
    h4: {
      fontFamily:
        '"Sora", "Space Grotesk", "Plus Jakarta Sans", "Avenir Next", sans-serif',
      fontWeight: 700,
      letterSpacing: -0.5,
    },
    h6: {
      fontWeight: 700,
      letterSpacing: -0.2,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          backgroundImage: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(7, 19, 27, 0.5)",
          },
        },
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
