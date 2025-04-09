import axios from "axios";
import { MongoClient } from "mongodb";
import regression from "regression";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import fs from "fs-extra";
import dotenv from "dotenv";
import {
  GoogleGenerativeAI,
  GenerationConfig,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import {
  FRED_API_KEY,
  FRED_START_DATE,
  FRED_END_DATE,
  MONGO_URI,
} from "./config";

dotenv.config();

export interface FredObservation {
  date: string;
  value: number;
}

/**
 * @file dataIngestion.ts
 * This file fetches FRED data, performs enhanced multi-regression analysis on raw data,
 * generates charts (including both linear and polynomial regression overlays),
 * and uses the Google Gemini API for a detailed natural language summary.
 * Multiple series are processed, including:
 *   - TOTALSL: Total Loans and Leases at Commercial Banks (Banking)
 *   - TOTALSA: Total Assets of Commercial Banks (Banking)
 *   - MPRIME: Bank Prime Loan Rate (Banking)
 *   - FEDFUNDS: Effective Federal Funds Rate (Monetary Policy)
 *   - INDPRO: Industrial Production Index (Manufacturing/Industry)
 *   - CPIAUCSL: Consumer Price Index (Prices)
 *   - UNRATE: Unemployment Rate (Labor Market)
 *   - GDP: Gross Domestic Product (Overall Economy)
 *   - PPIACO: Producer Price Index: All Commodities (Prices)
 *   - HOUST: Housing Starts: Total (Housing)
 *   - M2SL: M2 Money Stock (Financial)
 *   - DGS10: 10-Year Treasury Constant Maturity Rate (Bond Markets)
 *   - SP500: S&P 500 Index (Stock Market)
 *   - VIXCLS: CBOE Volatility Index (Market Volatility)
 *
 * @author David Nguyen
 * @date 2024-04-08
 */

/**
 * Fetches FRED data for a given series ID.
 */
export async function fetchFredData(
  seriesId: string,
): Promise<FredObservation[]> {
  const url = "https://api.stlouisfed.org/fred/series/observations";
  const params = {
    series_id: seriesId,
    api_key: FRED_API_KEY,
    file_type: "json",
    observation_start: FRED_START_DATE,
    observation_end: FRED_END_DATE,
  };
  const response = await axios.get(url, { params });
  if (response.status !== 200) {
    throw new Error(
      `FRED API error: ${response.status} ${response.statusText}`,
    );
  }
  const observations = response.data.observations;
  return observations.map((obs: any) => ({
    date: obs.date,
    value: parseFloat(obs.value),
  }));
}

/**
 * Stores raw FRED data in MongoDB.
 * Data is stored as is (without cleaning, normalization, or smoothing).
 */
export async function storeFredData(seriesId: string) {
  try {
    const fredData: FredObservation[] = await fetchFredData(seriesId);
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db("fredDataDB");
    const collection = db.collection("observations");
    const docs = fredData.map((obs) => ({
      seriesId,
      date: new Date(obs.date),
      value: obs.value,
    }));
    await collection.deleteMany({ seriesId });
    const result = await collection.insertMany(docs);
    console.log(
      `Inserted ${result.insertedCount} documents for series ${seriesId}`,
    );
    await client.close();
  } catch (error) {
    console.error("Error storing FRED data:", error);
  }
}

/**
 * Retrieves raw observation data for a given series from MongoDB.
 */
async function getSeriesData(
  seriesId: string,
): Promise<{ date: Date; value: number }[]> {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("fredDataDB");
  const collection = db.collection("observations");
  const docs = await collection.find({ seriesId }).sort({ date: 1 }).toArray();
  await client.close();
  return docs.map((doc) => ({
    date: new Date(doc.date),
    value: doc.value,
  }));
}

/**
 * Computes the daily percent change from raw data.
 */
function computePercentChange(
  data: { date: Date; value: number }[],
): { date: Date; value: number }[] {
  const result: { date: Date; value: number }[] = [];
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1].value;
    const curr = data[i].value;
    const percentChange = ((curr - prev) / prev) * 100;
    result.push({ date: data[i].date, value: percentChange });
  }
  return result;
}

/**
 * Performs a linear regression on the raw data.
 * Uses the number of days since the first observation as the independent variable.
 */
function performLinearRegression(
  data: { date: Date; value: number }[],
): regression.Result {
  const baseTime = data[0].date.getTime();
  const dataPoints: [number, number][] = data.map((d) => [
    (d.date.getTime() - baseTime) / (1000 * 60 * 60 * 24),
    d.value,
  ]);
  return regression.linear(dataPoints, { precision: 4 });
}

/**
 * Performs multiple polynomial regressions (orders 1 to 10) on the raw data.
 */
