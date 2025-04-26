import React, { useEffect, useState, useMemo } from "react";
import {
  Paper,
  Typography,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  SelectChangeEvent,
} from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
} from "recharts";
import regression, { DataPoint, Result } from "regression";

interface Observation {
  date: string;
  value: number;
  seriesId?: string;
}

const seriesList = [
  "TOTALSL",
  "TOTALSA",
  "MPRIME",
  "FEDFUNDS",
  "INDPRO",
  "CPIAUCSL",
  "UNRATE",
  "GDP",
  "PPIACO",
  "HOUST",
  "M2SL",
  "DGS10",
  "SP500",
  "VIXCLS",
] as const;
type Series = (typeof seriesList)[number];

const regressionTypes = [
  "Linear",
  "Logarithmic",
  "Percent Change",
  "Polynomial",
] as const;
type RegressionType = (typeof regressionTypes)[number];

const seriesExplanations: Record<Series, string> = {
  TOTALSL:
    "Total Loans and Leases at Commercial Banks: overall credit activity and lending levels.",
  TOTALSA:
    "Total Assets of Commercial Banks: measure of bank size and balance sheet strength.",
  MPRIME:
    "Bank Prime Loan Rate: interest rate charged to most creditworthy customers.",
  FEDFUNDS:
    "Federal Funds Rate: overnight lending rate between banks, key policy indicator.",
  INDPRO: "Industrial Production Index: manufacturing and industrial output.",
  CPIAUCSL:
    "Consumer Price Index: measures change in prices paid by urban consumers.",
  UNRATE: "Unemployment Rate: percentage of labor force unemployed.",
  GDP: "Gross Domestic Product: total economic output.",
  PPIACO: "Producer Price Index: measures wholesale price changes.",
  HOUST: "Housing Starts: new residential construction starts.",
  M2SL: "M2 Money Stock: measure of money supply (cash + near money).",
  DGS10: "10-Year Treasury Rate: long-term interest rate benchmark.",
  SP500: "S&P 500 Index: performance of 500 large-cap U.S. stocks.",
  VIXCLS: "CBOE Volatility Index: market's expected 30-day volatility.",
};

