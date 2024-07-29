# Cryptocurrency Application

A comprehensive cryptocurrency application built with React.js, AG Grid, and Material-UI, featuring real-time updates, historical data, and a responsive design. This application allows users to track cryptocurrency prices, view detailed information about each coin, and manage favorite cryptocurrencies.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Installation](#installation)
5. [Usage](#usage)
6. [API Integration](#api-integration)
7. [WebSocket Integration](#websocket-integration)
8. [Search Functionality](#search-functionality)
9. [Testing](#testing)
10. [Contributing](#contributing)
11. [License](#license)

## Project Overview

This cryptocurrency application provides a user-friendly interface to view real-time and historical data of various cryptocurrencies. Users can explore the list of cryptocurrencies, view detailed information about each coin, and access price history charts. The application supports persistent state for user favorites and updates data using WebSockets for real-time price changes.

## Features

- **Real-Time Price Updates:** Get live price updates for over 100 cryptocurrencies using WebSockets.
- **Historical Data:** View historical price data with interactive charts.
- **Favorites:** Add or remove cryptocurrencies from favorites with persistent state using local storage.
- **Responsive Design:** Optimized for both desktop and mobile devices.
- **Search Functionality:** Search for cryptocurrencies by name.

## Technologies Used

- **React.js:** Frontend library for building user interfaces.
- **AG Grid:** For displaying and managing tabular data.
- **Material-UI:** Design library for consistent and modern UI components.
- **Chart.js:** For rendering interactive charts.
- **Axios:** For making HTTP requests.
- **WebSocket:** For real-time data updates.
- **Local Storage:** For persisting favorite cryptocurrencies.

## Installation

Follow these steps to set up the project on your local machine:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/cryptocurrency-application.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd cryptocurrency-application
   ```

3. **Install the dependencies:**

   ```bash
   yarn install
   ```

4. **Start the development server:**

   ```bash
   yarn start
   ```

5. **Open your browser and visit:**

   http://localhost:3000

## Usage

- **Home Page:** Displays a list of cryptocurrencies with real-time prices and includes a search feature to filter cryptocurrencies by name.
- **Details Page:** Provides detailed information and historical price charts for a selected cryptocurrency.
- **Favorites:** Add cryptocurrencies to your favorites list to quickly access them later.

## Search Functionality

The application includes a search feature on the home page that allows users to filter the cryptocurrency list by name. This feature enhances user experience by enabling quick access to specific cryptocurrencies. The search functionality is implemented with a text input field that filters the displayed list based on the user's input.

## API Integration

The application uses the following APIs:

- **CoinCap API:** For fetching cryptocurrency details and historical data.
  - **Endpoint for asset details:** `https://api.coincap.io/v2/assets/{id}`
  - **Endpoint for historical data:** `https://api.coincap.io/v2/assets/{id}/history?interval=d1`

## WebSocket Integration

The application listens to WebSocket events for real-time price updates for over 100 cryptocurrencies. The WebSocket URL used is: wss://ws.coincap.io/prices?assets=bitcoin,ethereum,monero,litecoin,...,n

Replace the placeholders with actual asset names. Ensure to update the URL with the complete list of assets required.

## Testing

The project includes unit and integration tests. To run the tests, use:

```bash
yarn test

```
