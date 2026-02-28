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
  Fade,
  Chip,
  Stack,
} from "@mui/material";
import { useInView } from "react-intersection-observer";
import { Link as RouterLink } from "react-router-dom";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import FunctionsIcon from "@mui/icons-material/Functions";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import ChatIcon from "@mui/icons-material/Chat";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import GitHubIcon from "@mui/icons-material/GitHub";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import TimelineIcon from "@mui/icons-material/Timeline";
import HubIcon from "@mui/icons-material/Hub";
import BoltIcon from "@mui/icons-material/Bolt";
import InsightsIcon from "@mui/icons-material/Insights";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";

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

const heroChips = [
  "FRED time-series",
  "RAG citations",
  "Multi-regression",
  "Banking lens",
];

const signalCards = [
  {
    title: "Macro Radar",
    desc: "Connect rates, inflation, and labor shifts to banking outcomes.",
    icon: <AutoGraphIcon fontSize="large" />,
    accent: "#f59e0b",
  },
  {
    title: "Regime Timeline",
    desc: "Track cycle turns with regression overlays and volatility cues.",
    icon: <TimelineIcon fontSize="large" />,
    accent: "#22c55e",
  },
  {
    title: "AI Briefing",
    desc: "Ask questions in plain English and get grounded answers.",
    icon: <SmartToyIcon fontSize="large" />,
    accent: "#38bdf8",
  },
  {
    title: "Model Lab",
    desc: "Compare linear, polynomial, and logarithmic fit behavior.",
    icon: <FunctionsIcon fontSize="large" />,
    accent: "#f97316",
  },
];

const workflowSteps = [
  {
    title: "Ingest",
    desc: "Pull FRED series into Mongo while preserving raw context.",
    icon: <CloudDownloadIcon />,
  },
  {
    title: "Enrich",
    desc: "RAG layers citations so every response has real evidence.",
    icon: <TravelExploreIcon />,
  },
  {
    title: "Explore",
    desc: "Chat, chart, and compare models in one surface.",
    icon: <InsertChartIcon />,
  },
];

const insightCards = [
  {
    title: "Scenario Studio",
    desc: "Stress-test rate paths and map historical analogs fast.",
    icon: <HubIcon fontSize="large" />,
  },
  {
    title: "Signal Health",
    desc: "Spot inflection points with volatility and regime markers.",
    icon: <InsightsIcon fontSize="large" />,
  },
  {
    title: "Decision Notes",
    desc: "Summaries stay sharp with citations and clear takeaways.",
    icon: <BoltIcon fontSize="large" />,
  },
];

