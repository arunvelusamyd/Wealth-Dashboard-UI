import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DEV_MODE } from '../devConfig';
import { mockTickerSearch } from '../mockData';
import { formatCurrency } from '../utils/formatCurrency';

export default function WatchlistTab({ allStocks }) {
  const [watchlist, setWatchlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wealthWatchlist') || '[]'); }
    catch { return []; }
  });
  const [watchlistInput, setWatchlistInput] = useState('');
  const [tickerSuggestions, setTickerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchDebounceRef = useRef(null);

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
    setTickerSuggestions([]);
    setShowSuggestions(false);
  }, []);

  const removeFromWatchlist = useCallback((symbol) => {
    setWatchlist(prev => prev.filter(w => w.symbol !== symbol));
  }, []);

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
