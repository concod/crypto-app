import React from "react";
import { render, screen, waitFor } from "../../setupTests";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CryptoDetails from "./CryptoDetails";

const mock = new MockAdapter(axios);

describe("CryptoDetails Component", () => {
  afterEach(() => {
    mock.reset();
  });

  it("renders loading state initially", () => {
    render(
      <MemoryRouter initialEntries={["/crypto/bitcoin"]}>
        <Routes>
          <Route path="/crypto/:id" element={<CryptoDetails />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders no data available state when data is not found", async () => {
    mock
      .onGet("https://api.coincap.io/v2/assets/bitcoin")
      .reply(200, { data: null });

    render(
      <MemoryRouter initialEntries={["/crypto/bitcoin"]}>
        <Routes>
          <Route path="/crypto/:id" element={<CryptoDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });
  });

  it("renders crypto details and chart when data is fetched", async () => {
    const detailResponse = {
      data: {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        priceUsd: "30000.00",
        marketCapUsd: "600000000.00",
      },
    };

    const historyResponse = {
      data: [
        { time: Date.now(), priceUsd: "30000.00" },
        { time: Date.now() - 86400000, priceUsd: "31000.00" },
        // Add more data points if necessary
      ],
    };

    mock
      .onGet("https://api.coincap.io/v2/assets/bitcoin")
      .reply(200, detailResponse);
    mock
      .onGet("https://api.coincap.io/v2/assets/bitcoin/history?interval=d1")
      .reply(200, historyResponse);

    render(
      <MemoryRouter initialEntries={["/crypto/bitcoin"]}>
        <Routes>
          <Route path="/crypto/:id" element={<CryptoDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Bitcoin")).toBeInTheDocument();
      expect(screen.getByText("Symbol: BTC")).toBeInTheDocument();
      expect(screen.getByText("Price (USD): $30000.00")).toBeInTheDocument();
      expect(
        screen.getByText("Market Cap (USD): $600000000.00")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Price History (Last 30 Days)")
      ).toBeInTheDocument();
    });
  });
});
