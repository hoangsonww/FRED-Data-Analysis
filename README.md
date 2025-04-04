# FRED Data Analysis Project - Banking Sector

_By David Nguyen, 04/01/2025_

This repository contains a mockup full-stack application that fetches banking data from the FRED API, vectorizes it using Pinecone, and provides a chatbot interface for querying the data.
The application is built with TypeScript and uses Express for the backend. The frontend is a simple React application that interacts with the backend API.

This project is divided into two main parts:

1. The [application](#1-the-full-stack-application):
   - A sample full-stack application that fetches banking data from the FRED API, clean and preprocesses it, and stores it in a MongoDB database.
   - It also vectorizes the data using Pinecone and provides a chatbot with RAG (retrieval-augmented generation) capabilities.
   - The backend is built with TypeScript and uses Express for the server.
   - The frontend is a simple React application that interacts with the backend API.
   - Visit the [application section](#1-the-full-stack-application) below for setup instructions and commands to run the application.
2. The [analysis](#2-fred-banking-data-analysis-report):
   - A detailed analysis of the FRED banking data using regression models and plots.
   - The analysis is performed using TypeScript and the results are saved in the `backend` directory.
   - The analysis includes linear regression, polynomial regression, and regression on daily percent change.
   - The results are summarized in a report format, including charts and AI-generated summaries.
   - Visit the [analysis section](#2-fred-banking-data-analysis-report) below for a detailed report on the FRED banking data analysis.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Pinecone](https://img.shields.io/badge/Pinecone-5D3FD3?style=for-the-badge&logo=pinecone&logoColor=white)
![Google AI](https://img.shields.io/badge/Google%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)
![FRED API](https://img.shields.io/badge/FRED%20API-003366?style=for-the-badge&logo=federalreserve&logoColor=white)
![Simple Statistics](https://img.shields.io/badge/simple--statistics-FF6F00?style=for-the-badge&logo=apachespark&logoColor=white)
![ML Regression](https://img.shields.io/badge/ml--regression-00599C?style=for-the-badge&logo=chartdotjs&logoColor=white)
![Data Analysis](https://img.shields.io/badge/Data%20Analysis-6E6E6E?style=for-the-badge&logo=databricks&logoColor=white)

---

# 1. The Full-Stack Application

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- MongoDB
- Pinecone account
- Google AI account

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```plaintext
FRED_API_KEY=<your_fred_api_key>
GOOGLE_AI_API_KEY=<your_google_ai_api_key>
PINECONE_API_KEY=<your_pinecone_api_key>
PINECONE_INDEX_NAME=fred-index
MONGO_URI=<your_mongo_uri>
```

## Instructions / Commands

### To Run the Data Fetching & Vectorization Functionality

```bash
cd backend
npx tsx src/runAll.ts
```

This will fetch the data from the database, vectorize it, and store it in the vector database. Also store data in MongoDB.

Alternatively, run `npm run run:all` to quickly start the data fetching and vectorization. (Run inside the `backend` directory)

### To Run the Query Pinecone Functionality

```bash
cd backend
npx tsx src/queryRag.ts
```

This will query the Pinecone vector database and return the most relevant data based on the input query. The results will be logged in the console.

Alternatively, run `npm run query:pinecone` to quickly start the query. (Run inside the `backend` directory)

### To Run the Chatbot Functionality

```bash
cd backend
npx tsx src/chatWithAI.ts
```

This will start a chatbot session where you can ask questions about the banking data. The chatbot will use the vectorized data from Pinecone to provide answers. The results will be logged in the console.

Change the query in the `src/chatWithAI.ts` file to test different queries.

Alternatively, run `npm run chat` to quickly start the chatbot. (Run inside the `backend` directory)

### To Analyze FRED Data with Regressions and Plots

```bash
cd backend
npx tsx src/analyzeFredData.ts
```

This will analyze the FRED data and generate regression plots. The results will be saved in the `backend` directory.

Additionally, AI generated reports will also be logged in the console. It will be very helpful for you to understand the data and the analysis.

Alternatively, run `npm run analyze` to quickly analyze the data.

### To Run the Backend Express API Server

```bash
cd backend
npx tsx src/server.ts
```

This will start the Express server on `http://localhost:3000` (or another port if 3000 is in use). The API endpoints are defined in the `src/server.ts` file.

Alternatively, run `npm run dev` to start the server with hot reloading. (Run inside the `backend` directory)

### To Run the Frontend React Application

There is also a simple React application that interacts with the backend API. To run the frontend application, follow these steps:

```bash
cd frontend
npm install
npm start
```

This will start the React application on `http://localhost:3000` (or another port if 3000 is in use).

Here is how the frontend UI looks like:

![FRED Banking Data Analysis](frontend/public/frontend.png)

It will allow you to chat with the AI and ask questions about the banking data. The chatbot will use the vectorized data from Pinecone to provide answers.

Additionally, it will also allow you to view the regression plots generated from the analysis in a more interactive and user-friendly manner.

---

# 2. FRED Banking Data Analysis Report

## Overview

This report summarizes the results from our comprehensive regression analysis of key banking indicators obtained from the FRED API. The analysis was conducted on cleaned and preprocessed data. The following series were analyzed:

- **TOTALSL** – Total Loans and Leases at Commercial Banks
- **TOTALSA** – Total Assets of Commercial Banks
- **MPRIME** – Bank Prime Loan Rate
- **FEDFUNDS** – Effective Federal Funds Rate

For each series, we performed multiple regression analyses—including linear regression, ten polynomial regressions (orders 1 through 10), and a regression on daily percent change. Charts were generated for visual inspection, and detailed natural language summaries were produced via Google’s Gemini AI.

## Detailed Findings by Series

### 1. TOTALSL (Total Loans and Leases at Commercial Banks)

- **Time Period:** January 1, 2020 – January 1, 2025
- **Observations:** 61

**Linear Regression:**

- **Equation:** _y = 632.8533 · (days) + 4092953.4267_
- **R²:** 0.9306  
  _Interpretation:_ A very strong linear trend indicates that TOTALSL increases by roughly 633 units per day. This model explains over 93% of the variability in the data.

**Polynomial Regressions:**

- The second-order polynomial regression slightly improved the R² to 0.9500.
- All higher-order models (orders 3–10) produced negative R² values (with some extremely negative), suggesting overfitting and model instability.  
  _Interpretation:_ The negative coefficients in higher orders indicate that attempting to model nonlinearity with these polynomials does not add value and may even distort the trend.

**Percent Change Regression:**

- **Equation:** _y = -0.005 · (index) + 0.4397_
- **R²:** 0.0189  
  _Interpretation:_ The regression on daily percent change shows a very weak relationship, meaning that percent changes are highly volatile and are not well explained by a simple linear trend.

**Chart:**

- A line chart overlaid with the linear regression line was generated and saved as `TOTALSL_analysis.png`.

![TOTALSL Analysis](backend/TOTALSL_analysis.png)

**AI Refined Summary Highlights:**

- The analysis confirms a strong, consistent upward trend in TOTALSL.
- While a second-order polynomial offers marginal improvement, higher-order models overfit the data.
- Modeling percent change is not appropriate for this series.

### 2. TOTALSA (Total Assets of Commercial Banks)

- **Time Period:** January 1, 2020 – February 1, 2025
- **Observations:** 62

**Linear Regression:**

- **Equation:** _y = 0.0009 · (days) + 14.5552_
- **R²:** 0.0843  
  _Interpretation:_ Only a small fraction of variability is explained by time, indicating a very weak trend.

**Polynomial Regressions:**

- All polynomial models (orders 1–10) produced negative R² values, which is statistically nonsensical and points to model misspecification.

**Percent Change Regression:**

- **Equation:** _y = 0.0023 · (index) + 0.2811_
- **R²:** ≈ 0.0000  
  _Interpretation:_ Almost no explanatory power was found when modeling percent change.

**Chart:**

- The data and its linear regression line were plotted and saved as `TOTALSA_analysis.png`.

![TOTALSA Analysis](backend/TOTALSA_analysis.png)

**AI Refined Summary Highlights:**

- The models fail to capture any meaningful trend for TOTALSA.
- Both linear and polynomial approaches provide weak or invalid fits.
- The low R² values call for further data cleaning or alternative modeling approaches.

### 3. MPRIME (Bank Prime Loan Rate)

- **Time Period:** January 1, 2020 – February 1, 2025
- **Observations:** 62

**Linear Regression:**

- **Equation:** _y = 0.0037 · (days) + 2.2573_
- **R²:** 0.7678  
  _Interpretation:_ A relatively strong linear trend suggests that MPRIME shows a steady upward trend over time.

**Polynomial Regressions:**

- All polynomial models yielded negative R² values, indicating that higher-order polynomial terms are not capturing any additional variability in the data and are likely overfitting.

**Percent Change Regression:**

- **Equation:** _y = 0.0396 · (index) + -0.3106_
- **R²:** 0.0198  
  _Interpretation:_ Modeling the percent change yields a very weak fit, confirming that the simple linear model is more appropriate.

**Chart:**

- A chart was generated and saved as `MPRIME_analysis.png`.

![MPRIME Analysis](backend/MPRIME_analysis.png)

**AI Refined Summary Highlights:**

- The linear regression model is the most robust for MPRIME.
- Polynomial models and percent change regression are unsuitable for this dataset.
- The data shows a clear upward trend, which the linear model captures effectively.

### 4. FEDFUNDS (Effective Federal Funds Rate)

- **Time Period:** January 1, 2020 – February 1, 2025
- **Observations:** 62

**Linear Regression:**

- **Equation:** _y = 0.0037 · (days) + -0.9124_
- **R²:** 0.7680  
  _Interpretation:_ A moderate positive linear trend is observed, with the model explaining approximately 77% of the variability.

**Polynomial Regressions:**

- All polynomial regressions (orders 1–10) returned negative R² values, indicating that these models are not suitable and overfit the data.

**Percent Change Regression:**

- **Equation:** _y = 0.0346 · (index) + 6.742_
- **R²:** 0.0003  
  _Interpretation:_ The percent change regression fails to provide any meaningful relationship.

**Chart:**

- A chart with the linear regression overlay was generated and saved as `FEDFUNDS_analysis.png`.

![FEDFUNDS Analysis](backend/FEDFUNDS_analysis.png)

**AI Refined Summary Highlights:**

- The linear regression model provides the best fit for FEDFUNDS, though the variability not captured by the model suggests other factors might be influencing the rate.
- Polynomial and percent change regressions are not reliable for this series.

## Overall Conclusions & Implications

### Key Conclusions

- **Robust Trends in TOTALSL, MPRIME, and FEDFUNDS:**  
  The strong linear trends in TOTALSL, MPRIME, and FEDFUNDS suggest consistent directional movement in these indicators, which can be valuable for forecasting and policy analysis.

- **Weak Signal in TOTALSA:**  
  The minimal explanatory power in TOTALSA highlights potential issues with the data or the need for additional explanatory variables to capture asset growth accurately.

### Implications for the Banking Sector

- **Credit Growth and Economic Expansion:**  
  The strong upward trend in TOTALSL indicates robust credit expansion, suggesting that banks are increasingly extending loans and leases. This trend is often associated with economic growth but could also signal rising credit risk if asset quality deteriorates.

- **Asset Management Challenges:**  
  The ambiguous trend in TOTALSA calls for a more nuanced analysis. Banks may need to consider not just the size but also the composition and quality of assets. Additional models that incorporate external economic indicators might provide deeper insights.

- **Monetary Policy Effects:**  
  The steady increases in MPRIME and FEDFUNDS reflect the impact of monetary policy tightening. As these rates rise, banks may adjust their lending practices, impacting consumer borrowing, business investments, and overall market liquidity. The rising prime rate may reduce borrowing demand, while higher federal funds rates can lead to tighter liquidity conditions.

- **Risk Management and Forecasting:**  
  For banks and financial institutions, robust linear models for TOTALSL, MPRIME, and FEDFUNDS provide a basis for forecasting and risk management. However, given the limitations observed (e.g., overfitting in higher-order models), it is essential to incorporate further data cleaning and external economic variables for more refined forecasts. The low R² in percent change regressions suggests that short-term volatility remains unpredictable. Banks should consider more advanced time series or machine learning models to better understand and manage this volatility.

- **Strategic Adjustments:**  
  Banks should be cautious about aggressive credit expansion in the context of rising rates. While expanding loan portfolios can drive growth, it also increases exposure to potential defaults if borrowers are unable to meet higher repayment costs. Regulatory bodies may also use these insights to monitor financial stability and enforce measures that prevent overheating in the lending market.

### Recommendations

- **Enhance Data Preprocessing:**  
  Future analyses should include additional data cleaning, normalization, and possibly outlier detection to improve model reliability, particularly for TOTALSA.

- **Incorporate Additional Variables:**  
  Including macroeconomic variables (GDP growth, unemployment rates, etc.) may help explain variations in asset growth and credit trends more effectively.

- **Explore Advanced Models:**  
  Given the limitations of polynomial and percent change models, consider time series models (e.g., ARIMA, SARIMA) or even machine learning techniques for more nuanced forecasting.

- **Continuous Monitoring:**  
  Implement an automated dashboard that integrates these regression models and continuously updates predictions, enabling real-time monitoring of the banking sector's health.

### Future Work

- **Expand Data Sources:**  
  Integrate additional datasets from other financial institutions or economic indicators to provide a more comprehensive view of the banking sector. Also, since this only consists of banking data, consider adding other sectors (e.g., real estate, consumer credit) to provide a more holistic view of the economy.

- **User Interface Enhancements:**  
  Improve the frontend React application with richer UI components such as interactive charts (using libraries like Plotly or Chart.js), historical trend sliders, and real-time query visualizations.

- **Implement Time Series Forecasting:**  
  Incorporate more advanced forecasting models like ARIMA, SARIMA, or Prophet to predict future trends in banking indicators.

- **Add Natural Language Explanations:**  
  Expand AI capabilities to generate not just summaries, but also explanations and alerts using plain language for non-technical users or banking analysts.

- **Automate Data Pipelines:**  
  Schedule regular data pulls and model retraining using cron jobs or serverless functions to keep the vector database and analysis fresh.

- **Compare Against Macroeconomic Events:**  
  Correlate trends in the banking data with key economic events (e.g., interest rate hikes, bank failures, policy changes) to strengthen insights.

### Remarks

This analysis serves as a foundational step in understanding the dynamics of the banking sector through data-driven insights. The findings and recommendations aim to guide future research and practical applications in banking analytics.

In the near future, I will also explore the integration of machine learning models for more sophisticated predictions and analyses. The goal is to provide a comprehensive toolkit for banking analysts and decision-makers to navigate the complexities of the financial landscape.

---

Thank you for reviewing this report. For any questions or further analysis, please feel free to reach out.