async function performPolynomialRegressions(
  data: { date: Date; value: number }[],
): Promise<any[]> {
  const baseTime = data[0].date.getTime();
  const regressionData: [number, number][] = data.map((d) => [
    (d.date.getTime() - baseTime) / (1000 * 60 * 60 * 24),
    d.value,
  ]);
  const results = [];
  for (let order = 1; order <= 10; order++) {
    const result = regression.polynomial(regressionData, { order });
    results.push({
      model: `Polynomial Regression (order ${order})`,
      equation: result.string,
      r2: result.r2,
      predictions: result.points,
      order: order,
    });
  }
  return results;
}

/**
 * Performs a linear regression on the percent change of raw data.
 */
function performPercentChangeRegression(
  data: { date: Date; value: number }[],
): regression.Result {
  const percentData = computePercentChange(data);
  const regressionData: [number, number][] = percentData.map((d, idx) => [
    idx,
    d.value,
  ]);
  return regression.linear(regressionData, { precision: 4 });
}

/**
 * Generates a chart of raw data with an overlay of the linear regression line.
 */
async function generateLinearChart(
  seriesId: string,
  data: { date: Date; value: number }[],
  linResult: regression.Result,
): Promise<string> {
  const baseTime = data[0].date.getTime();
  const labels = data.map((d) => d.date.toISOString().split("T")[0]);
  const originalValues = data.map((d) => d.value);
  const regressionValues = data.map(
    (d) =>
      linResult.predict(
        (d.date.getTime() - baseTime) / (1000 * 60 * 60 * 24),
      )[1],
  );
  const width = 800,
    height = 600;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  const config = {
    type: "line" as const,
    data: {
      labels,
      datasets: [
        {
          label: `${seriesId} Raw Data`,
          data: originalValues,
          borderColor: "blue",
          fill: false,
        },
        {
          label: "Linear Regression",
          data: regressionValues,
          borderColor: "red",
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        x: { title: { display: true, text: "Date" } },
        y: { title: { display: true, text: "Value" } },
      },
      plugins: {
        title: {
          display: true,
          text: `Linear Regression Analysis for ${seriesId}`,
        },
      },
    },
  };
  const imageBuffer = await chartJSNodeCanvas.renderToBuffer(config);
  const imagePath = `./${seriesId}_linear_analysis.png`;
  fs.writeFileSync(imagePath, imageBuffer);
  return imagePath;
}

/**
 * Generates a chart for a polynomial regression result.
 * Overlays the raw data with the polynomial regression predictions.
 */
async function generatePolynomialChart(
  seriesId: string,
  data: { date: Date; value: number }[],
  polyResult: any,
): Promise<string> {
  const baseTime = data[0].date.getTime();
  const labels = data.map((d) => d.date.toISOString().split("T")[0]);
  const originalValues = data.map((d) => d.value);
  const regressionValues = polyResult.predictions.map(
    (pt: [number, number]) => pt[1],
  );
  const width = 800,
    height = 600;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  const config = {
    type: "line" as const,
    data: {
      labels,
      datasets: [
        {
          label: `${seriesId} Raw Data`,
          data: originalValues,
          borderColor: "blue",
          fill: false,
        },
        {
          label: polyResult.model,
          data: regressionValues,
          borderColor: "red",
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        x: { title: { display: true, text: "Date" } },
        y: { title: { display: true, text: "Value" } },
      },
      plugins: {
        title: {
          display: true,
          text: `${polyResult.model} Analysis for ${seriesId}`,
        },
      },
    },
  };
  const imageBuffer = await chartJSNodeCanvas.renderToBuffer(config);
  const imagePath = `./${seriesId}_poly_order_${polyResult.order}_analysis.png`;
  fs.writeFileSync(imagePath, imageBuffer);
  return imagePath;
}

/**
 * Generates charts for all polynomial regressions.
 * Returns an array of file paths for the generated charts.
 */
async function generateMultiRegressionCharts(
  seriesId: string,
  data: { date: Date; value: number }[],
  polyResults: any[],
): Promise<string[]> {
  const chartPaths: string[] = [];
  for (const polyResult of polyResults) {
    const path = await generatePolynomialChart(seriesId, data, polyResult);
    chartPaths.push(path);
  }
  return chartPaths;
}

/**
 * Uses Google Gemini API to generate a detailed natural language summary given a prompt.
 */
async function summarizeStatistics(prompt: string): Promise<string> {
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error("Missing GOOGLE_AI_API_KEY in environment variables");
  }
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
      "You are a data science expert. Summarize the following detailed statistical analysis results in a clear, professional manner. Comment on trends, variability, and model reliability. Also, compare the different regression analyses.",
  });
  const generationConfig: GenerationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 50,
    maxOutputTokens: 512,
  };
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];
  const chatSession = model.startChat({
    generationConfig,
    safetySettings,
    history: [{ role: "user", parts: [{ text: prompt }] }],
  });
  const result = await chatSession.sendMessage(prompt);
  if (!result.response || !result.response.text) {
    throw new Error("Failed to generate summarization from the AI.");
  }
  const responseText =
    typeof result.response.text === "function"
      ? result.response.text()
      : result.response.text;
  return responseText;
}

