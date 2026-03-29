import { useState, useCallback, useRef } from 'react';
import { DEV_MODE } from '../config/devConfig';
import { mockTickerSearch, getMockTechnical } from '../mocks/mockData';

const RESOLUTIONS = [
  { value: 'D', label: 'Daily' },
  { value: 'W', label: 'Weekly' },
  { value: 'M', label: 'Monthly' },
];

// ── StockSearch sub-component ─────────────────────────────────────────────────

function StockSearch({ onLoad }) {
  const [input, setInput]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [resolution, setResolution] = useState('D');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const debounceRef = useRef(null);

  const handleInput = useCallback((value) => {
    setInput(value);
    clearTimeout(debounceRef.current);
    if (value.trim().length < 1) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      if (DEV_MODE) {
        const results = mockTickerSearch(value.trim());
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        return;
      }
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(value.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch { setSuggestions([]); setShowSuggestions(false); }
    }, 300);
  }, []);

  const loadTechnical = useCallback(async (symbol) => {
    if (!symbol.trim()) return;
    setLoading(true);
    setError('');
    setShowSuggestions(false);
    try {
      if (DEV_MODE) {
        await new Promise(r => setTimeout(r, 400));
        onLoad(getMockTechnical(symbol.trim().toUpperCase(), resolution));
        return;
      }
      const res = await fetch(`/api/stocks/${encodeURIComponent(symbol.trim().toUpperCase())}/technical?resolution=${resolution}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      onLoad(data);
    } catch {
      setError(`Could not load data for "${symbol.trim().toUpperCase()}". Check the symbol and try again.`);
    } finally {
      setLoading(false);
    }
  }, [resolution, onLoad]);

  const selectSuggestion = useCallback((sym) => {
    setInput(sym);
    setSuggestions([]);
    setShowSuggestions(false);
    loadTechnical(sym);
  }, [loadTechnical]);

  return (
    <div className="ta-search-bar">
      <div className="ta-search-wrap">
        <input
          className="ta-search-input"
          value={input}
          onChange={e => handleInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadTechnical(input)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search symbol (e.g. AAPL, TSLA)"
          autoComplete="off"
          disabled={loading}
        />
        {showSuggestions && (
          <ul className="watchlist-suggestions ta-suggestions">
            {suggestions.map(r => (
              <li key={r.symbol} className="watchlist-suggestion-item"
                onMouseDown={() => selectSuggestion(r.symbol)}>
                <span className="watchlist-symbol">{r.symbol}</span>
                <span className="watchlist-suggestion-desc">{r.description}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <select className="ta-resolution-select"
        value={resolution}
        onChange={e => setResolution(e.target.value)}
        disabled={loading}>
        {RESOLUTIONS.map(r => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
      <button className="ta-search-btn"
        onClick={() => loadTechnical(input)}
        disabled={loading || !input.trim()}>
        {loading ? 'Loading…' : 'Analyse'}
      </button>
      {error && <div className="ta-error">{error}</div>}
    </div>
  );
}

// ── RSI helpers ───────────────────────────────────────────────────────────────

function rsiColor(signal) {
  if (signal === 'Oversold')   return 'ta-rsi--oversold';
  if (signal === 'Overbought') return 'ta-rsi--overbought';
  return 'ta-rsi--neutral';
}

function rsiDescription(rsi, signal) {
  if (signal === 'Oversold')
    return 'Below 30 — the stock may be oversold. Potential buying opportunity.';
  if (signal === 'Overbought')
    return 'Above 70 — the stock may be overbought. Consider taking profits or waiting for a pullback.';
  if (rsi < 50)
    return 'Between 30–50 — mild bearish momentum. Watch for a break below support.';
  return 'Between 50–70 — mild bullish momentum. Price has room to move higher before overbought territory.';
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TechnicalAnalysisTab() {
  const [data, setData] = useState(null);

  const fmt  = (v) => v != null ? `$${v.toFixed(2)}` : '—';
  const pct  = (current, level) => {
    const d = ((level - current) / current) * 100;
    return (d >= 0 ? '+' : '') + d.toFixed(2) + '%';
  };
  const dist = (current, level) => {
    const d = Math.abs(level - current);
    return `$${d.toFixed(2)}`;
  };

  return (
    <div className="ta-container">
      <h2 className="section-title">Technical Analysis</h2>
      <p className="ta-subtitle">Support &amp; resistance levels with RSI indicator powered by Finnhub</p>

      <StockSearch onLoad={setData} />

      {data && (
        <>
          {/* ── Price summary ─────────────────────────────── */}
          <div className="ta-price-card info-card">
            <div className="ta-price-header">
              <span className="ta-symbol">{data.symbol}</span>
              <span className={`ta-resolution-badge`}>{
                RESOLUTIONS.find(r => r.value === data.resolution)?.label ?? data.resolution
              }</span>
            </div>
            <div className="ta-price-main">
              <span className="ta-current-price">{fmt(data.currentPrice)}</span>
              <span className={`ta-day-change ${data.change >= 0 ? 'ta-up' : 'ta-down'}`}>
                {data.change >= 0 ? '+' : ''}{data.change?.toFixed(2)} ({data.change >= 0 ? '+' : ''}{data.percentChange?.toFixed(2)}%)
              </span>
            </div>
            <div className="ta-ohlc-row">
              <span><label>O</label> {fmt(data.open)}</span>
              <span><label>H</label> {fmt(data.high)}</span>
              <span><label>L</label> {fmt(data.low)}</span>
              <span><label>PC</label> {fmt(data.previousClose)}</span>
            </div>
          </div>

          {/* ── Support & Resistance ladder ───────────────── */}
          <div className="info-card ta-ladder-card">
            <h3>Support &amp; Resistance Levels</h3>
            <table className="ta-ladder-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Level</th>
                  <th>Distance</th>
                  <th>% from Price</th>
                </tr>
              </thead>
              <tbody>
                {/* Resistance — most distant first */}
                {[...data.resistanceLevels].reverse().map((level, i) => {
                  const idx = data.resistanceLevels.indexOf(level);
                  return (
                    <tr key={`r-${i}`} className="ta-row-resistance">
                      <td><span className="ta-zone-badge ta-zone-resistance">R{data.resistanceLevels.length - i}</span></td>
                      <td className="ta-level-price">{fmt(level)}</td>
                      <td className="ta-level-dist">{dist(data.currentPrice, level)}</td>
                      <td className={`ta-level-pct ta-up`}>{pct(data.currentPrice, level)}</td>
                    </tr>
                  );
                })}

                {/* Current price row */}
                <tr className="ta-row-current">
                  <td colSpan={2}><span className="ta-current-marker">▶ Current Price</span></td>
                  <td colSpan={2} className="ta-level-price ta-current-val">{fmt(data.currentPrice)}</td>
                </tr>

                {/* Support — nearest first */}
                {data.supportLevels.map((level, i) => (
                  <tr key={`s-${i}`} className="ta-row-support">
                    <td><span className="ta-zone-badge ta-zone-support">S{i + 1}</span></td>
                    <td className="ta-level-price">{fmt(level)}</td>
                    <td className="ta-level-dist">{dist(data.currentPrice, level)}</td>
                    <td className={`ta-level-pct ta-down`}>{pct(data.currentPrice, level)}</td>
                  </tr>
                ))}

                {data.resistanceLevels.length === 0 && data.supportLevels.length === 0 && (
                  <tr><td colSpan={4} className="ta-no-levels">No S/R levels available for this symbol.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── RSI ──────────────────────────────────────── */}
          {data.rsi != null && (
            <div className={`info-card ta-rsi-card ${rsiColor(data.rsiSignal)}`}>
              <h3>RSI (14-period)</h3>
              <div className="ta-rsi-row">
                <span className="ta-rsi-value">{data.rsi.toFixed(1)}</span>
                <span className="ta-rsi-signal">{data.rsiSignal}</span>
              </div>
              <div className="ta-rsi-track">
                <div className="ta-rsi-fill" style={{ width: `${Math.min(data.rsi, 100)}%` }} />
                <div className="ta-rsi-marker ta-rsi-marker--30" title="Oversold threshold (30)" />
                <div className="ta-rsi-marker ta-rsi-marker--70" title="Overbought threshold (70)" />
              </div>
              <div className="ta-rsi-labels">
                <span>0</span><span className="ta-rsi-label-30">30</span>
                <span className="ta-rsi-label-70">70</span><span>100</span>
              </div>
              <p className="ta-rsi-desc">{rsiDescription(data.rsi, data.rsiSignal)}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
