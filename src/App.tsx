import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import PageLoader from "components/PageLoader";

// Lazy load the components
const CryptoDetails = lazy(
  () => import("components/CryptoDetails/CryptoDetails")
);
const CryptoTable = lazy(() => import("components/CryptoTable/CryptoTable"));

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<CryptoTable />} />
          <Route path="/details/:id" element={<CryptoDetails />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
