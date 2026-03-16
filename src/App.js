import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const generatePerformanceData = (currentValue) => {
  // Generate simulated performance data for the last month
  const days = 30;
  const data = [];
  const labels = [];
  const baseValue = currentValue * 0.9; // Start 10% lower
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    // Simulate gradual growth with some volatility
    const progress = i / days;
    const volatility = (Math.random() - 0.5) * 0.02;
    const value = baseValue * (1 + progress * 0.1 + volatility);
    data.push(value);
  }
  
  return { labels, data };
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

function App({ keycloak }) {
  const [loading, setLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('Portfolio Overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');

  const processData = useCallback((stocksData, unitTrustsData) => {
    const stocks = stocksData.data || stocksData;
    const unitTrusts = unitTrustsData;

    // Calculate totals
    const stocksTotal = stocks.reduce((sum, item) => {
      const value = item.amt || item.marketValueBaseCcy || item.value || 0;
      return sum + value;
    }, 0);

    const unitTrustsTotal = unitTrusts.reduce((sum, item) => {
      const value = item.marketValueBaseCcy || item.value || 0;
      return sum + value;
    }, 0);

    // Calculate cash (placeholder - you can adjust this)
    const cashBalance = 144880; // This can be calculated or fetched from data

    const totalValue = stocksTotal + unitTrustsTotal + cashBalance;

    // Calculate percentage changes (simulated - you can calculate from historical data)
    const stocksChange = 15.2;
    const unitTrustsChange = 9.8;
    const totalChange = 12.8;

    // Get top 3 stocks
    const topStocks = stocks
      .map(item => ({
        name: item.name || item.code,
        code: item.code,
        value: item.amt || item.marketValueBaseCcy || item.value || 0,
        change: stocksChange // You can calculate actual change from historical data
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    // Get top unit trusts
    const topUnitTrusts = unitTrusts
      .map(item => ({
        name: item.fundName || `Fund ${item.fundCode}`,
        value: item.marketValueBaseCcy || item.value || 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 2);

    // Generate performance data (simulated - you can use real historical data)
    const performanceData = generatePerformanceData(totalValue);

    // Asset allocation data
    const allocationData = {
      labels: ['Stocks', 'Unit Trusts', 'Cash'],
      datasets: [{
        data: [stocksTotal, unitTrustsTotal, cashBalance],
        backgroundColor: ['#4A90E2', '#50C878', '#FFD700'],
        borderColor: ['#4A90E2', '#50C878', '#FFD700'],
        borderWidth: 1
      }]
    };

    setPortfolioData({
      totalValue,
      stocksTotal,
      unitTrustsTotal,
      cashBalance,
      stocksChange,
      unitTrustsChange,
      totalChange,
      topStocks,
      topUnitTrusts,
      performanceData,
      allocationData,
      stocksPercentage: (stocksTotal / totalValue) * 100,
      unitTrustsPercentage: (unitTrustsTotal / totalValue) * 100,
      cashPercentage: (cashBalance / totalValue) * 100
    });

    setLoading(false);
  }, []);

  const loadDemoData = useCallback(async () => {
    setLoading(true);
    try {
      const [stocksRes, unitTrustsRes] = await Promise.all([
        fetch('/data/Stocks_List_1.json'),
        fetch('/data/Unit_Trust_List_1.json')
      ]);

      if (!stocksRes.ok) throw new Error(`Failed to load Stocks_List_1.json: ${stocksRes.status}`);
      if (!unitTrustsRes.ok) throw new Error(`Failed to load Unit_Trust_List_1.json: ${unitTrustsRes.status}`);

      const stocksJson = await stocksRes.json();
      const unitTrustsJson = await unitTrustsRes.json();

      const stocks = Array.isArray(stocksJson?.data) ? stocksJson.data : [];
      const unitTrusts = Array.isArray(unitTrustsJson) ? unitTrustsJson : [];

      processData({ data: stocks }, unitTrusts);
    } catch (error) {
      console.error('Error loading demo data:', error);
      processData({ data: [] }, []);
    }
  }, [processData]);

  useEffect(() => {
    loadDemoData();
  }, [loadDemoData]);

  if (loading || !portfolioData) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data only if portfolioData exists
  const lineChartData = portfolioData ? {
    labels: portfolioData.performanceData.labels,
    datasets: [{
      label: 'Portfolio Value',
      data: portfolioData.performanceData.data,
      borderColor: '#4A90E2',
      backgroundColor: 'rgba(74, 144, 226, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 5
    }]
  } : null;

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return formatCurrency(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const pieChartOptions = portfolioData ? {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const percentage = ((value / portfolioData.totalValue) * 100).toFixed(0);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    }
  } : null;

  return (
    <div className="App" style={{ minHeight: '100vh', position: 'relative' }}>
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Wealth Dashboard</h1>
        </div>
        <nav className="header-nav">
          <button 
            className={selectedTab === 'Portfolio Overview' ? 'nav-tab active' : 'nav-tab'}
            onClick={() => setSelectedTab('Portfolio Overview')}
          >
            Portfolio Overview
          </button>
          <button 
            className={selectedTab === 'Performance' ? 'nav-tab active' : 'nav-tab'}
            onClick={() => setSelectedTab('Performance')}
          >
            Performance
          </button>
          <button 
            className={selectedTab === 'Allocation' ? 'nav-tab active' : 'nav-tab'}
            onClick={() => setSelectedTab('Allocation')}
          >
            Allocation
          </button>
          <button 
            className={selectedTab === 'Reports' ? 'nav-tab active' : 'nav-tab'}
            onClick={() => setSelectedTab('Reports')}
          >
            Reports
          </button>
        </nav>
        <div className="header-right">
          {keycloak && keycloak.authenticated && (
            <>
              <span className="header-username">
                {keycloak.tokenParsed?.preferred_username || 'User'}
              </span>
              <button
                className="header-icon"
                title="Logout"
                onClick={() => keycloak.logout()}
              >
                ⎋
              </button>
            </>
          )}
          <button className="header-icon" title="Notifications">□</button>
          <button className="header-icon" title="Profile">👤</button>
          <button className="header-icon" title="Help">?</button>
        </div>
      </header>

      {portfolioData && (
        <div className="dashboard-content">
        {/* Key Metrics Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Total Portfolio Value</div>
            <div className="metric-value">{formatCurrency(portfolioData.totalValue)}</div>
            <div className="metric-change positive">▲{portfolioData.totalChange}% Past Month</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Stocks</div>
            <div className="metric-value">{formatCurrency(portfolioData.stocksTotal)}</div>
            <div className="metric-change positive">▲{portfolioData.stocksChange}%</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Unit Trusts</div>
            <div className="metric-value">{formatCurrency(portfolioData.unitTrustsTotal)}</div>
            <div className="metric-change positive">▲{portfolioData.unitTrustsChange}%</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Cash</div>
            <div className="metric-value">{formatCurrency(portfolioData.cashBalance)}</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* Portfolio Performance */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Portfolio Performance</h3>
              <div className="timeframe-selector">
                {['1M', '3M', '6M', '1Y', 'All'].map(timeframe => (
                  <button
                    key={timeframe}
                    className={selectedTimeframe === timeframe ? 'timeframe-btn active' : 'timeframe-btn'}
                    onClick={() => setSelectedTimeframe(timeframe)}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>
            <div className="line-chart-container">
              {lineChartData && <Line data={lineChartData} options={lineChartOptions} />}
            </div>
          </div>

          {/* Asset Allocation */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Asset Allocation</h3>
            </div>
            <div className="pie-chart-container">
              {portfolioData.allocationData && <Pie data={portfolioData.allocationData} options={pieChartOptions} />}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-grid">
          {/* Top Stock Holdings */}
          <div className="info-card">
            <h3>Top Stock Holdings</h3>
            <table className="holdings-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>Value</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.topStocks.map((stock, index) => (
                  <tr key={index}>
                    <td>{stock.name}</td>
                    <td>{formatCurrency(stock.value)}</td>
                    <td className="change positive">▲{stock.change}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cash Balance */}
          <div className="info-card">
            <h3>Cash Balance</h3>
            <div className="cash-value">{formatCurrency(portfolioData.cashBalance)}</div>
            <div className="cash-details">
              <div className="cash-section">
                <div className="cash-label">Recent Transactions</div>
                <div className="cash-item">04/19/2024 $10,000</div>
              </div>
              <div className="cash-section">
                <div className="cash-label">Dividend Income</div>
                <div className="cash-item">$2,500</div>
              </div>
            </div>
          </div>

          {/* Unit Trust Investments */}
          <div className="info-card">
            <h3>Unit Trust Investments</h3>
            <table className="holdings-table">
              <thead>
                <tr>
                  <th>Fund</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.topUnitTrusts.map((fund, index) => (
                  <tr key={index}>
                    <td>{fund.name}</td>
                    <td>{formatCurrency(fund.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent News & Insights */}
          <div className="info-card">
            <h3>Recent News & Insights</h3>
            <ul className="news-list">
              <li>Market Update: Tech Stocks Rally</li>
              <li>Investment Tips for 2024</li>
              <li>Global Economic Outlook</li>
            </ul>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

export default App;
