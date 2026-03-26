import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { DEV_MODE, WS_URL } from '../config/devConfig';
import { mockTickerSearch, getMockPrice } from '../mocks/mockData';
import { formatCurrency } from '../utils/formatCurrency';

export default function WatchlistTab({ allStocks }) {
  const [watchlist, setWatchlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wealthWatchlist') || '[]'); }
    catch { return []; }
  });
  const [watchlistInput, setWatchlistInput] = useState('');
  const [tickerSuggestions, setTickerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [prices, setPrices] = useState({});

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
                  <tr key={item.symbol}>
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>

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
