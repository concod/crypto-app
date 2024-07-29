import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Paper,
  Typography,
  Box,
  Divider,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

import { fetchCryptoData } from "services/fetchCryptoData";
import PageLoader from "components/PageLoader";

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  ChartTooltip,
  Legend
);

interface CryptoDetail {
  id: string;
  symbol: string;
  name: string;
  priceUsd: string;
  marketCapUsd: string;
}

const CryptoDetails: React.FC = () => {
  // Retrieve the cryptocurrency ID from the URL parameters
  const { id } = useParams<{ id: string }>();

  // State variables for storing cryptocurrency details, price history, labels, and loading status
  const [cryptoDetail, setCryptoDetail] = useState<CryptoDetail | null>(null);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState<Boolean>(true);

  // Reference for the chart component
  const chartRef = useRef<any>(null);

  // Access the current theme
  const theme = useTheme();

  // Determine if the screen size is small
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    // Function to fetch data from the API
    const fetchData = async () => {
      try {
        // Fetch cryptocurrency details
        const detailResponse = await fetchCryptoData<CryptoDetail>(
          `/assets/${id}`
        );
        setCryptoDetail(detailResponse);

        // Fetch cryptocurrency price history
        const historyResponse = await fetchCryptoData<any>(
          `/assets/${id}/history?interval=d1`
        );
        const historyData = historyResponse;

        // Filter data for the past 30 days
        const now = Date.now();
        const past30DaysData = historyData.filter((item: { time: number }) => {
          const itemDate = new Date(item.time).getTime();
          return now - itemDate <= 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        });

        // Set the price history and labels
        setPriceHistory(
          past30DaysData.map((item: { priceUsd: string }) =>
            parseFloat(item.priceUsd).toFixed(2)
          )
        );
        setLabels(
          past30DaysData.map((item: { time: number }) =>
            new Date(item.time).toLocaleDateString()
          )
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        // Set loading to false after data fetch is complete
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function to destroy the chart reference if it exists
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [id]);

  // Display a loading indicator while data is being fetched
  if (loading) {
    return <PageLoader />;
  }

  // Display a message if no data is available
  if (!cryptoDetail) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        sx={{ background: "linear-gradient(135deg, #f0f0f0, #e0e0e0)" }}
      >
        <Typography variant="h6" color="textPrimary">
          No data available
        </Typography>
      </Box>
    );
  }

  // Chart data configuration
  const data = {
    labels: labels,
    datasets: [
      {
        label: `${cryptoDetail.name} Price (USD)`,
        data: priceHistory,
        borderColor: theme.palette.primary.main,
        backgroundColor: `${theme.palette.primary.main}20`,
        fill: true,
        tension: 0.3, // Smooth line
        pointRadius: 0, // Hide points
      },
    ],
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f0f0f0, #e0e0e0)",
        minHeight: "100vh",
        padding: "10px",
      }}
    >
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={8}>
          <Paper
            elevation={6}
            sx={{
              padding: "30px",
              borderRadius: "15px",
              background: "#fff",
              boxShadow: `0px 10px 20px ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant={isSmallScreen ? "h5" : "h4"}
              gutterBottom
              align="center"
              color={theme.palette.text.primary}
            >
              {cryptoDetail.name}
            </Typography>
            <Divider
              sx={{ margin: "20px 0", backgroundColor: theme.palette.divider }}
            />
            <Typography
              variant={isSmallScreen ? "h6" : "h5"}
              color={theme.palette.text.secondary}
              gutterBottom
            >
              <strong>Symbol:</strong> {cryptoDetail.symbol.toUpperCase()}
            </Typography>
            <Typography
              variant={isSmallScreen ? "h6" : "h5"}
              color={theme.palette.text.secondary}
              gutterBottom
            >
              <strong>Price (USD):</strong> $
              {parseFloat(cryptoDetail.priceUsd).toFixed(2)}
            </Typography>
            <Typography
              variant={isSmallScreen ? "h6" : "h5"}
              color={theme.palette.text.secondary}
              gutterBottom
            >
              <strong>Market Cap (USD):</strong> $
              {parseFloat(cryptoDetail.marketCapUsd).toFixed(2)}
            </Typography>
            <Box
              sx={{
                marginTop: "30px",
                height: "400px",
                borderRadius: "15px",
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: `0px 6px 12px ${theme.palette.divider}`,
                overflow: "hidden",
                background: "#fafafa",
                padding: "20px", // Added padding to ensure space for labels
              }}
            >
              <Typography
                variant={isSmallScreen ? "h5" : "h4"}
                gutterBottom
                align="center"
                color={theme.palette.text.primary}
                sx={{ mb: 2 }}
              >
                Price History (Last 30 Days)
              </Typography>
              <Line
                data={data}
                ref={chartRef}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top" as const,
                      labels: {
                        color: theme.palette.text.primary,
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const label = context.dataset.label || "";
                          const value = context.raw as number;
                          return `${label}: $${value.toFixed(2)}`;
                        },
                      },
                    },
                  },
                  elements: {
                    line: {
                      borderWidth: 2,
                    },
                    point: {
                      radius: 0,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        // display: false,
                      },
                      ticks: {
                        color: theme.palette.text.secondary,
                        callback: function (value, index, values) {
                          // Convert index to date format
                          const date = new Date(labels[index]);
                          const formattedDate = `${
                            date.getMonth() + 1
                          }/${date.getDate()}/${date.getFullYear()}`;
                          const totalLabels = values.length;
                          const interval = Math.floor(totalLabels / 7); // Show approximately 7 labels

                          if (
                            index === 0 ||
                            index === totalLabels - 1 ||
                            index % interval === 0
                          ) {
                            return formattedDate;
                          }
                          return ""; // Skip intermediate labels
                        },
                      },
                      title: {
                        display: true,
                        text: "Date",
                        color: theme.palette.text.primary,
                        padding: 20,
                      },
                    },
                    y: {
                      grid: {
                        borderColor: theme.palette.divider,
                        borderWidth: 1,
                      },
                      ticks: {
                        color: theme.palette.text.secondary,
                        callback: function (value) {
                          return `$${value}`; // Format y-axis ticks
                        },
                        padding: 10, // Add padding to prevent clipping
                      },
                      title: {
                        display: true,
                        text: "Price (USD)",
                        color: theme.palette.text.primary,
                        padding: 10,
                      },
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CryptoDetails;
