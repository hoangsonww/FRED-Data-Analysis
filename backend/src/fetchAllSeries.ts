import { storeFredData } from "./dataIngestion";

/**
 * Fetches and stores data for a predefined set of banking series from FRED.
 * This function is designed to be called in a loop to process multiple series.
 */
export async function fetchAllBankingSeries() {
  // Array of verified banking series IDs from FRED
  const seriesIds: string[] = [
    "TOTALSL", // Total Loans and Leases at Commercial Banks
    "TOTALSA", // Total Assets of Commercial Banks
    "MPRIME", // Bank Prime Loan Rate
    "FEDFUNDS", // Effective Federal Funds Rate
  ];

  // Process each series sequentially to avoid overloading the API or hitting rate limits.
  for (const seriesId of seriesIds) {
    console.log(`Fetching and storing data for series: ${seriesId}`);
    try {
      await storeFredData(seriesId);
    } catch (error) {
      console.error(`Error processing series ${seriesId}:`, error);
    }
  }

  console.log("All selected banking series data fetched and stored.");
}

fetchAllBankingSeries().catch((error) => {
  console.error("Error in fetching all series:", error);
});
