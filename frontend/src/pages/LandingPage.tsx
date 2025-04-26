import React, { useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Container,
  useTheme,
  useMediaQuery,
  Grid,
  Paper,
  Grow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useInView } from "react-intersection-observer";
import { Link as RouterLink } from "react-router-dom";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import FunctionsIcon from "@mui/icons-material/Functions";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import DevicesIcon from "@mui/icons-material/Devices";
import SpeedIcon from "@mui/icons-material/Speed";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import ChatIcon from "@mui/icons-material/Chat";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import GitHubIcon from "@mui/icons-material/GitHub";

const GITHUB_URL = "https://github.com/hoangsonww/FRED-Banking-Data-Analysis";

const badgeUrls = [
  "https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white",
  "https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white",
  "https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white",
  "https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB",
  "https://img.shields.io/badge/MUI-007FFF?style=for-the-badge&logo=mui&logoColor=white",
  "https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white",
  "https://img.shields.io/badge/Pinecone-5D3FD3?style=for-the-badge&logo=opencontainersinitiative&logoColor=white",
  "https://img.shields.io/badge/Google%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white",
  "https://img.shields.io/badge/OpenAI-000000?style=for-the-badge&logo=openai&logoColor=white",
  "https://img.shields.io/badge/Claude%20AI-FF6F00?style=for-the-badge&logo=anthropic&logoColor=white",
  "https://img.shields.io/badge/Azure%20AI-0078D4?style=for-the-badge&logo=micropython&logoColor=white",
  "https://img.shields.io/badge/FRED%20API-003366?style=for-the-badge&logo=openmediavault&logoColor=white",
  "https://img.shields.io/badge/simple--statistics-FF6F00?style=for-the-badge&logo=apachespark&logoColor=white",
  "https://img.shields.io/badge/ml--regression-00599C?style=for-the-badge&logo=soundcharts&logoColor=white",
  "https://img.shields.io/badge/Data%20Analysis-6E6E6E?style=for-the-badge&logo=databricks&logoColor=white",
  "https://img.shields.io/badge/Recharts-FF6F00?style=for-the-badge&logo=chartdotjs&logoColor=white",
  "https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white",
  "https://img.shields.io/badge/Swagger-g?style=for-the-badge&logo=swagger&logoColor=white",
];

const features = [
  {
    title: "Interactive Charts",
    desc: "Explore dynamic line & area charts with smooth animations.",
    icon: <ShowChartIcon fontSize="large" color="primary" />,
  },
  {
    title: "AI-Powered Chatbot",
    desc: "Ask natural language questions and get data-backed answers.",
    icon: <SmartToyIcon fontSize="large" color="primary" />,
  },
  {
    title: "Multi-Regression",
    desc: "Compare linear, polynomial & logarithmic models side-by-side.",
    icon: <FunctionsIcon fontSize="large" color="primary" />,
  },
  {
    title: "Dark/Light Mode",
    desc: "Seamlessly switch themes with smooth transitions.",
    icon: <Brightness4Icon fontSize="large" color="primary" />,
  },
  {
    title: "Responsive Design",
    desc: "Looks great on desktop, tablet, and mobile.",
    icon: <DevicesIcon fontSize="large" color="primary" />,
  },
  {
    title: "High Performance",
    desc: "Lightning-fast rendering and minimal load times.",
    icon: <SpeedIcon fontSize="large" color="primary" />,
  },
];

