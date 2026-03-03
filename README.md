# 💰 Wealth Dashboard

A modern React-based investment portfolio visualization dashboard that displays asset allocation through interactive pie charts.

## Features

- **Asset Allocation Levels**: Switch between High Level and Low Level views
  - **High Level**: Shows aggregated allocation between Stocks and Unit Trusts
  - **Low Level**: Shows individual holdings breakdown for each stock and unit trust
- **Interactive Pie Charts**: Built with Chart.js for smooth, responsive visualizations
- **Real-time Data**: Fetches data from JSON files containing stock and unit trust information
- **Modern UI/UX**: Beautiful gradient backgrounds, smooth animations, and responsive design
- **Currency Formatting**: Displays values in SGD with proper formatting
- **Portfolio Summary**: Shows total portfolio value and detailed breakdown

## Technology Stack

- **React 18**: Modern React with hooks
- **Chart.js**: For interactive pie charts
- **React-ChartJS-2**: React wrapper for Chart.js
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **JSON**: Data storage for stock and unit trust information

## Data Structure

The application reads from three JSON files:

1. **Stocks_List_1.json**: Contains first set of stock holdings
2. **Stocks_List_2.json**: Contains second set of stock holdings  
3. **Unit_Trust_List_1.json**: Contains unit trust fund holdings

### Stock Data Fields
- `code`: Stock symbol
- `name`: Company name
- `mktval`: Market value in USD
- `exRate`: Exchange rate to SGD
- `profit`: Profit/loss

### Unit Trust Data Fields
- `fundName`: Fund name
- `marketValueBaseCcy`: Market value in SGD
- `unRealPLInBaseCcy`: Unrealized profit/loss

## Installation & Local Run

### Prerequisites

- **Node.js** (v16 or later recommended)
- **npm** (comes with Node)

### Steps to run locally

1. **Install dependencies** (first time only):

   ```bash
   cd /Users/arunv/Desktop/Fixathon/Investment-Dashboard
   npm install
   ```

2. **Start the React development server**:

   ```bash
   npm start
   ```

3. **Open the dashboard in your browser**:

   - Navigate to `http://localhost:3000`
   - No authentication or access token is required; the **Wealth Dashboard loads directly** using the demo JSON data in `public/data/`.

4. **Stopping the dev server**:

   - Go to the terminal where `npm start` is running
   - Press **Ctrl + C** to stop it

5. **If you still see an old “Enter Access Token” popup**:

   - Make sure all terminals running `npm start` / `npm run dev` are stopped (`Ctrl + C`)
   - Run `npm start` again
   - Do a **hard refresh** in the browser:
     - macOS: `Cmd + Shift + R`
     - Windows/Linux: `Ctrl + Shift + R`

## Usage

1. **Select Allocation Level**: Use the dropdown to choose between:
   - **High Level**: View allocation by asset class (Stocks vs Unit Trusts)
   - **Low Level**: View allocation by individual holdings

2. **Interact with Charts**: 
   - Hover over chart segments to see detailed values
   - View percentage breakdowns in tooltips
   - Check the detailed portfolio breakdown below the chart

3. **Responsive Design**: The dashboard adapts to different screen sizes automatically

## File Structure

```
Investment-Dashboard/
├── public/
│   ├── data/
│   │   ├── Stocks_List_1.json
│   │   ├── Stocks_List_2.json
│   │   └── Unit_Trust_List_1.json
│   └── index.html
├── src/
│   ├── App.js          # Main application component
│   ├── App.css         # Styling and animations
│   ├── index.js        # React entry point
│   └── index.css       # Global styles
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## Key Features

### High Level View
- Aggregates all stock holdings into "Stocks" category
- Aggregates all unit trust holdings into "Unit Trusts" category
- Shows percentage allocation between the two main asset classes

### Low Level View
- Displays each individual stock holding
- Displays each individual unit trust holding
- Shows percentage allocation for every single holding

### Data Processing
- Automatically converts USD stock values to SGD using exchange rates
- Handles multiple data sources (two stock lists + one unit trust list)
- Calculates total portfolio value and individual percentages

### UI/UX Features
- Gradient backgrounds and modern styling
- Smooth animations and transitions
- Responsive design for mobile and desktop
- Loading states with animated spinners
- Hover effects and interactive elements
- Custom scrollbars and modern typography

## Customization

You can easily customize the dashboard by:

1. **Adding New Data Sources**: Add more JSON files in the `public/data/` directory
2. **Modifying Colors**: Update the color schemes in `App.css`
3. **Adding New Chart Types**: Extend the Chart.js configuration
4. **Styling Changes**: Modify the CSS for different themes or layouts

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is created for demonstration purposes.
