import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import ChatPage from "./pages/ChatPage";
import ChartPage from "./pages/ChartPage";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Poppin blue
    },
    secondary: {
      main: "#ff4081", // Accent color
    },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Banking Data Analysis
            </Typography>
            <Button color="inherit" component={Link} to="/chat">
              Chat
            </Button>
            <Button color="inherit" component={Link} to="/charts">
              Charts
            </Button>
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/charts" element={<ChartPage />} />
            <Route path="/" element={<ChatPage />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
};

export default App;