/**
 * Analyzes and summarizes a FRED series.
 * For each series:
 *  - Retrieves raw data from MongoDB.
 *  - Runs a linear regression on raw data.
 *  - Runs 10 polynomial regressions.
 *  - Runs a regression on the daily percent change.
 *  - Generates a chart of raw data with the linear regression line.
 *  - Generates separate charts for each polynomial regression.
 *  - Builds a detailed prompt that includes all regression results and chart locations.
 *  - Uses Gemini API to produce a refined summary.
 */
async function analyzeAndSummarizeSeries(seriesId: string): Promise<string> {
  const rawData = await getSeriesData(seriesId);
  if (rawData.length === 0) {
    return `No data found for series ${seriesId}.`;
  }

  // Linear regression on raw data
  const linResult = performLinearRegression(rawData);
  // Polynomial regressions
  const polyResults = await performPolynomialRegressions(rawData);
  // Regression on percent change data
  const percentResult = performPercentChangeRegression(rawData);
  // Generate chart for raw data with linear regression overlay
  const linearChartPath = await generateLinearChart(
    seriesId,
    rawData,
    linResult,
  );
  // Generate charts for polynomial regressions
  const polyChartPaths = await generateMultiRegressionCharts(
    seriesId,
    rawData,
    polyResults,
  );

  // Build a detailed prompt for AI summarization
  let prompt = `=== Detailed Analysis for FRED Series: ${seriesId} ===\n`;
  prompt += `Time Period: ${rawData[0].date.toISOString().split("T")[0]} to ${rawData[rawData.length - 1].date.toISOString().split("T")[0]}\n`;
  prompt += `Number of Observations: ${rawData.length}\n\n`;

  // Linear Regression
  prompt += `-- Linear Regression --\n`;
  prompt += `Equation: y = ${linResult.equation[0]} * (days) + ${linResult.equation[1]}\n`;
  prompt += `R²: ${linResult.r2.toFixed(4)}\n`;
  prompt += `Chart: ${linearChartPath}\n\n`;

  // Polynomial Regressions
  prompt += `-- Polynomial Regressions (Orders 1 to 10) --\n`;
  polyResults.forEach((poly, idx) => {
    prompt += `${poly.model}: Equation: ${poly.equation}, R²: ${poly.r2.toFixed(4)}, Chart: ${polyChartPaths[idx]}\n`;
  });
  prompt += `\n`;

  // Percent Change Regression
  prompt += `-- Percent Change Regression --\n`;
  prompt += `Equation: y = ${percentResult.equation[0]} * (index) + ${percentResult.equation[1]}\n`;
  prompt += `R²: ${percentResult.r2.toFixed(4)}\n\n`;

  prompt += `Note: Data was analyzed as raw (without cleaning or normalization).\n`;

  // Use Gemini API to get an AI-refined summary.
  const detailedSummary = await summarizeStatistics(prompt);
  return `${prompt}\n\nAI Refined Summary:\n${detailedSummary}`;
}

/**
 * Main function: Process multiple FRED series and output a detailed summary for each.
 */
async function main() {
  const seriesIds: string[] = [
    "TOTALSL", // Total Loans and Leases at Commercial Banks (Banking)
    "TOTALSA", // Total Assets of Commercial Banks (Banking)
    "MPRIME", // Bank Prime Loan Rate (Banking)
    "FEDFUNDS", // Effective Federal Funds Rate (Monetary Policy)
    "INDPRO", // Industrial Production Index (Manufacturing/Industry)
    "CPIAUCSL", // Consumer Price Index (Prices)
    "UNRATE", // Unemployment Rate (Labor Market)
    "GDP", // Gross Domestic Product (Overall Economy)
    "PPIACO", // Producer Price Index: All Commodities (Prices)
    "HOUST", // Housing Starts: Total (Housing)
    "M2SL", // M2 Money Stock (Financial)
    "DGS10", // 10-Year Treasury Constant Maturity Rate (Bond Markets)
    "SP500", // S&P 500 Index (Stock Market)
    "VIXCLS", // CBOE Volatility Index (Market Volatility)
  ];

  // First, fetch and store raw data for all series.
  for (const seriesId of seriesIds) {
    await storeFredData(seriesId);
  }

  let finalSummary =
    "=== Enhanced FRED Data Regression Analysis Summary ===\n\n";
  for (const seriesId of seriesIds) {
    const seriesSummary = await analyzeAndSummarizeSeries(seriesId);
    finalSummary += seriesSummary + "\n\n";
  }
  console.log(finalSummary);
}

main().catch((error) => {
  console.error("Error during analysis:", error);
});
