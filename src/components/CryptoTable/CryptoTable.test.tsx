import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import CryptoTable from "./CryptoTable";
import axios from "axios";
import { render } from "../../setupTests";
// Mocking axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock data
const mockCryptoData = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    priceUsd: "50000",
    marketCapUsd: "1000000000",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    priceUsd: "3000",
    marketCapUsd: "300000000",
  },
];

describe("CryptoTable Component", () => {
  beforeEach(async () => {
    // Mock the API call to return mock data
    mockedAxios.get.mockResolvedValue({ data: { data: mockCryptoData } });

    // Use act to wrap the rendering and initial state update
    await act(async () => {
      render(<CryptoTable />);
    });
  });

  it("should render table headers correctly", () => {
    expect(
      screen.getByRole("columnheader", { name: /symbol/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /name/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /price \(usd\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /market cap \(usd\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /favorite/i })
    ).toBeInTheDocument();
  });

  it("should render the correct number of rows", async () => {
    await waitFor(() =>
      expect(screen.getAllByRole("row")).toHaveLength(mockCryptoData.length + 1)
    ); // +1 for the header row
  });

  it("should toggle favorite status on icon click", async () => {
    const starIcons = screen.getAllByTestId("StarBorderIcon");
    expect(starIcons).toHaveLength(mockCryptoData.length);

    fireEvent.click(starIcons[0]);
    await waitFor(() =>
      expect(screen.getAllByTestId("StarIcon")).toHaveLength(1)
    );
  });

  it("should filter the table based on search input", () => {
    fireEvent.change(screen.getByLabelText(/search by name/i), {
      target: { value: "Bitcoin" },
    });
    expect(screen.getByText(/Bitcoin/i)).toBeInTheDocument();
    expect(screen.queryByText(/Ethereum/i)).not.toBeInTheDocument();
  });
});
