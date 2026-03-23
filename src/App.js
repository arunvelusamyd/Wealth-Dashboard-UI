import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { mockBanks, mockBankPortfolios } from './mockData';
import { DEV_MODE } from './devConfig';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Filter out subtotal / grand-total rows that appear inside Stocks.json arrays
const validStocks = (items) =>
  (items || []).filter(item => item.code && item.name);

function App({ keycloak }) {
  const [loading, setLoading]           = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);
  const [banks, setBanks]               = useState([]);
  const [selectedBank, setSelectedBank] = useState(null); // null = all banks
  const [isMock, setIsMock]             = useState(false);
  const [selectedTab, setSelectedTab]   = useState('Portfolio Overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [chatOpen, setChatOpen]         = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput]       = useState('');
  const [chatLoading, setChatLoading]   = useState(false);
  const [watchlist, setWatchlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wealthWatchlist') || '[]'); }
    catch { return []; }
  });
  const [watchlistInput, setWatchlistInput] = useState('');
  const chatEndRef  = useRef(null);
  // Cache raw fetched data so bank switching never triggers a network call
  const rawData = useRef({ bankPortfolios: {}, allPerformance: null, allNews: null });

  // Persist watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wealthWatchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = useCallback((symbol, name) => {
    const sym = symbol.trim().toUpperCase();
    if (!sym) return;
    setWatchlist(prev => {
      if (prev.some(w => w.symbol === sym)) return prev;
      return [...prev, { symbol: sym, name: name || sym, addedAt: new Date().toLocaleDateString('en-SG') }];
    });
    setWatchlistInput('');
  }, []);

  const removeFromWatchlist = useCallback((symbol) => {
    setWatchlist(prev => prev.filter(w => w.symbol !== symbol));
  }, []);

  // ── aggregate raw per-bank payloads into a single portfolio object ────────
  const processData = useCallback((bankPortfolios, performanceData, newsData) => {
    let allStocks        = [];
    let allUnitTrusts    = [];
    let totalCash        = 0;
    let cashTransactions = [];
    let dividendIncome   = 0;
    let allFixedDeposits = [];
    let cpfData          = null;
    const allSrsAccounts = [];   // one entry per bank that has SRS

    Object.entries(bankPortfolios).forEach(([bankCode, bp]) => {
      // ── Stocks (same format across all banks: { data: [...] }) ──────────
      if (bp.stocks?.data) {
        allStocks = allStocks.concat(validStocks(bp.stocks.data));
      }

      // ── Unit Trusts ──────────────────────────────────────────────────────
      if (Array.isArray(bp.unitTrusts)) {
        // SC / UOB / OCBC: plain array [ { fundName, marketValueBaseCcy, ... } ]
        allUnitTrusts = allUnitTrusts.concat(bp.unitTrusts);
      } else if (bp.unitTrusts?.investment?.accounts) {
        // DBS: { investment: { accounts: [ { marketValue: { displayBalance } } ] } }
        const dbsUTs = bp.unitTrusts.investment.accounts
          .filter(a => (a.marketValue?.displayBalance || 0) > 0)
          .map(a => ({
            fundName: a.productCodeDescription || a.accountNickname || 'Unit Trust',
            fundCode: a.investmentId,
            marketValueBaseCcy: a.marketValue?.displayBalance || 0,
          }));
        allUnitTrusts = allUnitTrusts.concat(dbsUTs);
      }

      // ── Cash ─────────────────────────────────────────────────────────────
      // SC: { balance, recentTransactions, dividendIncome }
      if (bp.cash) {
        totalCash        += bp.cash.balance || 0;
        cashTransactions  = cashTransactions.concat(bp.cash.recentTransactions || []);
        dividendIncome   += bp.cash.dividendIncome || 0;
      }
      // UOB / OCBC / DBS: { casa: { accounts: [ { availableBalance: { displayBalance } } ] } }
      if (bp.casa?.accounts) {
        bp.casa.accounts.forEach(acct => {
          totalCash += acct.availableBalance?.displayBalance || 0;
        });
      }

      // ── Fixed Deposits ───────────────────────────────────────────────────
      if (bp.fixedDeposits?.fixedDeposit?.accounts) {
        allFixedDeposits = allFixedDeposits.concat(bp.fixedDeposits.fixedDeposit.accounts);
      }

      // ── CPF (SC only) ────────────────────────────────────────────────────
      if (bp.cpf) cpfData = bp.cpf;

      // ── SRS — normalize different bank formats into a common shape ───────
      if (bp.srs) {
        if (bp.srs.totalBalance !== undefined) {
          // SC format: { totalBalance, annualContribution, taxSavings, investments[] }
          allSrsAccounts.push({
            bank: bankCode,
            totalBalance: bp.srs.totalBalance,
            annualContribution: bp.srs.annualContribution,
            taxSavings: bp.srs.taxSavings,
            investments: bp.srs.investments || [],
          });
        } else if (bp.srs.investment?.accounts) {
          // DBS format: { investment: { accounts: [ { totalPortFolioValue: { displayBalance } } ] } }
          const acct = bp.srs.investment.accounts[0];
          const investments = [];
          // Pull DBS SRS holdings from the companion SRS-Unit-Trusts file
          if (bp.srsUnitTrusts?.SRSDetails) {
            bp.srsUnitTrusts.SRSDetails.forEach(detail => {
              detail.holdings
                .filter(h => parseFloat(h.marketVal?.value || 0) > 0)
                .forEach(h => investments.push({
                  holding: h.productName,
                  value: parseFloat(h.marketVal.value),
                }));
            });
          }
          allSrsAccounts.push({
            bank: bankCode,
            totalBalance: acct?.totalPortFolioValue?.displayBalance || 0,
            annualContribution: null,
            taxSavings: null,
            investments,
          });
        }
      }
    });

    // ── totals ───────────────────────────────────────────────────────────────
    const stocksTotal = allStocks.reduce((sum, s) => sum + (s.amt || s.marketValueBaseCcy || 0), 0);
    const unitTrustsTotal = allUnitTrusts.reduce((sum, u) => sum + (u.marketValueBaseCcy || 0), 0);
    const fixedDepositsTotal = allFixedDeposits.reduce(
      (sum, fd) => sum + (fd.principalBalance?.displayBalance || 0), 0
    );
    const totalValue = stocksTotal + unitTrustsTotal + totalCash + fixedDepositsTotal;

    // ── performance ──────────────────────────────────────────────────────────
    const history = performanceData.history || [];
    const totalChange = history.length >= 2
      ? (((history[history.length - 1].value - history[0].value) / history[0].value) * 100).toFixed(1)
      : 0;
    const stocksChange     = performanceData.monthlyChanges?.stocks    ?? 0;
    const unitTrustsChange = performanceData.monthlyChanges?.unitTrusts ?? 0;

    // ── derived display data ─────────────────────────────────────────────────
    const topStocks = allStocks
      .map(s => ({ name: s.name || s.code, code: s.code, value: s.amt || s.marketValueBaseCcy || 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    const topUnitTrusts = allUnitTrusts
      .map(u => ({ name: u.fundName || u.fundCode, value: u.marketValueBaseCcy || 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 2);

    const lineChartData = {
      labels: history.map(h => h.label),
      data:   history.map(h => h.value),
    };

    const allocationData = {
      labels: ['Stocks', 'Unit Trusts', 'Cash', 'Fixed Deposits'],
      datasets: [{
        data: [stocksTotal, unitTrustsTotal, totalCash, fixedDepositsTotal],
        backgroundColor: ['#4A90E2', '#50C878', '#FFD700', '#FF6B6B'],
        borderColor:     ['#4A90E2', '#50C878', '#FFD700', '#FF6B6B'],
        borderWidth: 1
      }]
    };

    setPortfolioData({
      allStocks,
      totalValue,
      stocksTotal,
      unitTrustsTotal,
      cashBalance: totalCash,
      fixedDepositsTotal,
      stocksChange,
      unitTrustsChange,
      totalChange,
      topStocks,
      topUnitTrusts,
      allFixedDeposits,
      lineChartData,
      allocationData,
      cashTransactions,
      dividendIncome,
      cpf: cpfData || { accounts: [], total: 0 },
      allSrsAccounts,
      news: newsData.items || [],
    });

    setLoading(false);
  }, []);

  // ── data loading ──────────────────────────────────────────────────────────
  const applyPortfolios = useCallback((banksData, bankPortfolios, usedMock) => {
    setBanks(banksData);
    setIsMock(usedMock);
    const allPerformance = Object.values(bankPortfolios).find(bp => bp.performance)?.performance
      ?? { history: [], monthlyChanges: { stocks: 0, unitTrusts: 0 } };
    const allNews = Object.values(bankPortfolios).find(bp => bp.news)?.news
      ?? { items: [] };
    rawData.current = { bankPortfolios, allPerformance, allNews };
    processData(bankPortfolios, allPerformance, allNews);
  }, [processData]);

  const loadData = useCallback(async () => {
    setLoading(true);

    // Force mock mode (flip MOCK_MODE = true at the top of this file to enable)
    if (DEV_MODE) {
      applyPortfolios(mockBanks, mockBankPortfolios, true);
      return;
    }

    try {
      await keycloak.updateToken(30);
      const headers = { Authorization: `Bearer ${keycloak.token}` };

      // 1. Fetch bank list
      const banksRes = await fetch('/api/banks', { headers });
      if (!banksRes.ok) throw new Error(`Failed to load banks: ${banksRes.status}`);
      const banksData = await banksRes.json();

      const availableBanks = banksData.filter(b => b.available);

      // 2. Fetch all available bank portfolios in parallel
      const portfolioResults = await Promise.all(
        availableBanks.map(b =>
          fetch(`/api/banks/${b.code}/portfolio`, { headers })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      );

      // Build map: { SC: {...}, UOB: {...}, ... }
      const bankPortfolios = {};
      availableBanks.forEach((b, i) => {
        if (portfolioResults[i]) bankPortfolios[b.code] = portfolioResults[i];
      });

      applyPortfolios(banksData, bankPortfolios, false);
    } catch (error) {
      console.warn('API unavailable — falling back to mock data:', error.message);
      applyPortfolios(mockBanks, mockBankPortfolios, true);
    }
  }, [applyPortfolios]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── bank filter ───────────────────────────────────────────────────────────
  const handleBankSelect = useCallback((bankCode) => {
    const { bankPortfolios, allPerformance, allNews } = rawData.current;

    // Toggle: clicking the active bank returns to "All"
    const next = bankCode === selectedBank ? null : bankCode;
    setSelectedBank(next);

    if (next === null) {
      // Show all banks
      processData(bankPortfolios, allPerformance, allNews);
    } else {
      // Show only the selected bank's portfolio
      const filtered = { [next]: bankPortfolios[next] };
      // Use the selected bank's own performance/news when available, else empty
      const perf = bankPortfolios[next]?.performance
        ?? { history: [], monthlyChanges: { stocks: 0, unitTrusts: 0 } };
      const news = bankPortfolios[next]?.news ?? { items: [] };
      processData(filtered, perf, news);
    }
  }, [selectedBank, processData]);

  // ── chat ──────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatLoading(true);
    try {
      await keycloak.updateToken(30);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${keycloak.token}` },
        body: JSON.stringify({ message: userText })
      });
      if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I could not process your request. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, keycloak]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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

  // ── chart configs ─────────────────────────────────────────────────────────
  const lineChartDataset = {
    labels: portfolioData.lineChartData.labels,
    datasets: [{
      label: 'Portfolio Value',
      data: portfolioData.lineChartData.data,
      borderColor: '#4A90E2',
      backgroundColor: 'rgba(74, 144, 226, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 5
    }]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: { label: ctx => formatCurrency(ctx.parsed.y) }
      }
    },
    scales: {
      y: { beginAtZero: false, ticks: { callback: v => formatCurrency(v) } },
      x: { grid: { display: false } }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { usePointStyle: true, padding: 15, font: { size: 12 } }
      },
      tooltip: {
        callbacks: {
          label: ctx => {
            const pct = ((ctx.parsed / portfolioData.totalValue) * 100).toFixed(0);
            return `${ctx.label}: ${formatCurrency(ctx.parsed)} (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="App" style={{ minHeight: '100vh', position: 'relative' }}>

      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Wealth Dashboard</h1>
        </div>
        <nav className="header-nav">
          {['Portfolio Overview', 'Performance', 'Allocation', 'Reports', 'Watchlist'].map(tab => (
            <button
              key={tab}
              className={selectedTab === tab ? 'nav-tab active' : 'nav-tab'}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="header-right">
          {keycloak?.authenticated && (
            <>
              <span className="header-username">
                {keycloak.tokenParsed?.preferred_username || 'User'}
              </span>
              <button className="header-icon" title="Logout" onClick={() => keycloak.logout()}>⎋</button>
            </>
          )}
          <button className="header-icon" title="Notifications">□</button>
          <button className="header-icon" title="Profile">👤</button>
          <button className="header-icon" title="Help">?</button>
        </div>
      </header>

      <div className="dashboard-content">

        {/* ── Watchlist Tab ── */}
        {selectedTab === 'Watchlist' && (
          <div className="watchlist-container">
            <h2 className="section-title">My Stock Watchlist</h2>

            {/* Add stock form */}
            <div className="watchlist-add-bar">
              <input
                className="watchlist-input"
                value={watchlistInput}
                onChange={e => setWatchlistInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addToWatchlist(watchlistInput, '')}
                placeholder="Enter stock symbol (e.g. AAPL, TSLA)"
              />
              <button
                className="watchlist-add-btn"
                onClick={() => addToWatchlist(watchlistInput, '')}
                disabled={!watchlistInput.trim()}
              >
                + Add to Watchlist
              </button>
            </div>

            {/* Watchlist table */}
            <div className="info-card watchlist-card">
              <h3>Watched Stocks ({watchlist.length})</h3>
              {watchlist.length === 0 ? (
                <div className="watchlist-empty">
                  No stocks in your watchlist yet. Add a stock symbol above or click <strong>+</strong> on a portfolio holding below.
                </div>
              ) : (
                <table className="holdings-table watchlist-table">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Name</th>
                      <th>Added</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchlist.map((item) => (
                      <tr key={item.symbol}>
                        <td><span className="watchlist-symbol">{item.symbol}</span></td>
                        <td>{item.name}</td>
                        <td className="watchlist-date">{item.addedAt}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="watchlist-remove-btn"
                            onClick={() => removeFromWatchlist(item.symbol)}
                            title="Remove from watchlist"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Portfolio holdings quick-add */}
            {portfolioData.allStocks.length > 0 && (
              <div className="info-card watchlist-card" style={{ marginTop: '20px' }}>
                <h3>Your Portfolio Holdings</h3>
                <p className="watchlist-hint">Click <strong>+</strong> to add a holding to your watchlist.</p>
                <table className="holdings-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Symbol</th>
                      <th>Name</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioData.allStocks.map((s, i) => {
                      const alreadyWatched = watchlist.some(w => w.symbol === (s.code || '').toUpperCase());
                      return (
                        <tr key={i}>
                          <td style={{ width: '40px' }}>
                            <button
                              className={`watchlist-quick-add${alreadyWatched ? ' watched' : ''}`}
                              onClick={() => !alreadyWatched && addToWatchlist(s.code, s.name)}
                              disabled={alreadyWatched}
                              title={alreadyWatched ? 'Already in watchlist' : 'Add to watchlist'}
                            >
                              {alreadyWatched ? '✓' : '+'}
                            </button>
                          </td>
                          <td><span className="watchlist-symbol">{s.code}</span></td>
                          <td>{s.name}</td>
                          <td>{formatCurrency(s.amt || s.marketValueBaseCcy || 0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {selectedTab !== 'Watchlist' && (<>

        {/* ── Mock data banner ── */}
        {isMock && (
          <div className="mock-banner">
            ⚠ Mock data — backend API is unreachable. Set <code>MOCK_MODE = false</code> or start the backend to use live data.
          </div>
        )}

        {/* ── Connected Banks ── */}
        {banks.length > 0 && (
          <div className="connected-banks">
            <span className="connected-banks-label">Connected Banks</span>

            {/* "All Banks" pill */}
            <button
              className={`bank-chip available${selectedBank === null ? ' selected' : ''}`}
              style={{
                borderColor: '#1E3A5F',
                background: selectedBank === null ? '#1E3A5F' : 'white',
              }}
              onClick={() => selectedBank !== null && handleBankSelect(selectedBank)}
            >
              <span className="bank-chip-dot" style={{ background: selectedBank === null ? 'rgba(255,255,255,0.7)' : '#1E3A5F' }} />
              All Banks
            </button>

            {banks.map(bank => {
              const isSelected = selectedBank === bank.code;
              return (
                <button
                  key={bank.code}
                  className={`bank-chip ${bank.available ? 'available' : 'unavailable'}${isSelected ? ' selected' : ''}`}
                  style={{
                    borderColor: bank.available ? bank.color : '#ddd',
                    background: isSelected ? bank.color : undefined,
                  }}
                  onClick={() => bank.available && handleBankSelect(bank.code)}
                  disabled={!bank.available}
                >
                  <span
                    className="bank-chip-dot"
                    style={{ background: isSelected ? 'rgba(255,255,255,0.7)' : (bank.available ? bank.color : '#ccc') }}
                  />
                  {bank.name}
                  {!bank.available && <span className="bank-chip-soon">Coming soon</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Key Metrics (5 cards) ── */}
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
          <div className="metric-card">
            <div className="metric-label">Fixed Deposits</div>
            <div className="metric-value">{formatCurrency(portfolioData.fixedDepositsTotal)}</div>
          </div>
        </div>

        {/* ── Charts ── */}
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Portfolio Performance</h3>
              <div className="timeframe-selector">
                {['1M', '3M', '6M', '1Y', 'All'].map(tf => (
                  <button
                    key={tf}
                    className={selectedTimeframe === tf ? 'timeframe-btn active' : 'timeframe-btn'}
                    onClick={() => setSelectedTimeframe(tf)}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div className="line-chart-container">
              <Line data={lineChartDataset} options={lineChartOptions} />
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header"><h3>Asset Allocation</h3></div>
            <div className="pie-chart-container">
              <Pie data={portfolioData.allocationData} options={pieChartOptions} />
            </div>
          </div>
        </div>

        {/* ── Bottom Grid ── */}
        <div className="bottom-grid">
          {/* Top Stock Holdings (all banks) */}
          <div className="info-card">
            <h3>Top Stock Holdings</h3>
            <table className="holdings-table">
              <thead>
                <tr><th>Stock</th><th>Value</th><th>Change</th></tr>
              </thead>
              <tbody>
                {portfolioData.topStocks.map((s, i) => (
                  <tr key={i}>
                    <td>{s.name}</td>
                    <td>{formatCurrency(s.value)}</td>
                    <td className="change positive">▲{portfolioData.stocksChange}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cash Balance (all banks aggregated) */}
          <div className="info-card">
            <h3>Cash Balance</h3>
            <div className="cash-value">{formatCurrency(portfolioData.cashBalance)}</div>
            <div className="cash-details">
              {portfolioData.cashTransactions.length > 0 && (
                <div className="cash-section">
                  <div className="cash-label">Recent Transactions</div>
                  {portfolioData.cashTransactions.map((tx, i) => (
                    <div key={i} className="cash-item">{tx.date} {formatCurrency(tx.amount)}</div>
                  ))}
                </div>
              )}
              <div className="cash-section">
                <div className="cash-label">Dividend Income</div>
                <div className="cash-item">{formatCurrency(portfolioData.dividendIncome)}</div>
              </div>
            </div>
          </div>

          {/* Unit Trust Investments (all banks) */}
          <div className="info-card">
            <h3>Unit Trust Investments</h3>
            <table className="holdings-table">
              <thead>
                <tr><th>Fund</th><th>Value</th></tr>
              </thead>
              <tbody>
                {portfolioData.topUnitTrusts.map((f, i) => (
                  <tr key={i}>
                    <td>{f.name}</td>
                    <td>{formatCurrency(f.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fixed Deposits (UOB + OCBC) */}
          <div className="info-card">
            <h3>Fixed Deposits</h3>
            <table className="holdings-table">
              <thead>
                <tr><th>Account</th><th>Principal</th><th>Rate</th><th>Maturity</th></tr>
              </thead>
              <tbody>
                {portfolioData.allFixedDeposits.map((fd, i) => (
                  <tr key={i}>
                    <td>{fd.accountNickname || fd.displayAccountNumber}</td>
                    <td>{formatCurrency(fd.principalBalance?.displayBalance || 0)}</td>
                    <td className="change positive">{fd.interestRate}% p.a.</td>
                    <td>{fd.maturityDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── CPF & SRS ── */}
        <div className="cpf-srs-section">
          <h2 className="section-title">CPF & SRS</h2>
          <div className="cpf-srs-grid">
            <div className="info-card cpf-card">
              <h3>CPF Accounts</h3>
              <table className="holdings-table">
                <thead>
                  <tr><th>Account</th><th>Balance</th><th>Interest Rate</th></tr>
                </thead>
                <tbody>
                  {portfolioData.cpf.accounts.map((acct, i) => (
                    <tr key={i}>
                      <td>{acct.type}</td>
                      <td>{formatCurrency(acct.balance)}</td>
                      <td className="change positive">{acct.interestRate}% p.a.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="cpf-total-row">
                <span>Total CPF</span>
                <span className="cpf-total-value">{formatCurrency(portfolioData.cpf.total)}</span>
              </div>
            </div>

            {portfolioData.allSrsAccounts.map((srs, idx) => (
              <div key={idx} className="info-card srs-card">
                <h3>SRS Account <span style={{ fontSize: '13px', color: '#888', fontWeight: 400 }}>({srs.bank})</span></h3>
                <div className="srs-balance-row">
                  <div className="srs-balance-block">
                    <div className="srs-label">Total Balance</div>
                    <div className="srs-value">{formatCurrency(srs.totalBalance)}</div>
                  </div>
                  {srs.annualContribution !== null && (
                    <div className="srs-balance-block">
                      <div className="srs-label">Annual Contribution</div>
                      <div className="srs-value">{formatCurrency(srs.annualContribution)}</div>
                    </div>
                  )}
                  {srs.taxSavings !== null && (
                    <div className="srs-balance-block">
                      <div className="srs-label">Tax Savings (Est.)</div>
                      <div className="srs-value positive-text">{formatCurrency(srs.taxSavings)}</div>
                    </div>
                  )}
                </div>
                {srs.investments.length > 0 && (
                  <div className="srs-investments">
                    <div className="srs-inv-label">SRS Investments</div>
                    <table className="holdings-table">
                      <thead>
                        <tr><th>Holding</th><th>Value</th></tr>
                      </thead>
                      <tbody>
                        {srs.investments.map((inv, i) => (
                          <tr key={i}>
                            <td>{inv.holding}</td>
                            <td>{formatCurrency(inv.value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── News ── */}
        {portfolioData.news.length > 0 && (
          <div className="cpf-srs-section">
            <h2 className="section-title">Recent News & Insights</h2>
            <div className="info-card">
              <ul className="news-list">
                {portfolioData.news.map((item, i) => (
                  <li key={i}>{item.title}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        </>)}

      </div>

      {/* ── Chat FAB ── */}
      <button className="chat-fab" onClick={() => setChatOpen(o => !o)} title="Ask your portfolio assistant">
        {chatOpen ? '✕' : '💬'}
      </button>

      {/* ── Chat Drawer ── */}
      {chatOpen && (
        <div className="chat-drawer">
          <div className="chat-drawer-header"><span>Portfolio Assistant</span></div>
          <div className="chat-messages">
            {chatMessages.length === 0 && (
              <div className="chat-empty">
                Ask me anything about your portfolio — holdings, P&amp;L, allocation, or fund details.
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-bubble chat-bubble--${msg.role}`}>{msg.text}</div>
            ))}
            {chatLoading && (
              <div className="chat-bubble chat-bubble--assistant chat-thinking">
                <span className="chat-dot" /><span className="chat-dot" /><span className="chat-dot" />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-row">
            <input
              className="chat-input"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about your portfolio..."
              disabled={chatLoading}
            />
            <button className="chat-send" onClick={sendMessage} disabled={chatLoading || !chatInput.trim()}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
