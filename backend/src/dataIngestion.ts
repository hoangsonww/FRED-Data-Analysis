import axios from "axios";
import { MongoClient } from "mongodb";
import {
  FRED_API_KEY,
  FRED_START_DATE,
  FRED_END_DATE,
  MONGO_URI,
} from "./config";

/**
 * Interface representing a single observation from FRED to enforce type safety.
 */
export interface FredObservation {
  date: string;
  value: number;
}

/**
 * @file dataIngestion.ts
 * This file contains functions to fetch FRED data, clean and process it,
 * and then store it in MongoDB. It includes functions to remove invalid observations,
 * normalize data, remove outliers, apply moving averages, and filter by date range.
 * Can be a sample ETL pipeline that can easily be expanded upon in the future as needed.
 */

/**
 * Fetches FRED data for a given series ID. Series ID can be found on the FRED website.
 *
 * @param seriesId - The ID of the FRED series to fetch data for.
 * @returns A promise that resolves to an array of FredObservation objects.
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
 * Filters out invalid or missing observations:
 * - Removes observations with NaN, null, or negative values
 *
 * @param data - Array of FredObservation objects
 * @returns A cleaned array without invalid records
 */
export function removeInvalidObservations(
  data: FredObservation[],
): FredObservation[] {
  return data.filter(
    (obs) =>
      typeof obs.value === "number" && !isNaN(obs.value) && obs.value >= 0,
  );
}

/**
 * Normalizes FRED observation values using min-max scaling.
 *
 * @param data - Array of FredObservation objects
 * @returns An array of FredObservation with normalized values.
 */
export function normalizeFredData(data: FredObservation[]): FredObservation[] {
  const values = data.map((obs) => obs.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (max === min) return data; // avoid division by zero

  return data.map((obs) => ({
    ...obs,
    value: (obs.value - min) / (max - min),
  }));
}

/**
 * Removes outliers using the IQR (Interquartile Range) method.
 *
 * @param data - Array of FredObservation objects
 * @returns Filtered data with outliers removed
 */
export function removeOutliers(data: FredObservation[]): FredObservation[] {
  const values = data.map((obs) => obs.value).sort((a, b) => a - b);
  const q1 = values[Math.floor(values.length * 0.25)];
  const q3 = values[Math.floor(values.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return data.filter(
    (obs) => obs.value >= lowerBound && obs.value <= upperBound,
  );
}

/**
 * Applies a simple moving average over a specified window size.
 *
 * @param data - Array of FredObservation
 * @param windowSize - Number of days in the moving average window
 * @returns Smoothed FredObservation array
 */
export function applyMovingAverage(
  data: FredObservation[],
  windowSize: number,
): FredObservation[] {
  const result: FredObservation[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) continue;

    const window = data.slice(i - windowSize + 1, i + 1);
    const avg = window.reduce((sum, obs) => sum + obs.value, 0) / window.length;

    result.push({ date: data[i].date, value: avg });
  }

  return result;
}

/**
 * Filters FRED observations by a custom date range.
 *
 * @param data - FredObservation array
 * @param startDate - Start date in YYYY-MM-DD
 * @param endDate - End date in YYYY-MM-DD
 * @returns Filtered array within the date range
 */
export function filterByDateRange(
  data: FredObservation[],
  startDate: string,
  endDate: string,
): FredObservation[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return data.filter((obs) => {
    const obsDate = new Date(obs.date);
    return obsDate >= start && obsDate <= end;
  });
}

/**
 * Calculates daily percent change in value.
 *
 * @param data - Array of FredObservation
 * @returns Array of percent changes (value represents % change, date is preserved)
 */
export function calculatePercentChange(
  data: FredObservation[],
): FredObservation[] {
  const result: FredObservation[] = [];

  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1].value;
    const curr = data[i].value;
    const percentChange = ((curr - prev) / prev) * 100;
    result.push({ date: data[i].date, value: percentChange });
  }

  return result;
}

/**
 * Cleans and aggregates the raw data:
 * - Groups records by unique date (YYYY-MM-DD)
 * - Averages values for duplicate entries.
 *
 * @param data - An array of FredObservation objects.
 * @returns A promise that resolves to an array of cleaned and aggregated FredObservation objects.
 */
export async function cleanAndAggregateData(
  data: FredObservation[],
): Promise<FredObservation[]> {
  const groups: { [dateStr: string]: { sum: number; count: number } } = {};
  data.forEach(({ date, value }) => {
    const dateStr = date;
    if (!groups[dateStr]) {
      groups[dateStr] = { sum: value, count: 1 };
    } else {
      groups[dateStr].sum += value;
      groups[dateStr].count++;
    }
  });
  const aggregated = Object.entries(groups).map(
    ([dateStr, { sum, count }]) => ({
      date: dateStr,
      value: sum / count,
    }),
  );
  aggregated.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  return aggregated;
}

/**
 * Stores FRED data in MongoDB.
 *
 * @param seriesId - The ID of the FRED series to fetch and store data for.
 */
export async function storeFredData(seriesId: string) {
  try {
    // Fetch data from FRED
    const fredData: FredObservation[] = await fetchFredData(seriesId);

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db("fredDataDB");
    const collection = db.collection("observations");

    // Prepare documents (here we add the seriesId for reference and convert date to a Date object)
    const docs = fredData.map((obs) => ({
      seriesId,
      date: new Date(obs.date),
      value: obs.value,
    }));

    // Optionally, clear old data for this series if needed
    await collection.deleteMany({ seriesId });

    // Insert the new data
    const result = await collection.insertMany(docs);
    console.log(
      `Inserted ${result.insertedCount} documents for series ${seriesId}`,
    );

    await client.close();
  } catch (error) {
    console.error("Error storing FRED data:", error);
  }
}

// Example usage: With TOTALSL as the series ID - change as needed
storeFredData("TOTALSL");
