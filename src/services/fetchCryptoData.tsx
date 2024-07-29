import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://api.coincap.io/v2",
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchCryptoData = async <T,>(url: string): Promise<T> => {
  try {
    const response = await apiClient.get(url);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
