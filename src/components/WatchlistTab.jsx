import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Client } from '@stomp/stompjs';
import { DEV_MODE, WS_URL } from '../config/devConfig';
import { mockTickerSearch, getMockPrice, getMockHistory } from '../mocks/mockData';
import { formatCurrency } from '../utils/formatCurrency';

// ── Stock history modal ───────────────────────────────────────────────────────

const TIMEFRAMES = ['5D', '1M', 'YTD', '1Y', '5Y'];

function StockHistoryModal({ symbol, name, priceData, onClose }) {
  const [period,  setPeriod]  = useState('YTD');
  const [view,    setView]    = useState('chart');   // 'chart' | 'table'
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setHistory(null);

    if (DEV_MODE) {
      const timer = setTimeout(() => {
        setHistory(getMockHistory(symbol, period));
        setLoading(false);
      }, 250);
      return () => clearTimeout(timer);
    }

    fetch(`/api/stocks/${encodeURIComponent(symbol)}/history?period=${period}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => { setHistory(data); setLoading(false); })
      .catch(() => { setError('Could not load price history. Please try again.'); setLoading(false); });
  }, [symbol, period]);

  const isUp = history ? history.changeAmount >= 0 : true;
  const lineColor = isUp ? '#27ae60' : '#e74c3c';
  const fillColor = isUp ? 'rgba(39,174,96,0.08)' : 'rgba(231,76,60,0.08)';

  const chartData = history ? {
    labels: history.labels,
    datasets: [{
      data: history.prices,
      borderColor: lineColor,
      backgroundColor: fillColor,
      fill: true,
      tension: 0.3,
      pointRadius: period === '5D' ? 4 : 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: lineColor,
      borderWidth: 2,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `$${ctx.parsed.y.toFixed(2)}`,
        },
        backgroundColor: '#1a1a2e',
        titleColor: '#ccc',
        bodyColor: '#fff',
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#999',
          font: { size: 11 },
          maxTicksLimit: period === '5D' ? 5 : 7,
          maxRotation: 0,
        },
        border: { display: false },
      },
      y: {
        position: 'right',
        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
        ticks: {
          color: '#999',
          font: { size: 11 },
          callback: v => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toFixed(0)}`,
        },
        border: { display: false },
      },
    },
    interaction: { mode: 'index', intersect: false },
  };

  return (
    <div className="modal-overlay wl-history-overlay" onClick={onClose}>
      <div className="wl-history-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="wl-history-header">
          <div>
            <span className="wl-history-symbol">{symbol}</span>
            <span className="wl-history-name">{name}</span>
          </div>
          <button className="wl-history-close" onClick={onClose}>✕</button>
        </div>

        {/* Current price row */}
        {priceData?.currentPrice != null && (
          <div className="wl-history-price-row">
            <span className="wl-history-price">${priceData.currentPrice.toFixed(2)}</span>
            {priceData.change != null && (
              <span className={`wl-history-live-change ${priceData.change >= 0 ? 'wl-change--up' : 'wl-change--down'}`}>
                {priceData.change >= 0 ? '+' : ''}{priceData.change.toFixed(2)}
                &nbsp;({priceData.change >= 0 ? '+' : ''}{priceData.percentChange?.toFixed(2)}%)
              </span>
            )}
            {priceData.live && <span className="wl-live-dot" title="Live price" />}
          </div>
        )}

        {/* Period change summary */}
        {history && (
          <div className={`wl-history-period-change ${isUp ? 'wl-change--up' : 'wl-change--down'}`}>
            {isUp ? '▲' : '▼'}&nbsp;
            {isUp ? '+' : ''}{history.changeAmount.toFixed(2)}
            &nbsp;({isUp ? '+' : ''}{history.changePercent.toFixed(2)}%)
            &nbsp;over selected period
          </div>
        )}

        {/* Controls row: timeframe + view toggle */}
        <div className="wl-controls-row">
          <div className="wl-timeframe-bar">
            {TIMEFRAMES.map(tf => (
              <button key={tf}
                className={`wl-tf-btn${period === tf ? ' wl-tf-btn--active' : ''}`}
                onClick={() => setPeriod(tf)}>
                {tf}
              </button>
            ))}
          </div>

          <div className="wl-view-toggle">
            <button
              className={`wl-view-btn${view === 'chart' ? ' wl-view-btn--active' : ''}`}
              onClick={() => setView('chart')}
              title="Chart view">
              ▲ Chart
            </button>
            <button
              className={`wl-view-btn${view === 'table' ? ' wl-view-btn--active' : ''}`}
              onClick={() => setView('table')}
              title="Table view">
              ≡ Table
            </button>
          </div>
        </div>

        {/* Loading / error shared between both views */}
        {loading && <div className="wl-chart-loading"><div className="wl-chart-spinner" />Loading…</div>}
        {error   && <div className="wl-chart-error">{error}</div>}

        {/* Chart view */}
        {view === 'chart' && !loading && !error && (
          <div className="wl-chart-area">
            {chartData && <Line data={chartData} options={chartOptions} />}
          </div>
        )}

        {/* Table view */}
        {view === 'table' && !loading && !error && history && (
          <div className="wl-table-wrap">
            <table className="wl-history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Close</th>
                  <th>Change</th>
                  <th>Change %</th>
                </tr>
              </thead>
              <tbody>
                {/* Newest first */}
                {[...history.labels].reverse().map((label, ri) => {
                  const i       = history.prices.length - 1 - ri;
                  const price   = history.prices[i];
                  const prev    = i > 0 ? history.prices[i - 1] : null;
                  const change  = prev != null ? price - prev : null;
                  const changePct = prev != null ? (change / prev) * 100 : null;
                  const up      = change == null ? null : change >= 0;
                  return (
                    <tr key={label + i}>
                      <td className="wl-ht-date">{label}</td>
                      <td className="wl-ht-price">${price.toFixed(2)}</td>
                      <td className={change == null ? '' : up ? 'wl-change--up' : 'wl-change--down'}>
                        {change == null ? '—' : `${up ? '+' : ''}${change.toFixed(2)}`}
                      </td>
                      <td className={changePct == null ? '' : up ? 'wl-change--up' : 'wl-change--down'}>
                        {changePct == null ? '—' : `${up ? '+' : ''}${changePct.toFixed(2)}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

export default function WatchlistTab({ allStocks }) {
  const [watchlist, setWatchlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wealthWatchlist') || '[]'); }
    catch { return []; }
  });
  const [watchlistInput, setWatchlistInput] = useState('');
  const [tickerSuggestions, setTickerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [prices, setPrices] = useState({});
  const [selectedStock, setSelectedStock] = useState(null); // { symbol, name }

  const searchDebounceRef = useRef(null);
  const stompClientRef = useRef(null);
  const stompSubsRef = useRef({});    // { [symbol]: STOMP subscription }
  const priceFetchedRef = useRef(new Set()); // symbols already fetched
  const watchlistRef = useRef(watchlist);

  useEffect(() => {
    watchlistRef.current = watchlist;
    localStorage.setItem('wealthWatchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // ── Fetch initial price for one symbol ──────────────────────────────────────
  const fetchPrice = useCallback(async (symbol) => {
    if (priceFetchedRef.current.has(symbol)) return;
    priceFetchedRef.current.add(symbol);
    if (DEV_MODE) {
      const mock = getMockPrice(symbol);
      setPrices(prev => ({ ...prev, [symbol]: { ...mock, live: false } }));
      return;
    }
    try {
      const res = await fetch(`/api/stocks/${encodeURIComponent(symbol)}/price`);
      if (res.ok) {
        const data = await res.json();
        setPrices(prev => ({ ...prev, [symbol]: { ...data, live: false } }));
      }
    } catch { /* ignore network errors */ }
  }, []);

  // ── Subscribe one symbol on the STOMP connection ─────────────────────────────
  const stompSubscribeSymbol = useCallback((client, symbol) => {
    if (stompSubsRef.current[symbol]) return;
    const sub = client.subscribe(`/topic/prices/${symbol}`, (msg) => {
      const data = JSON.parse(msg.body);
      setPrices(prev => ({
        ...prev,
        [symbol]: { ...prev[symbol], currentPrice: data.price, live: true },
      }));
    });
    stompSubsRef.current[symbol] = sub;
    client.publish({
      destination: '/app/stocks/subscribe',
      body: JSON.stringify({ symbols: [symbol] }),
    });
  }, []);

  // ── STOMP connection — live mode only, runs once on mount ───────────────────
  useEffect(() => {
    if (DEV_MODE) return;
    const client = new Client({
      webSocketFactory: () => new WebSocket(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        watchlistRef.current.forEach(item => stompSubscribeSymbol(client, item.symbol));
      },
    });
    stompClientRef.current = client;
    client.activate();
    return () => {
      stompSubsRef.current = {};
      stompClientRef.current = null;
      client.deactivate();
    };
  }, [stompSubscribeSymbol]);

  // ── DEV_MODE: simulate live ticks every 3 s ─────────────────────────────────
  useEffect(() => {
    if (!DEV_MODE || watchlist.length === 0) return;
    const interval = setInterval(() => {
      setPrices(prev => {
        const updated = { ...prev };
        watchlistRef.current.forEach(item => {
          const p = updated[item.symbol];
          if (p?.currentPrice) {
            const delta = p.currentPrice * (Math.random() * 0.004 - 0.002);
            updated[item.symbol] = {
              ...p,
              currentPrice: +(p.currentPrice + delta).toFixed(2),
              live: true,
            };
          }
        });
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [watchlist]);

  // ── Sync prices + STOMP subscriptions when watchlist changes ────────────────
  useEffect(() => {
    watchlist.forEach(item => {
      fetchPrice(item.symbol);
      if (!DEV_MODE && stompClientRef.current?.connected && !stompSubsRef.current[item.symbol]) {
        stompSubscribeSymbol(stompClientRef.current, item.symbol);
      }
    });
    // Unsubscribe symbols no longer in watchlist
    if (!DEV_MODE) {
      const current = new Set(watchlist.map(w => w.symbol));
      Object.keys(stompSubsRef.current).forEach(sym => {
        if (!current.has(sym)) {
          stompSubsRef.current[sym]?.unsubscribe();
          delete stompSubsRef.current[sym];
          stompClientRef.current?.publish({
            destination: '/app/stocks/unsubscribe',
            body: JSON.stringify({ symbols: [sym] }),
          });
        }
      });
    }
  }, [watchlist, fetchPrice, stompSubscribeSymbol]);

  // ── Watchlist mutations ──────────────────────────────────────────────────────
  const addToWatchlist = useCallback((symbol, name) => {
    const sym = symbol.trim().toUpperCase();
    if (!sym) return;
    setWatchlist(prev => {
      if (prev.some(w => w.symbol === sym)) return prev;
      return [...prev, { symbol: sym, name: name || sym, addedAt: new Date().toLocaleDateString('en-SG') }];
    });
    setWatchlistInput('');
    setTickerSuggestions([]);
    setShowSuggestions(false);
  }, []);

  const removeFromWatchlist = useCallback((symbol) => {
    setWatchlist(prev => prev.filter(w => w.symbol !== symbol));
    setPrices(prev => { const n = { ...prev }; delete n[symbol]; return n; });
    priceFetchedRef.current.delete(symbol);
  }, []);

  // ── Typeahead ────────────────────────────────────────────────────────────────
  const handleWatchlistInputChange = useCallback((value) => {
    setWatchlistInput(value);
    clearTimeout(searchDebounceRef.current);
    if (value.trim().length < 1) {
      setTickerSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchDebounceRef.current = setTimeout(async () => {
      if (DEV_MODE) {
        const results = mockTickerSearch(value.trim());
        setTickerSuggestions(results);
        setShowSuggestions(results.length > 0);
        return;
      }
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(value.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setTickerSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch {
        setTickerSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  }, []);

  // ── Formatters ───────────────────────────────────────────────────────────────
  const formatPrice = (p) => (p != null ? `$${p.toFixed(2)}` : '—');

  const formatChange = (c, pc) => {
    if (c == null || pc == null) return null;
    const sign = c >= 0 ? '+' : '';
    return { text: `${sign}${c.toFixed(2)} (${sign}${pc.toFixed(2)}%)`, positive: c >= 0 };
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="watchlist-container">
      <h2 className="section-title">My Stock Watchlist</h2>

      <div className="watchlist-add-bar">
        <div className="watchlist-search-wrap">
          <input
            className="watchlist-input"
            value={watchlistInput}
            onChange={e => handleWatchlistInputChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addToWatchlist(watchlistInput, '')}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onFocus={() => tickerSuggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search ticker symbol (e.g. AAPL, TSLA)"
            autoComplete="off"
          />
          {showSuggestions && (
            <ul className="watchlist-suggestions">
              {tickerSuggestions.map(r => (
                <li
                  key={r.symbol}
                  className="watchlist-suggestion-item"
                  onMouseDown={() => addToWatchlist(r.symbol, r.description)}
                >
                  <span className="watchlist-symbol">{r.symbol}</span>
                  <span className="watchlist-suggestion-desc">{r.description}</span>
                  <span className="watchlist-suggestion-type">{r.type}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          className="watchlist-add-btn"
          onClick={() => addToWatchlist(watchlistInput, '')}
          disabled={!watchlistInput.trim()}
        >
          + Add to Watchlist
        </button>
      </div>

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
                <th className="wl-col-name">Name</th>
                <th>Price</th>
                <th>Change</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((item) => {
                const priceData = prices[item.symbol];
                const change = formatChange(priceData?.change, priceData?.percentChange);
                return (
                  <tr key={item.symbol} className="wl-row-clickable"
                    onClick={() => setSelectedStock({ symbol: item.symbol, name: item.name })}>
                    <td>
                      <span className="watchlist-symbol">{item.symbol}</span>
                    </td>
                    <td className="wl-col-name">{item.name}</td>
                    <td className="wl-price-cell">
                      {priceData?.live && <span className="wl-live-dot" />}
                      <span className="wl-price">{formatPrice(priceData?.currentPrice)}</span>
                    </td>
                    <td>
                      {change ? (
                        <span className={`wl-change ${change.positive ? 'wl-change--up' : 'wl-change--down'}`}>
                          {change.text}
                        </span>
                      ) : (
                        <span className="wl-loading">…</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <button
                        className="watchlist-remove-btn"
                        onClick={() => removeFromWatchlist(item.symbol)}
                        title="Remove from watchlist"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedStock && (
        <StockHistoryModal
          symbol={selectedStock.symbol}
          name={selectedStock.name}
          priceData={prices[selectedStock.symbol]}
          onClose={() => setSelectedStock(null)}
        />
      )}

      {allStocks.length > 0 && (
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
              {allStocks.map((s, i) => {
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
  );
}
