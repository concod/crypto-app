import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  IconButton,
  Box,
  Typography,
  TextField,
  Skeleton,
  useTheme,
} from "@mui/material";
import { Star, StarBorder } from "@mui/icons-material";
import { visuallyHidden } from "@mui/utils";
import { Link } from "react-router-dom";
import { fetchCryptoData } from "services/fetchCryptoData";

// Define the CryptoData interface for type safety
interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  priceUsd: string;
  marketCapUsd: string;
}

const CryptoTable: React.FC = () => {
  // State variables to manage crypto data, favorite list, sorting, pagination, loading state, and search term
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [favoriteList, setFavoriteList] = useState<Set<string>>(new Set());
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof CryptoData>("name");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const wsRef = useRef<WebSocket | null>(null); // Use ref for WebSocket connection
  const theme = useTheme();

  // Fetch all asset IDs and subscribe to WebSocket updates
  useEffect(() => {
    const fetchDataAndSubscribe = async () => {
      try {
        // Fetch all assets
        const response = await fetchCryptoData<CryptoData[]>("/assets");
        const assets = response;
        setCryptoData(assets);

        // Prepare WebSocket URL
        const assetIds = assets.map((asset: CryptoData) => asset.id).join(",");
        const wsUrl = `wss://ws.coincap.io/prices?assets=${assetIds}`;
        wsRef.current = new WebSocket(wsUrl);

        // Handle incoming WebSocket messages
        wsRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setCryptoData((prevData) =>
            prevData.map((crypto) => ({
              ...crypto,
              priceUsd: data[crypto.id]
                ? parseFloat(data[crypto.id]).toFixed(6)
                : crypto.priceUsd,
            }))
          );
        };

        // Handle WebSocket errors
        wsRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        // Handle WebSocket closure
        wsRef.current.onclose = () => {
          console.log("WebSocket connection closed");
        };
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndSubscribe();

    // Cleanup WebSocket connection on component unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Load favorites from local storage on component mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      try {
        const favoritesArray = JSON.parse(storedFavorites);
        if (Array.isArray(favoritesArray)) {
          setFavoriteList(new Set(favoritesArray));
        } else {
          console.error("Stored favorites are not an array");
        }
      } catch (error) {
        console.error("Error parsing stored favorites:", error);
      }
    }
  }, []);

  // Save favorites to local storage whenever favoriteList changes
  useEffect(() => {
    const favoriteArray = Array.from(favoriteList);
    localStorage.setItem("favorites", JSON.stringify(favoriteArray));
  }, [favoriteList]);

  // Handle sorting of columns
  const handleSort = (property: keyof CryptoData) => {
    const isAscending = orderBy === property && order === "asc";
    setOrder(isAscending ? "desc" : "asc");
    setOrderBy(property);
  };

  // Handle page change in pagination
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  // Handle rows per page change in pagination
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Toggle favorite status of a cryptocurrency
  const handleFavoriteToggle = (id: string) => {
    setFavoriteList((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  // Filter and sort the data based on search term and sort order
  const filteredData = cryptoData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate the sorted data
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box
      sx={{
        background: theme.palette.background.default,
        minHeight: "100vh",
        padding: "0px 20px",
      }}
    >
      <Box
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Search bar for filtering cryptocurrencies by name */}
        <TextField
          label="Search by Name"
          variant="outlined"
          fullWidth
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            marginTop: "15px",
            mb: 2,
            width: "300px",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            "& .MuiOutlinedInput-root": {
              borderRadius: "4px",

              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.secondary.main,
              },
            },
            "& .MuiInputLabel-root": {
              color: theme.palette.text.primary,
              "&.Mui-focused": {
                color: theme.palette.secondary.main,
              },
            },
          }}
        />
      </Box>
      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: "10px" }}>
        <TableContainer
          sx={{
            maxHeight: "calc(100vh - 155px)",
            overflowY: "auto",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ py: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    <TableSortLabel
                      active={orderBy === "symbol"}
                      direction={orderBy === "symbol" ? order : "asc"}
                      onClick={() => handleSort("symbol")}
                    >
                      Symbol
                      {orderBy === "symbol" ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === "desc"
                            ? "sorted descending"
                            : "sorted ascending"}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    <TableSortLabel
                      active={orderBy === "name"}
                      direction={orderBy === "name" ? order : "asc"}
                      onClick={() => handleSort("name")}
                    >
                      Name
                      {orderBy === "name" ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === "desc"
                            ? "sorted descending"
                            : "sorted ascending"}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Price (USD)
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Market Cap (USD)
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Favorite
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from(new Array(rowsPerPage)).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton variant="text" width={50} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={150} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={100} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={150} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="circular" width={30} height={30} />
                      </TableCell>
                    </TableRow>
                  ))
                : paginatedData.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <TableCell sx={{ py: 1 }}>{row.symbol}</TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Link
                          to={`/details/${row.id}`}
                          style={{
                            cursor: "pointer",
                            textTransform: "none",
                            fontWeight: "bold",
                            color: theme.palette.secondary.main,
                            textDecoration: "underline",
                          }}
                        >
                          {row.name}
                        </Link>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        ${parseFloat(row.priceUsd).toFixed(6)}
                      </TableCell>
                      <TableCell>
                        ${parseFloat(row.marketCapUsd).toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteToggle(row.id);
                          }}
                          sx={{
                            color: favoriteList.has(row.id)
                              ? theme.palette.warning.main
                              : theme.palette.text.primary,
                            "&:hover": {
                              color: theme.palette.warning.dark,
                            },
                          }}
                        >
                          {favoriteList.has(row.id) ? <Star /> : <StarBorder />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={cryptoData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default CryptoTable;