const ChartPage: React.FC = () => {
  const theme = useTheme();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSeries, setSelectedSeries] = useState<Series>("TOTALSL");
  const [regressionType, setRegressionType] =
    useState<RegressionType>("Linear");
  const [polyOrder, setPolyOrder] = useState<number>(2);

  // Fetch observations
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          "https://fred-data-analysis-backend.vercel.app/observations",
        );
        const json = await res.json();
        setObservations(json.observations);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter & sort
  const dataForSeries = useMemo(
    () =>
      observations
        .filter((o) => o.seriesId === selectedSeries)
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
    [observations, selectedSeries],
  );

  // Percent-change data
  const percentData = useMemo(() => {
    if (regressionType !== "Percent Change") return [];
    const arr: { date: string; value: number }[] = [];
    for (let i = 1; i < dataForSeries.length; i++) {
      const prev = dataForSeries[i - 1].value;
      const curr = dataForSeries[i].value;
      arr.push({
        date: dataForSeries[i].date.slice(0, 10),
        value: ((curr - prev) / prev) * 100,
      });
    }
    return arr;
  }, [dataForSeries, regressionType]);

  // Compute regression
  const regressionResult: Result | null = useMemo(() => {
    if (!dataForSeries.length) return null;
    const baseTime = new Date(dataForSeries[0].date).getTime();
    let pts: DataPoint[];

    switch (regressionType) {
      case "Linear":
        pts = dataForSeries.map((d) => {
          const x =
            (new Date(d.date).getTime() - baseTime) / (1000 * 60 * 60 * 24);
          return [x, d.value] as DataPoint;
        });
        return regression.linear(pts, { precision: 4 });

      case "Logarithmic":
        pts = dataForSeries.map((d) => {
          const x =
            (new Date(d.date).getTime() - baseTime) / (1000 * 60 * 60 * 24) + 1;
          return [x, d.value] as DataPoint;
        });
        return regression.logarithmic(pts, { precision: 4 });

      case "Percent Change":
        pts = percentData.map((d, i) => [i, d.value] as DataPoint);
        return regression.linear(pts, { precision: 4 });

      case "Polynomial":
        pts = dataForSeries.map((d) => {
          const x =
            (new Date(d.date).getTime() - baseTime) / (1000 * 60 * 60 * 24);
          return [x, d.value] as DataPoint;
        });
        return regression.polynomial(pts, { order: polyOrder, precision: 4 });
    }
  }, [dataForSeries, percentData, regressionType, polyOrder]);

  // Merge into chart data
  const chartData = useMemo(() => {
    if (!regressionResult) return [];
    if (regressionType === "Percent Change") {
      return percentData.map((d, i) => ({
        date: d.date,
        raw: d.value,
        regression: regressionResult.predict(i)[1],
      }));
    }
    const baseTime = new Date(dataForSeries[0].date).getTime();
    return dataForSeries.map((d) => {
      const x =
        (new Date(d.date).getTime() - baseTime) / (1000 * 60 * 60 * 24) +
        (regressionType === "Logarithmic" ? 1 : 0);
      return {
        date: d.date.slice(0, 10),
        raw: d.value,
        regression: regressionResult.predict(x)[1],
      };
    });
  }, [dataForSeries, percentData, regressionResult, regressionType]);

  // Handlers
  const handleSeriesChange = (e: SelectChangeEvent<Series>) =>
    setSelectedSeries(e.target.value as Series);
  const handleRegTypeChange = (e: SelectChangeEvent<RegressionType>) =>
    setRegressionType(e.target.value as RegressionType);
  const handlePolyOrderChange = (e: SelectChangeEvent<number>) =>
    setPolyOrder(Number(e.target.value));

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4, transition: "background 0.3s" }}>
      <Typography
        variant="h5"
        sx={{
          fontFamily: "Poppins, sans-serif",
          mb: 2,
          color: theme.palette.text.primary,
        }}
      >
        Data Visualization
      </Typography>

      {/* Controls */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <FormControl fullWidth>
          <InputLabel sx={{ fontFamily: "Poppins" }}>Series</InputLabel>
          <Select
            value={selectedSeries}
            label="Series"
            onChange={handleSeriesChange}
            sx={{ fontFamily: "Poppins" }}
          >
            {seriesList.map((s) => (
              <MenuItem key={s} value={s} sx={{ fontFamily: "Poppins" }}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel sx={{ fontFamily: "Poppins" }}>Regression</InputLabel>
          <Select
            value={regressionType}
            label="Regression"
            onChange={handleRegTypeChange}
            sx={{ fontFamily: "Poppins" }}
          >
            {regressionTypes.map((rt) => (
              <MenuItem key={rt} value={rt} sx={{ fontFamily: "Poppins" }}>
                {rt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {regressionType === "Polynomial" && (
          <FormControl fullWidth>
            <InputLabel sx={{ fontFamily: "Poppins" }}>Order</InputLabel>
            <Select
              value={polyOrder}
              label="Order"
              onChange={handlePolyOrderChange}
              sx={{ fontFamily: "Poppins" }}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((o) => (
                <MenuItem key={o} value={o} sx={{ fontFamily: "Poppins" }}>
                  {o}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Explanation */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          background:
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          transition: "background 0.3s",
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontFamily: "Poppins, sans-serif",
            color: theme.palette.text.secondary,
          }}
        >
          {seriesExplanations[selectedSeries]}
        </Typography>
      </Box>

      {/* Chart */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : chartData.length === 0 ? (
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            mt: 4,
            fontFamily: "Poppins, sans-serif",
            color: theme.palette.text.secondary,
          }}
        >
          No data available for {selectedSeries}
        </Typography>
      ) : (
        <Box
          sx={{
            width: "100%",
            height: { xs: 300, sm: 400, md: 500 },
            transition: "height 0.3s",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.palette.divider}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fontFamily: "Poppins" }}
                stroke={theme.palette.text.secondary}
              />
              <YAxis
                tick={{ fontSize: 12, fontFamily: "Poppins" }}
                stroke={theme.palette.text.secondary}
                label={{
                  value:
                    regressionType === "Percent Change" ? "% Change" : "Value",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontFamily: "Poppins" },
                }}
              />
              <ReTooltip
                contentStyle={{
                  fontFamily: "Poppins",
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                }}
                labelStyle={{ fontFamily: "Poppins" }}
              />
              <Legend
                wrapperStyle={{
                  fontFamily: "Poppins",
                  color: theme.palette.text.primary,
                }}
              />

              {/* Lines with initial draw animation */}
              <Line
                type="monotone"
                dataKey="raw"
                name={
                  regressionType === "Percent Change"
                    ? "% Change"
                    : selectedSeries
                }
                stroke={theme.palette.primary.main}
                dot={false}
                strokeWidth={2}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={1500}
              />
              <Line
                type="monotone"
                dataKey="regression"
                name={`${regressionType} Regression`}
                stroke={theme.palette.secondary.main}
                dot={false}
                strokeWidth={2}
                strokeDasharray="5 5"
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};

export default ChartPage;
