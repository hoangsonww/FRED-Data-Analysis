import React, { useMemo, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  CssBaseline,
  createTheme,
  ThemeProvider,
  GlobalStyles,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  Home as HomeIcon,
} from "@mui/icons-material";
import ChatIcon from "@mui/icons-material/Chat";
import BarChartIcon from "@mui/icons-material/BarChart";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
import ChartPage from "./pages/ChartPage";

const navItems = [
  { text: "Home", icon: <HomeIcon />, link: "/" },
  { text: "Chat", icon: <ChatIcon />, link: "/chat" },
  { text: "Charts", icon: <BarChartIcon />, link: "/charts" },
] as const;

const App: React.FC = () => {
  // detect system preference
  const systemPrefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  // read stored preference or fallback to system preference
  const getInitialMode = () => {
    const stored = window.localStorage.getItem("themeMode");
    if (stored === "light" || stored === "dark") {
      return stored as "light" | "dark";
    }
    return systemPrefersDark ? "dark" : "light";
  };

  const [mode, setMode] = useState<"light" | "dark">(getInitialMode);

  // whenever mode changes, persist it
  const toggleColorMode = () => {
    const next = mode === "light" ? "dark" : "light";
    window.localStorage.setItem("themeMode", next);
    setMode(next);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#1976d2" },
          secondary: { main: "#ff4081" },
        },
        typography: { fontFamily: "Poppins, sans-serif" },
      }),
    [mode],
  );

  // switch to mobile nav when viewport is 800px or less
  const isMobile = useMediaQuery("(max-width:800px)");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const toggleDrawer = (open: boolean) => () => setDrawerOpen(open);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles
        styles={{ body: { transition: "background-color 0.3s, color 0.3s" } }}
      />
      <CssBaseline />

      <AppBar
        position="static"
        sx={{ backdropFilter: "blur(4px)", px: { xs: 1, sm: 2 } }}
      >
        <Toolbar disableGutters sx={{ mx: { xs: 0, sm: 2 } }}>
          {isMobile && (
            <Tooltip title="Open menu">
              <IconButton
                color="inherit"
                onClick={toggleDrawer(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}

          <Typography
            variant="h6"
            component={NavLink}
            to="/"
            end
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              color: "inherit",
              fontWeight: 700,
              px: 2,
            }}
          >
            FRED Data Analysis
          </Typography>

          {!isMobile &&
            navItems.map((item) => (
              <Tooltip key={item.text} title={item.text}>
                <Box
                  component={NavLink}
                  to={item.link}
                  end={item.link === "/"}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    textDecoration: "none",
                    color: "inherit",
                    px: 3,
                    py: 1.5,
                    mx: 0.5,
                    borderRadius: 2,
                    transition: "background 0.2s, color 0.2s",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.dark,
                    },
                    "&.active": {
                      backgroundColor: theme.palette.primary.dark,
                      color: theme.palette.primary.contrastText,
                    },
                    "&.active:hover": {
                      backgroundColor: theme.palette.primary.dark,
                      color: theme.palette.primary.contrastText,
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "inherit", minWidth: 32 }}>
                    {item.icon}
                  </ListItemIcon>
                  <Typography
                    sx={{ ml: 0.5, textTransform: "none", fontWeight: 500 }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              </Tooltip>
            ))}

          <Tooltip title="Toggle light/dark mode">
            <IconButton
              onClick={toggleColorMode}
              color="inherit"
              sx={{ ml: 2 }}
            >
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        ModalProps={{ keepMounted: true }}
      >
        <Box
          sx={{ width: 260 }}
          role="presentation"
          onClick={toggleDrawer(false)}
        >
          <List sx={{ pt: 2 }}>
            {navItems.map((item) => (
              <ListItemButton
                key={item.text}
                component={NavLink}
                to={item.link}
                end={item.link === "/"}
                selected={location.pathname === item.link}
                sx={{
                  mb: 1,
                  mx: 1,
                  borderRadius: 2,
                  transition: "background 0.2s, color 0.2s",
                  "&.active": {
                    backgroundColor: theme.palette.primary.dark,
                    color: theme.palette.primary.contrastText,
                  },
                  "&.active:hover": {
                    backgroundColor: theme.palette.primary.dark,
                    color: theme.palette.primary.contrastText,
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ padding: 0 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/charts" element={<ChartPage />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
};

const AppWithRouter: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
