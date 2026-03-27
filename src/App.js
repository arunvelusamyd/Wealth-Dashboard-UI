import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { mockBanks, mockBankPortfolios } from './mocks/mockData';
import { DEV_MODE } from './config/devConfig';
import PortfolioOverview from './components/PortfolioOverview';
import WatchlistTab from './components/WatchlistTab';
import SubscriptionsTab from './components/SubscriptionsTab';
import FundamentalsTab from './components/FundamentalsTab';
import ChatDrawer from './components/ChatDrawer';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

// Filter out subtotal / grand-total rows that appear inside Stocks.json arrays
const validStocks = (items) =>
  (items || []).filter(item => item.code && item.name);

const TABS = ['Portfolio Overview', 'Watchlist', 'Subscriptions', 'Fundamentals'];

function App({ keycloak }) {
  const [loading, setLoading]             = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);
  const [banks, setBanks]                 = useState([]);
  const [selectedBanks, setSelectedBanks] = useState([]); // empty = All Banks
  const selectedBanksRef = useRef([]);
  const [isMock, setIsMock]               = useState(false);
  const [selectedTab, setSelectedTab]     = useState('Portfolio Overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');

  // Cache raw fetched data so bank switching never triggers a network call
  const rawData = useRef({ bankPortfolios: {}, allPerformance: null, allNews: null });

  // ── aggregate raw per-bank payloads into a single portfolio object ──────────
  const processData = useCallback((bankPortfolios, performanceData, newsData) => {
    let allStocks        = [];
    let allUnitTrusts    = [];
    let totalCash        = 0;
    let cashTransactions = [];
    let dividendIncome   = 0;
    let allFixedDeposits = [];
    let cpfData          = null;
    const allSrsAccounts = [];

    Object.entries(bankPortfolios).forEach(([bankCode, bp]) => {
      if (bp.stocks?.data) {
        allStocks = allStocks.concat(validStocks(bp.stocks.data));
      }

      if (Array.isArray(bp.unitTrusts)) {
        allUnitTrusts = allUnitTrusts.concat(bp.unitTrusts);
      } else if (bp.unitTrusts?.investment?.accounts) {
        const dbsUTs = bp.unitTrusts.investment.accounts
          .filter(a => (a.marketValue?.displayBalance || 0) > 0)
          .map(a => ({
            fundName: a.productCodeDescription || a.accountNickname || 'Unit Trust',
            fundCode: a.investmentId,
            marketValueBaseCcy: a.marketValue?.displayBalance || 0,
          }));
        allUnitTrusts = allUnitTrusts.concat(dbsUTs);
      }

      if (bp.cash) {
        totalCash        += bp.cash.balance || 0;
        cashTransactions  = cashTransactions.concat(bp.cash.recentTransactions || []);
        dividendIncome   += bp.cash.dividendIncome || 0;
      }
      if (bp.casa?.accounts) {
        bp.casa.accounts.forEach(acct => {
          totalCash += acct.availableBalance?.displayBalance || 0;
        });
      }

      if (bp.fixedDeposits?.fixedDeposit?.accounts) {
        allFixedDeposits = allFixedDeposits.concat(bp.fixedDeposits.fixedDeposit.accounts);
      }

      if (bp.cpf) cpfData = bp.cpf;

      if (bp.srs) {
        if (bp.srs.totalBalance !== undefined) {
          allSrsAccounts.push({
            bank: bankCode,
            totalBalance: bp.srs.totalBalance,
            annualContribution: bp.srs.annualContribution,
            taxSavings: bp.srs.taxSavings,
            investments: bp.srs.investments || [],
          });
        } else if (bp.srs.investment?.accounts) {
          const acct = bp.srs.investment.accounts[0];
          const investments = [];
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

    const stocksTotal        = allStocks.reduce((sum, s) => sum + (s.amt || s.marketValueBaseCcy || 0), 0);
    const unitTrustsTotal    = allUnitTrusts.reduce((sum, u) => sum + (u.marketValueBaseCcy || 0), 0);
    const fixedDepositsTotal = allFixedDeposits.reduce(
      (sum, fd) => sum + (fd.principalBalance?.displayBalance || 0), 0
    );
    const totalValue = stocksTotal + unitTrustsTotal + totalCash + fixedDepositsTotal;

    const history    = performanceData.history || [];
    const totalChange = history.length >= 2
      ? (((history[history.length - 1].value - history[0].value) / history[0].value) * 100).toFixed(1)
      : 0;
    const stocksChange     = performanceData.monthlyChanges?.stocks    ?? 0;
    const unitTrustsChange = performanceData.monthlyChanges?.unitTrusts ?? 0;

    const topStocks = allStocks
      .map(s => ({ name: s.name || s.code, code: s.code, value: s.amt || s.marketValueBaseCcy || 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    const topUnitTrusts = allUnitTrusts
      .map(u => ({ name: u.fundName || u.fundCode, value: u.marketValueBaseCcy || 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 2);

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
      lineChartData: { labels: history.map(h => h.label), data: history.map(h => h.value) },
      allocationData: {
        labels: ['Stocks', 'Unit Trusts', 'Cash', 'Fixed Deposits'],
        datasets: [{
          data: [stocksTotal, unitTrustsTotal, totalCash, fixedDepositsTotal],
          backgroundColor: ['#4A90E2', '#50C878', '#FFD700', '#FF6B6B'],
          borderColor:     ['#4A90E2', '#50C878', '#FFD700', '#FF6B6B'],
          borderWidth: 1,
        }],
      },
      cashTransactions,
      dividendIncome,
      cpf: cpfData || { accounts: [], total: 0 },
      allSrsAccounts,
      news: newsData.items || [],
    });

    setLoading(false);
  }, []);

  const applyPortfolios = useCallback((banksData, bankPortfolios, usedMock) => {
    setBanks(banksData);
    setIsMock(usedMock);
    const allPerformance = Object.values(bankPortfolios).find(bp => bp.performance)?.performance
      ?? { history: [], monthlyChanges: { stocks: 0, unitTrusts: 0 } };
    const allNews = Object.values(bankPortfolios).find(bp => bp.news)?.news ?? { items: [] };
    rawData.current = { bankPortfolios, allPerformance, allNews };
    processData(bankPortfolios, allPerformance, allNews);
  }, [processData]);

  const loadData = useCallback(async () => {
    setLoading(true);
    if (DEV_MODE) {
      applyPortfolios(mockBanks, mockBankPortfolios, true);
      return;
    }
    try {
      await keycloak.updateToken(30);
      const headers = { Authorization: `Bearer ${keycloak.token}` };
      const banksRes = await fetch('/api/banks', { headers });
      if (!banksRes.ok) throw new Error(`Failed to load banks: ${banksRes.status}`);
      const banksData = await banksRes.json();
      const availableBanks = banksData.filter(b => b.available);
      const portfolioResults = await Promise.all(
        availableBanks.map(b =>
          fetch(`/api/banks/${b.code}/portfolio`, { headers })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      );
      const bankPortfolios = {};
      availableBanks.forEach((b, i) => {
        if (portfolioResults[i]) bankPortfolios[b.code] = portfolioResults[i];
      });
      applyPortfolios(banksData, bankPortfolios, false);
    } catch (error) {
      console.warn('API unavailable — falling back to mock data:', error.message);
      applyPortfolios(mockBanks, mockBankPortfolios, true);
    }
  }, [applyPortfolios, keycloak]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleBankSelect = useCallback((bankCode) => {
    const { bankPortfolios, allPerformance, allNews } = rawData.current;
    const prev = selectedBanksRef.current;
    const next = prev.includes(bankCode)
      ? prev.filter(b => b !== bankCode)
      : [...prev, bankCode];
    selectedBanksRef.current = next;
    setSelectedBanks(next);

    if (next.length === 0) {
      processData(bankPortfolios, allPerformance, allNews);
    } else {
      const filtered = Object.fromEntries(
        next.filter(c => bankPortfolios[c]).map(c => [c, bankPortfolios[c]])
      );
      const perf = Object.values(filtered).find(bp => bp.performance)?.performance
        ?? { history: [], monthlyChanges: { stocks: 0, unitTrusts: 0 } };
      const news = Object.values(filtered).find(bp => bp.news)?.news ?? { items: [] };
      processData(filtered, perf, news);
    }
  }, [processData]);

  const handleSelectAllBanks = useCallback(() => {
    const { bankPortfolios, allPerformance, allNews } = rawData.current;
    selectedBanksRef.current = [];
    setSelectedBanks([]);
    processData(bankPortfolios, allPerformance, allNews);
  }, [processData]);

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

  return (
    <div className="App" style={{ minHeight: '100vh', position: 'relative' }}>

      <header className="dashboard-header">
        <div className="header-left">
          <h1>Wealth Dashboard</h1>
        </div>
        <nav className="header-nav">
          {TABS.map(tab => (
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
        {selectedTab === 'Watchlist' && (
          <WatchlistTab allStocks={portfolioData.allStocks} />
        )}
        {selectedTab === 'Subscriptions' && (
          <SubscriptionsTab />
        )}
        {selectedTab === 'Fundamentals' && (
          <FundamentalsTab />
        )}
        {selectedTab !== 'Watchlist' && selectedTab !== 'Subscriptions' && selectedTab !== 'Fundamentals' && (
          <PortfolioOverview
            portfolioData={portfolioData}
            banks={banks}
            selectedBanks={selectedBanks}
            handleBankSelect={handleBankSelect}
            handleSelectAllBanks={handleSelectAllBanks}
            isMock={isMock}
            selectedTimeframe={selectedTimeframe}
            setSelectedTimeframe={setSelectedTimeframe}
          />
        )}
      </div>

      <ChatDrawer keycloak={keycloak} selectedTab={selectedTab} />
    </div>
  );
}

export default App;
