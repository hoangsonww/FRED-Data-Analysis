import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Line } from "react-chartjs-2";
import regression from "regression";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface Observation {
  date: string;
  value: number;
  seriesId?: string;
}

const seriesList = ["TOTALSL", "TOTALSA", "MPRIME", "FEDFUNDS"];

// Explanation for each series
const seriesExplanations: { [key: string]: string } = {
  TOTALSL:
    "TOTALSL represents Total Loans and Leases at Commercial Banks. It indicates the overall credit activity and lending levels in the banking sector.",
  TOTALSA:
    "TOTALSA represents Total Assets of Commercial Banks. This is a measure of the bank's size and the strength of its balance sheet.",
  MPRIME:
    "MPRIME is the Bank Prime Loan Rate. It is the interest rate banks charge their most creditworthy customers and serves as a benchmark for other loans.",
  FEDFUNDS:
    "FEDFUNDS is the Federal Funds Rate, the rate at which banks lend reserve balances to each other overnight. It is a key indicator of U.S. monetary policy.",
};

/**
 * ChartPage component to display a line chart with regression analysis.
 * It fetches observation data from the backend and allows users to select different series for visualization.
 *
 * @author David Nguyen
 * @date 2024-04-08
 */
const ChartPage: React.FC = () => {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState<string>("TOTALSL");

  useEffect(() => {
    const fetchObservations = async () => {
      try {
        const response = await fetch("http://localhost:3000/observations");
        const data = await response.json();
        setObservations(data.observations);
      } catch (error) {
        console.error("Error fetching observations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchObservations();
  }, []);

  const getSeriesData = (series: string) => {
    const filtered = observations.filter((obs) => obs.seriesId === series);
    return filtered.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  };

  const dataForSeries = getSeriesData(selectedSeries);
  const labels = dataForSeries.map(
    (obs) => new Date(obs.date).toISOString().split("T")[0],
  );
  const rawDataValues = dataForSeries.map((obs) => obs.value);

  // Compute regression values using days offset (to normalize x-axis)
  let regressionValues: number[] = [];
  if (dataForSeries.length > 0) {
    const baseTime = new Date(dataForSeries[0].date).getTime();
    const dataPoints: [number, number][] = dataForSeries.map((d) => [
      (new Date(d.date).getTime() - baseTime) / (1000 * 60 * 60 * 24),
      d.value,
    ]);
    const regResult = regression.linear(dataPoints, { precision: 4 });
    regressionValues = dataForSeries.map((d) => {
      const dayOffset =
        (new Date(d.date).getTime() - baseTime) / (1000 * 60 * 60 * 24);
      return regResult.predict(dayOffset)[1];
    });
  }

  // Combined chart data: both raw and regression line
  const combinedChartData = {
    labels,
    datasets: [
      {
        label: `${selectedSeries} Raw Data`,
        data: rawDataValues,
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.1)",
        fill: true,
        tension: 0.3,
      },
      {
        label: `${selectedSeries} Regression Line`,
        data: regressionValues,
        borderColor: "red",
        backgroundColor: "rgba(255, 0, 0, 0.1)",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Observations & Regression for ${selectedSeries}`,
        font: { size: 18, family: "Poppins, sans-serif" },
      },
      legend: {
        labels: { font: { family: "Poppins, sans-serif" } },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
          font: { family: "Poppins, sans-serif" },
        },
        ticks: { font: { family: "Poppins, sans-serif" } },
      },
      y: {
        title: {
          display: true,
          text: "Value",
          font: { family: "Poppins, sans-serif" },
        },
        ticks: { font: { family: "Poppins, sans-serif" } },
      },
    },
  };

  return (
    <Paper sx={{ p: 3, mb: 3, minHeight: "80vh" }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontFamily: "Poppins, sans-serif", marginBottom: 2 }}
      >
        Data Visualization
      </Typography>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel
          id="series-select-label"
          sx={{ fontFamily: "Poppins, sans-serif" }}
        >
          Select Series
        </InputLabel>
        <Select
          labelId="series-select-label"
          value={selectedSeries}
          label="Select Series"
          onChange={(e) => setSelectedSeries(e.target.value)}
          sx={{ fontFamily: "Poppins, sans-serif" }}
        >
          {seriesList.map((series) => (
            <MenuItem
              key={series}
              value={series}
              sx={{ fontFamily: "Poppins, sans-serif" }}
            >
              {series}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* Display explanation for the selected series */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontFamily: "Poppins, sans-serif" }}
        >
          {seriesExplanations[selectedSeries]}
        </Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {/* @ts-ignore */}
          <Grid item xs={12} md={10}>
            <Box
              sx={{
                height: 500,
                width: "100%",
                minWidth: "400px",
                maxWidth: "1200px",
                mx: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Line data={combinedChartData} options={chartOptions} />
            </Box>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default ChartPage;
