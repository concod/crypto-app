// components/PageLoader/PageLoader.tsx
import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const PageLoader: React.FC = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      sx={{ background: "linear-gradient(135deg, #f0f0f0, #e0e0e0)" }}
    >
      <CircularProgress color="primary" size={60} />
    </Box>
  );
};

export default PageLoader;