const steps = [
  {
    icon: <CloudDownloadIcon color="primary" />,
    text: "Fetch & store FRED economic time-series in MongoDB.",
  },
  {
    icon: <ChatIcon color="primary" />,
    text: "RAG-powered AI answers with real data excerpts.",
  },
  {
    icon: <InsertChartIcon color="primary" />,
    text: "Interactive charts let you explore trends in real time.",
  },
];

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const featuresSectionRef = useRef<HTMLDivElement>(null);
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });
  const [featRef, featInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [stepsRef, stepsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [techRef, techInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [ctaRef, ctaInView] = useInView({ triggerOnce: true, threshold: 0.3 });

  const scrollToFeatures = () => {
    featuresSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Box sx={{ transition: "background-color 0.6s, color 0.6s" }}>
      {/* Hero */}
      <Box
        ref={heroRef}
        sx={{
          position: "relative",
          height: "calc(100vh - 64px)",
          backgroundImage:
            "url(https://source.unsplash.com/1600x900/?finance,technology)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              theme.palette.mode === "light"
                ? "rgba(255,255,255,0.6)"
                : "rgba(0,0,0,0.6)",
            transition: "background 0.6s",
          },
        }}
      >
        <Grow in={heroInView} timeout={600}>
          <Container
            sx={{
              position: "relative",
              textAlign: "center",
              zIndex: 1,
              pt: isMobile ? 8 : 12,
            }}
          >
            <Typography
              variant={isMobile ? "h4" : "h2"}
              gutterBottom
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 700,
                color: theme.palette.primary.main,
              }}
            >
              Banking Data Analysis
            </Typography>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              paragraph
              sx={{ color: theme.palette.text.primary, mb: 4 }}
            >
              Dive into interactive charts and chat with our AI to uncover the
              story behind the numbers.
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                component={RouterLink}
                to="/chat"
                variant="contained"
                size="large"
                sx={{
                  textTransform: "none",
                  px: 4,
                  py: 1.5,
                  boxShadow: 3,
                  transition: "box-shadow 0.3s",
                  "&:hover": { boxShadow: 6 },
                }}
              >
                Start Chat
              </Button>
              <Button
                component={RouterLink}
                to="/charts"
                variant="outlined"
                size="large"
                sx={{
                  textTransform: "none",
                  px: 4,
                  py: 1.5,
                  borderWidth: 2,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  transition: "all 0.3s",
                  "&:hover": {
                    backgroundColor: theme.palette.primary.main + "11",
                    borderColor: theme.palette.primary.dark,
                    color: theme.palette.primary.dark,
                  },
                }}
              >
                Explore Charts
              </Button>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Button
                onClick={scrollToFeatures}
                variant="text"
                size="large"
                sx={{
                  textTransform: "none",
                  color: theme.palette.text.primary,
                }}
              >
                Learn More ↓
              </Button>
            </Box>
          </Container>
        </Grow>
      </Box>

      {/* Key Features */}
      <Box
        component="section"
        ref={featuresSectionRef}
        sx={{
          py: 10,
          backgroundColor: theme.palette.background.paper,
          transition: "background 0.6s",
        }}
      >
        <Container maxWidth="lg">
          <Grow in={featInView} timeout={600}>
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{ fontWeight: 700, mb: 6 }}
            >
              Key Features
            </Typography>
          </Grow>
          <Grid container spacing={4} ref={featRef} justifyContent="center">
            {features.map((f, i) => (
              // @ts-ignore
              <Grid item xs={12} sm={6} md={4} key={f.title}>
                <Grow
                  in={featInView}
                  style={{ transitionDelay: `${i * 150}ms` }}
                  timeout={600}
                >
                  <Paper
                    elevation={4}
                    sx={{
                      p: 4,
                      textAlign: "center",
                      height: 260,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 3,
                      cursor: "pointer",
                      transition: "transform 0.4s ease, box-shadow 0.4s ease",
                      "&:hover": {
                        transform: "translateY(-6px) scale(1.03)",
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    <Box mb={2}>{f.icon}</Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      {f.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {f.desc}
                    </Typography>
                  </Paper>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Box
        component="section"
        sx={{
          py: 10,
          backgroundColor: theme.palette.background.default,
          transition: "background 0.6s",
        }}
      >
        <Container maxWidth="sm">
          <Grow in={stepsInView} timeout={600}>
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{ fontWeight: 700, mb: 4 }}
            >
              How It Works
            </Typography>
          </Grow>
          <List ref={stepsRef} sx={{ maxWidth: 600, mx: "auto" }}>
            {steps.map((step, i) => (
              <Grow
                in={stepsInView}
                style={{ transitionDelay: `${i * 150}ms` }}
                timeout={600}
                key={i}
              >
                <ListItem sx={{ mb: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>{step.icon}</ListItemIcon>
                  <ListItemText primary={step.text} />
                </ListItem>
              </Grow>
            ))}
          </List>
        </Container>
      </Box>

      {/* Tech Stack */}
      <Box
        component="section"
        sx={{
          py: 10,
          backgroundColor: theme.palette.background.paper,
          transition: "background 0.6s",
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Grow in={techInView} timeout={600}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: 700, mb: 4 }}
            >
              Built With
            </Typography>
          </Grow>
          <Box
            ref={techRef}
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {badgeUrls.map((url) => (
              <Grow in={techInView} timeout={400} key={url}>
                <Box
                  component="img"
                  src={url}
                  alt="tech badge"
                  sx={{
                    height: 40,
                    filter:
                      theme.palette.mode === "dark"
                        ? "brightness(0.8)"
                        : "none",
                    transition: "filter 0.6s",
                  }}
                />
              </Grow>
            ))}
          </Box>
          <Box sx={{ mt: 4 }}>
            <Button
              component="a"
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<GitHubIcon />}
              variant="outlined"
              sx={{ textTransform: "none" }}
            >
              View on GitHub
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Bottom CTA */}
      <Box
        component="section"
        ref={ctaRef}
        sx={{
          py: 8,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          transition: "background 0.6s",
        }}
      >
        <Container sx={{ textAlign: "center" }}>
          <Grow in={ctaInView} timeout={600}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 600, mb: 3 }}
            >
              Ready to dive in? Let’s get started!
            </Typography>
          </Grow>
          <Grow
            in={ctaInView}
            timeout={600}
            style={{ transitionDelay: "150ms" }}
          >
            <Button
              component={RouterLink}
              to="/chat"
              variant="contained"
              size="large"
              startIcon={<ChatIcon />}
              sx={{
                textTransform: "none",
                px: 5,
                py: 1.5,
                backgroundColor: theme.palette.secondary.main,
                "&:hover": { backgroundColor: theme.palette.secondary.dark },
              }}
            >
              Chat with AI
            </Button>
          </Grow>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