const pulseBars = [18, 26, 22, 34, 28, 42, 36, 52, 44, 60, 50, 66];

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  const signalsSectionRef = useRef<HTMLDivElement>(null);
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [signalsRef, signalsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [workflowRef, workflowInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [insightsRef, insightsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [techRef, techInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [ctaRef, ctaInView] = useInView({ triggerOnce: true, threshold: 0.3 });

  const scrollToSignals = () => {
    signalsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const heroGradient = isDark
    ? "linear-gradient(135deg, #071923 0%, #0f2f3e 45%, #0b1b24 100%)"
    : "linear-gradient(135deg, #fff5e1 0%, #e9f7ff 45%, #f4fff4 100%)";
  const heroText = isDark ? "#f8f1e8" : "#17232b";
  const heroCard = isDark ? "rgba(10, 25, 33, 0.75)" : "rgba(255,255,255,0.8)";
  const borderGlow = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <Box
      sx={{
        "--accent-warm": "#f59e0b",
        "--accent-cool": "#22c55e",
        "--accent-sky": "#38bdf8",
        "--accent-ember": "#f97316",
        transition: "background-color 0.6s, color 0.6s",
      }}
    >
      {/* Hero */}
      <Box
        ref={heroRef}
        sx={{
          position: "relative",
          overflow: "hidden",
          background: heroGradient,
          color: heroText,
          py: { xs: 10, md: 14 },
          minHeight: { md: "calc(100vh - 64px)" },
          display: "flex",
          alignItems: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            width: "55vw",
            height: "55vw",
            top: "-20%",
            right: "-15%",
            background:
              "radial-gradient(circle, rgba(56,189,248,0.25), transparent 65%)",
            filter: "blur(2px)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: "45vw",
            height: "45vw",
            bottom: "-25%",
            left: "-15%",
            background:
              "radial-gradient(circle, rgba(245,158,11,0.25), transparent 65%)",
            filter: "blur(4px)",
          },
        }}
      >
        <Container sx={{ position: "relative", zIndex: 1 }} maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Grow in={heroInView} timeout={600}>
                <Box>
                  <Typography
                    variant={isMobile ? "h3" : "h2"}
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      fontFamily: '"Space Grotesk", "Poppins", sans-serif',
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Banking Signal Lab
                  </Typography>
                  <Typography
                    variant={isMobile ? "body1" : "h6"}
                    paragraph
                    sx={{
                      color: isDark ? "rgba(248,241,232,0.78)" : "#2c3b45",
                      maxWidth: 520,
                    }}
                  >
                    Decode banking outcomes with a live blend of FRED data,
                    regression diagnostics, and AI summaries that stay anchored
                    to real citations.
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    sx={{ mb: 4 }}
                  >
                    {heroChips.map((chip) => (
                      <Chip
                        key={chip}
                        label={chip}
                        sx={{
                          borderRadius: 999,
                          fontWeight: 500,
                          border: `1px solid ${borderGlow}`,
                          backgroundColor: isDark
                            ? "rgba(9, 20, 26, 0.6)"
                            : "rgba(255,255,255,0.75)",
                        }}
                      />
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Button
                      component={RouterLink}
                      to="/chat"
                      variant="contained"
                      size="large"
                      startIcon={<ChatIcon />}
                      sx={{
                        textTransform: "none",
                        px: 4,
                        py: 1.4,
                        borderRadius: 3,
                        background:
                          "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
                        color: "#121212",
                        fontWeight: 600,
                        boxShadow: "0 12px 30px rgba(245, 158, 11, 0.35)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #f59e0b 0%, #f97316 80%)",
                        },
                      }}
                    >
                      Start Chat
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/charts"
                      variant="outlined"
                      size="large"
                      startIcon={<ShowChartIcon />}
                      sx={{
                        textTransform: "none",
                        px: 4,
                        py: 1.4,
                        borderRadius: 3,
                        borderWidth: 2,
                        borderColor: isDark ? "#f8f1e8" : "#1f2f39",
                        color: isDark ? "#f8f1e8" : "#1f2f39",
                        "&:hover": {
                          borderColor: isDark ? "#f59e0b" : "#f59e0b",
                          color: isDark ? "#f59e0b" : "#f59e0b",
                        },
                      }}
                    >
                      Explore Charts
                    </Button>
                  </Stack>
                  <Button
                    onClick={scrollToSignals}
                    variant="text"
                    size="large"
                    sx={{
                      textTransform: "none",
                      mt: 3,
                      color: isDark ? "rgba(248,241,232,0.7)" : "#2c3b45",
                    }}
                  >
                    Learn More
                  </Button>
                </Box>
              </Grow>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Fade in={heroInView} timeout={900}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: heroCard,
                    border: `1px solid ${borderGlow}`,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between">
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: "0.2em",
                          fontSize: 12,
                          color: isDark ? "rgba(248,241,232,0.6)" : "#5b6b75",
                        }}
                      >
                        Signal Board
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 600,
                          mt: 1,
                          fontFamily: '"Space Grotesk", "Poppins", sans-serif',
                        }}
                      >
                        Fed Funds Pulse
                      </Typography>
                    </Box>
                    <Chip
                      label="Live"
                      size="small"
                      sx={{
                        backgroundColor: "rgba(34,197,94,0.2)",
                        color: "#22c55e",
                        border: "1px solid rgba(34,197,94,0.4)",
                      }}
                    />
                  </Stack>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${pulseBars.length}, 1fr)`,
                      alignItems: "end",
                      gap: 0.6,
                      mt: 3,
                      mb: 2,
                      height: 120,
                    }}
                  >
                    {pulseBars.map((value, index) => (
                      <Box
                        key={`${value}-${index}`}
                        sx={{
                          height: value,
                          borderRadius: 999,
                          background:
                            index % 3 === 0
                              ? "linear-gradient(180deg, #f59e0b 0%, #f97316 100%)"
                              : "linear-gradient(180deg, #38bdf8 0%, #22c55e 100%)",
                        }}
                      />
                    ))}
                  </Box>
                  <Grid container spacing={2}>
                    {[
                      { label: "Rate Curve", value: "Cycle mapping" },
                      { label: "Inflation", value: "Regime markers" },
                      { label: "Credit", value: "Liquidity pulse" },
                    ].map((item) => (
                      <Grid size={{ xs: 12, sm: 4 }} key={item.label}>
                        <Box
                          sx={{
                            p: 1.4,
                            borderRadius: 2,
                            backgroundColor: isDark
                              ? "rgba(248,241,232,0.08)"
                              : "rgba(15, 23, 32, 0.05)",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              textTransform: "uppercase",
                              letterSpacing: "0.2em",
                              color: isDark
                                ? "rgba(248,241,232,0.6)"
                                : "#6a7a84",
                            }}
                          >
                            {item.label}
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, mt: 0.5 }}
                          >
                            {item.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Signal Deck */}
      <Box
        component="section"
        ref={signalsSectionRef}
        sx={{
          py: 12,
          backgroundColor: isDark ? "#0b151c" : "#f8fafc",
        }}
      >
        <Container maxWidth="lg">
          <Grow in={signalsInView} timeout={600}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontFamily: '"Space Grotesk", "Poppins", sans-serif',
                }}
              >
                Signal Deck
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  color: isDark ? "rgba(248,241,232,0.7)" : "#4a5b66",
                }}
              >
                A focused toolkit for reading the macro environment and turning
                it into banking insight.
              </Typography>
            </Box>
          </Grow>
          <Grid container spacing={3} ref={signalsRef}>
            {signalCards.map((card, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
                <Grow
                  in={signalsInView}
                  style={{ transitionDelay: `${index * 140}ms` }}
                  timeout={600}
                >
                  <Box
                    sx={{
                      p: 0.3,
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${card.accent}, transparent 70%)`,
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3.5,
                        height: "100%",
                        backgroundColor: isDark
                          ? "rgba(10, 20, 26, 0.95)"
                          : "#ffffff",
                        boxShadow: isDark
                          ? "0 16px 40px rgba(0,0,0,0.35)"
                          : "0 20px 45px rgba(15,23,32,0.08)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Box sx={{ color: card.accent }}>{card.icon}</Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {card.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: isDark ? "#cbd5e1" : "#5b6b75" }}
                      >
                        {card.desc}
                      </Typography>
                    </Paper>
                  </Box>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Workflow */}
      <Box
        component="section"
        sx={{
          py: 12,
          backgroundColor: isDark ? "#0e1a22" : "#ffffff",
        }}
      >
        <Container maxWidth="md">
          <Grow in={workflowInView} timeout={600}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontFamily: '"Space Grotesk", "Poppins", sans-serif',
                }}
              >
                Workflow
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  color: isDark ? "rgba(248,241,232,0.7)" : "#4a5b66",
                }}
              >
                From raw series to decision-ready narratives in three moves.
              </Typography>
            </Box>
          </Grow>
          <Box ref={workflowRef} sx={{ display: "grid", gap: 3 }}>
            {workflowSteps.map((step, index) => (
              <Grow
                in={workflowInView}
                style={{ transitionDelay: `${index * 160}ms` }}
                timeout={600}
                key={step.title}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: isDark
                      ? "rgba(10, 20, 26, 0.85)"
                      : "#f8fafc",
                    border: `1px solid ${borderGlow}`,
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: "auto" }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          background:
                            "linear-gradient(135deg, #38bdf8 0%, #22c55e 100%)",
                          color: "#0f172a",
                          fontWeight: 700,
                        }}
                      >
                        {step.icon}
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: "grow" }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {step.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: isDark ? "#cbd5e1" : "#5b6b75" }}
                      >
                        {step.desc}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grow>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Insight Gallery */}
      <Box
        component="section"
        sx={{
          py: 12,
          backgroundColor: isDark ? "#0b141a" : "#fdf6ee",
        }}
      >
        <Container maxWidth="lg">
          <Grow in={insightsInView} timeout={600}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontFamily: '"Space Grotesk", "Poppins", sans-serif',
                }}
              >
                Insight Gallery
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  color: isDark ? "rgba(248,241,232,0.7)" : "#4a5b66",
                }}
              >
                Turn complex data into quick, confident narratives.
              </Typography>
            </Box>
          </Grow>
          <Grid container spacing={3} ref={insightsRef}>
            {insightCards.map((card, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={card.title}>
                <Grow
                  in={insightsInView}
                  style={{ transitionDelay: `${index * 140}ms` }}
                  timeout={600}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      height: "100%",
                      backgroundColor: isDark
                        ? "rgba(10, 20, 26, 0.9)"
                        : "#ffffff",
                      border: `1px solid ${borderGlow}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ color: "#f59e0b" }}>{card.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {card.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: isDark ? "#cbd5e1" : "#5b6b75" }}
                    >
                      {card.desc}
                    </Typography>
                    <Button
                      component={RouterLink}
                      to="/charts"
                      size="small"
                      sx={{
                        alignSelf: "flex-start",
                        textTransform: "none",
                        color: isDark ? "#38bdf8" : "#0f172a",
                      }}
                    >
                      Explore signals {"->"}
                    </Button>
                  </Paper>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Tech Stack */}
      <Box
        component="section"
        sx={{
          py: 12,
          backgroundColor: isDark ? "#0f1921" : "#ffffff",
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Grow in={techInView} timeout={600}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontFamily: '"Space Grotesk", "Poppins", sans-serif',
              }}
            >
              Stack + Integrations
            </Typography>
          </Grow>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: isDark ? "rgba(248,241,232,0.7)" : "#4a5b66",
            }}
          >
            Built to blend data engineering, visualization, and AI reasoning.
          </Typography>
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
                    height: 42,
                    filter: isDark ? "brightness(0.85)" : "none",
                    transition: "filter 0.6s",
                  }}
                />
              </Grow>
            ))}
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            sx={{ mt: 4 }}
          >
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
            <Button
              component={RouterLink}
              to="/chat"
              variant="contained"
              sx={{
                textTransform: "none",
                backgroundColor: "#38bdf8",
                color: "#0f172a",
                "&:hover": { backgroundColor: "#0ea5e9" },
              }}
            >
              Launch the Assistant
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Bottom CTA */}
      <Box
        component="section"
        ref={ctaRef}
        sx={{
          py: 9,
          background:
            "linear-gradient(135deg, rgba(56,189,248,0.9), rgba(245,158,11,0.9))",
          color: "#0f172a",
        }}
      >
        <Container sx={{ textAlign: "center" }}>
          <Grow in={ctaInView} timeout={600}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontFamily: '"Space Grotesk", "Poppins", sans-serif',
              }}
            >
              Ready to map the next rate move?
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
                borderRadius: 3,
                backgroundColor: "#0f172a",
                color: "#f8fafc",
                "&:hover": { backgroundColor: "#1f2937" },
              }}
            >
              Start the Briefing
            </Button>
          </Grow>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
