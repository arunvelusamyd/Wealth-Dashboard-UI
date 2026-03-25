import React, { useState, useRef, useEffect } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { formatCurrency } from '../utils/formatCurrency';

export default function PortfolioOverview({
  portfolioData,
  banks,
  selectedBanks,
  handleBankSelect,
  handleSelectAllBanks,
  isMock,
  selectedTimeframe,
  setSelectedTimeframe,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedLabel = selectedBanks.length === 0
    ? 'All Banks'
    : banks.filter(b => selectedBanks.includes(b.code)).map(b => b.name).join(', ');
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
      pointHoverRadius: 5,
    }],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: { label: ctx => formatCurrency(ctx.parsed.y) },
      },
    },
    scales: {
      y: { beginAtZero: false, ticks: { callback: v => formatCurrency(v) } },
      x: { grid: { display: false } },
    },
  };

  const isMobile = window.innerWidth <= 768;

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'right',
        labels: { usePointStyle: true, padding: isMobile ? 10 : 15, font: { size: isMobile ? 11 : 12 } },
      },
      tooltip: {
        callbacks: {
          label: ctx => {
            const pct = ((ctx.parsed / portfolioData.totalValue) * 100).toFixed(0);
            return `${ctx.label}: ${formatCurrency(ctx.parsed)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <>
      {isMock && (
        <div className="mock-banner">
          ⚠ Mock data — backend API is unreachable. Set <code>DEV_MODE = false</code> in devConfig.js to use live data.
        </div>
      )}

      {banks.length > 0 && (
        <>
          {/* Desktop: chip buttons */}
          <div className="connected-banks connected-banks--desktop">
            <span className="connected-banks-label">Connected Banks</span>
            <button
              className={`bank-chip available${selectedBanks.length === 0 ? ' selected' : ''}`}
              style={{
                borderColor: '#1E3A5F',
                background: selectedBanks.length === 0 ? '#1E3A5F' : 'white',
              }}
              onClick={handleSelectAllBanks}
            >
              <span className="bank-chip-dot" style={{ background: selectedBanks.length === 0 ? 'rgba(255,255,255,0.7)' : '#1E3A5F' }} />
              All Banks
            </button>
            {banks.map(bank => {
              const isSelected = selectedBanks.includes(bank.code);
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

          {/* Mobile: custom multi-select dropdown */}
          <div className="connected-banks--mobile" ref={dropdownRef}>
            <span className="connected-banks-label">Connected Banks</span>
            <button
              className="bank-multiselect-trigger"
              onClick={() => setDropdownOpen(o => !o)}
            >
              <span className="bank-multiselect-label">{selectedLabel}</span>
              <span className={`bank-multiselect-arrow${dropdownOpen ? ' open' : ''}`}>▾</span>
            </button>
            {dropdownOpen && (
              <div className="bank-multiselect-menu">
                {/* All Banks option */}
                <label className="bank-multiselect-option">
                  <input
                    type="checkbox"
                    checked={selectedBanks.length === 0}
                    onChange={() => { handleSelectAllBanks(); setDropdownOpen(false); }}
                  />
                  <span className="bank-multiselect-dot" style={{ background: '#1E3A5F' }} />
                  All Banks
                </label>
                {banks.map(bank => (
                  <label
                    key={bank.code}
                    className={`bank-multiselect-option${!bank.available ? ' disabled' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBanks.includes(bank.code)}
                      disabled={!bank.available}
                      onChange={() => bank.available && handleBankSelect(bank.code)}
                    />
                    <span className="bank-multiselect-dot" style={{ background: bank.available ? bank.color : '#ccc' }} />
                    {bank.name}
                    {!bank.available && <span className="bank-chip-soon">Coming soon</span>}
                  </label>
                ))}
              </div>
            )}
          </div>
        </>
      )}

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

      <div className="bottom-grid">
        <div className="info-card">
          <h3>Top Stock Holdings</h3>
          <table className="holdings-table">
            <thead><tr><th>Stock</th><th>Value</th><th>Change</th></tr></thead>
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

        <div className="info-card">
          <h3>Unit Trust Investments</h3>
          <table className="holdings-table">
            <thead><tr><th>Fund</th><th>Value</th></tr></thead>
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

        <div className="info-card">
          <h3>Fixed Deposits</h3>
          <table className="holdings-table fd-table">
            <thead><tr><th>Account</th><th>Principal</th><th>Rate</th><th className="fd-col-maturity">Maturity</th></tr></thead>
            <tbody>
              {portfolioData.allFixedDeposits.map((fd, i) => (
                <tr key={i}>
                  <td>{fd.accountNickname || fd.displayAccountNumber}</td>
                  <td>{formatCurrency(fd.principalBalance?.displayBalance || 0)}</td>
                  <td className="change positive">{fd.interestRate}% p.a.</td>
                  <td className="fd-col-maturity">{fd.maturityDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cpf-srs-section">
        <h2 className="section-title">CPF & SRS</h2>
        <div className="cpf-srs-grid">
          <div className="info-card cpf-card">
            <h3>CPF Accounts</h3>
            <table className="holdings-table">
              <thead><tr><th>Account</th><th>Balance</th><th>Interest Rate</th></tr></thead>
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
                    <thead><tr><th>Holding</th><th>Value</th></tr></thead>
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
    </>
  );
}
