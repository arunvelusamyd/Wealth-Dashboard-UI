import { useState, useCallback, useRef } from 'react';
import { DEV_MODE } from '../config/devConfig';
import { mockTickerSearch, getMockFundamentals } from '../mocks/mockData';

const METRICS = [
  { label: 'PE Ratio',                     key: 'peRatio',               fmt: 'ratio', desc: 'Price ÷ Earnings per share' },
  { label: 'P/B Ratio',                    key: 'pbRatio',               fmt: 'ratio', desc: 'Price ÷ Tangible Book Value per share' },
  { label: 'Dividend Yield',               key: 'dividendYield',         fmt: 'pct',   desc: 'Annual dividends ÷ current price' },
  { label: 'Net / Sales',                  key: 'netProfitMargin',       fmt: 'pct',   desc: 'Net Profit Margin (TTM)' },
  { label: 'Earnings / Book Value',        key: 'earningsToBookValue',   fmt: 'ratio', desc: 'EPS ÷ Book Value per share (annual)' },
  { label: 'PEG Ratio',                    key: 'pegRatio',              fmt: 'ratio', desc: 'P/E ÷ 5-yr EPS Growth' },
  { label: 'Current Assets / Liabilities', key: 'currentRatio',         fmt: 'ratio', desc: 'Liquidity ratio (annual)' },
  { label: 'Working Capital / Debt',       key: 'workingCapitalToDebt',  fmt: 'ratio', desc: 'Working Capital ÷ Total Debt' },
  { label: 'Net Current Asset / Debt',     key: 'netCurrentAssetToDebt', fmt: 'ratio', desc: 'Graham Net-Net metric' },
  { label: 'ROE',                          key: 'roe',                   fmt: 'pct',   desc: 'Return on Equity (TTM)' },
  { label: 'ROCE',                         key: 'roce',                  fmt: 'pct',   desc: 'Return on Invested Capital (TTM)' },
];

// Benchmark thresholds with short label + rating function
const BENCHMARKS = {
  peRatio:               { text: '< 15 Good / < 25 Mod',  rate: v => v < 15 ? 'good' : v < 25 ? 'moderate' : 'poor'  },
  pbRatio:               { text: '< 1.5 Good / < 3 Mod',  rate: v => v < 1.5 ? 'good' : v < 3 ? 'moderate' : 'poor'  },
  dividendYield:         { text: '> 3% Good / > 1% Mod',  rate: v => v >= 3 ? 'good' : v >= 1 ? 'moderate' : 'poor'  },
  netProfitMargin:       { text: '> 20% Good / > 10% Mod',rate: v => v >= 20 ? 'good' : v >= 10 ? 'moderate' : 'poor' },
  earningsToBookValue:   { text: '> 1.5 Good / > 0.5 Mod',rate: v => v >= 1.5 ? 'good' : v >= 0.5 ? 'moderate' : 'poor' },
  pegRatio:              { text: '< 1 Good / < 2 Mod',    rate: v => v < 1 ? 'good' : v < 2 ? 'moderate' : 'poor'    },
  currentRatio:          { text: '> 2 Good / > 1 Mod',    rate: v => v >= 2 ? 'good' : v >= 1 ? 'moderate' : 'poor'  },
  workingCapitalToDebt:  { text: '> 0.5 Good / > 0 Mod',  rate: v => v >= 0.5 ? 'good' : v >= 0 ? 'moderate' : 'poor' },
  netCurrentAssetToDebt: { text: '> 0 Good',              rate: v => v > 0 ? 'good' : 'poor'                          },
  roe:                   { text: '> 15% Good / > 8% Mod', rate: v => v >= 15 ? 'good' : v >= 8 ? 'moderate' : 'poor' },
  roce:                  { text: '> 15% Good / > 8% Mod', rate: v => v >= 15 ? 'good' : v >= 8 ? 'moderate' : 'poor' },
};

const BADGE_LABELS = { good: 'Good', moderate: 'Moderate', poor: 'Poor' };

function formatValue(value, fmt) {
  if (value == null) return null;
  return fmt === 'pct' ? `${value.toFixed(2)}%` : value.toFixed(2);
}

function getRating(key, value) {
  if (value == null || !BENCHMARKS[key]) return null;
  return BENCHMARKS[key].rate(value);
}

// ── Self-contained search slot ────────────────────────────────────────────────
function StockSearch({ slotLabel, loaded, loading, error, onFetch, onClear }) {
  const [query, setQuery]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg]     = useState(false);
  const debounceRef                 = useRef(null);

  const runSearch = useCallback((value) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (value.trim().length < 1) { setSuggestions([]); setShowSugg(false); return; }
    debounceRef.current = setTimeout(async () => {
      if (DEV_MODE) {
        const r = mockTickerSearch(value.trim());
        setSuggestions(r); setShowSugg(r.length > 0); return;
      }
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(value.trim())}`);
        if (res.ok) { const r = await res.json(); setSuggestions(r); setShowSugg(r.length > 0); }
      } catch { setSuggestions([]); }
    }, 300);
  }, []);

  const select = (symbol, name) => {
    setQuery(`${symbol}  ${name ? '– ' + name : ''}`.trim());
    setSuggestions([]); setShowSugg(false);
    onFetch(symbol);
  };

  const clear = () => { setQuery(''); setSuggestions([]); setShowSugg(false); onClear(); };

  return (
    <div className="fund-slot">
      <div className="fund-slot-label">{slotLabel}</div>
      <div className="fund-slot-input-wrap">
        <input
          className="watchlist-input fund-slot-input"
          value={query}
          onChange={e => runSearch(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { const s = query.trim().toUpperCase().split(/[\s–]/)[0]; if (s) select(s, ''); } }}
          onBlur={() => setTimeout(() => setShowSugg(false), 150)}
          onFocus={() => suggestions.length > 0 && setShowSugg(true)}
          placeholder="Search ticker (e.g. AAPL)"
          autoComplete="off"
        />
        {(loaded || loading) && (
          <button className="fund-slot-clear" onClick={clear} title="Clear">✕</button>
        )}
        {showSugg && (
          <ul className="watchlist-suggestions">
            {suggestions.map(r => (
              <li key={r.symbol} className="watchlist-suggestion-item" onMouseDown={() => select(r.symbol, r.description)}>
                <span className="watchlist-symbol">{r.symbol}</span>
                <span className="watchlist-suggestion-desc">{r.description}</span>
                <span className="watchlist-suggestion-type">{r.type}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {loading && <div className="fund-slot-status"><div className="fundamentals-spinner" /> Loading…</div>}
      {error   && <div className="fund-slot-status fund-slot-error">{error}</div>}
      {loaded  && !loading && (
        <div className="fund-slot-status fund-slot-loaded">
          <span className="watchlist-symbol">{loaded.symbol}</span> loaded
        </div>
      )}
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────
export default function FundamentalsTab() {
  const [data1, setData1]       = useState(null);
  const [data2, setData2]       = useState(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [error1, setError1]     = useState(null);
  const [error2, setError2]     = useState(null);

  const loadFundamentals = useCallback(async (symbol, setData, setLoading, setError) => {
    setLoading(true); setData(null); setError(null);
    if (DEV_MODE) {
      await new Promise(r => setTimeout(r, 450));
      setData(getMockFundamentals(symbol));
      setLoading(false); return;
    }
    try {
      const res = await fetch(`/api/stocks/${encodeURIComponent(symbol)}/fundamentals`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch { setError('Failed to load. Try again.'); }
    setLoading(false);
  }, []);

  const fetch1 = useCallback((sym) => loadFundamentals(sym, setData1, setLoading1, setError1), [loadFundamentals]);
  const fetch2 = useCallback((sym) => loadFundamentals(sym, setData2, setLoading2, setError2), [loadFundamentals]);

  const hasData = data1 || data2;

  return (
    <div className="fundamentals-container">
      <h2 className="section-title">Stock Fundamentals</h2>
      <p className="fundamentals-subtitle">
        Search up to two stocks to compare key ratios side-by-side against standard benchmarks.
      </p>

      {/* ── Two search slots ── */}
      <div className="fund-search-row">
        <StockSearch slotLabel="Stock 1" loaded={data1} loading={loading1} error={error1}
          onFetch={fetch1} onClear={() => { setData1(null); setError1(null); }} />
        <div className="fund-vs">VS</div>
        <StockSearch slotLabel="Stock 2" loaded={data2} loading={loading2} error={error2}
          onFetch={fetch2} onClear={() => { setData2(null); setError2(null); }} />
      </div>

      {/* ── Comparison table ── */}
      {hasData && (
        <div className="info-card fund-table-card">
          <div className="fund-table-wrap">
            <table className="fund-table">
              <thead>
                <tr>
                  <th className="fund-th fund-th-metric">Metric</th>
                  <th className="fund-th fund-th-bench">Benchmark</th>
                  {data1 && <th className="fund-th fund-th-stock"><span className="watchlist-symbol">{data1.symbol}</span></th>}
                  {data2 && <th className="fund-th fund-th-stock"><span className="watchlist-symbol">{data2.symbol}</span></th>}
                </tr>
              </thead>
              <tbody>
                {METRICS.map(({ label, key, fmt, desc }) => {
                  const v1 = data1?.[key];
                  const v2 = data2?.[key];
                  const r1 = getRating(key, v1);
                  const r2 = getRating(key, v2);
                  return (
                    <tr key={key} className="fund-tr">
                      <td className="fund-td-metric">
                        <span className="fund-metric-name">{label}</span>
                        <span className="fund-metric-desc">{desc}</span>
                      </td>
                      <td className="fund-td-bench">
                        {BENCHMARKS[key]?.text ?? '—'}
                      </td>
                      {data1 && (
                        <td className="fund-td-val" data-symbol={data1.symbol}>
                          <span className="fund-val">{formatValue(v1, fmt) ?? 'N/A'}</span>
                          {r1 && <span className={`fund-badge fund-badge--${r1}`}>{BADGE_LABELS[r1]}</span>}
                        </td>
                      )}
                      {data2 && (
                        <td className="fund-td-val" data-symbol={data2.symbol}>
                          <span className="fund-val">{formatValue(v2, fmt) ?? 'N/A'}</span>
                          {r2 && <span className={`fund-badge fund-badge--${r2}`}>{BADGE_LABELS[r2]}</span>}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="fund-legend">
            <span className="fund-badge fund-badge--good">Good</span>
            <span className="fund-badge fund-badge--moderate">Moderate</span>
            <span className="fund-badge fund-badge--poor">Poor</span>
            <span className="fund-legend-note">
              Benchmarks are general guidelines — industry context and growth stage may differ.
              Working Capital/Debt and Net Current Asset/Debt require detailed balance-sheet data (N/A from Finnhub basic metrics).
            </span>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!hasData && !loading1 && !loading2 && (
        <div className="info-card fundamentals-empty-card">
          <div className="fundamentals-empty">
            Search a stock above to view fundamental ratios compared against benchmarks.
            Add a second stock to compare them side-by-side.
          </div>
        </div>
      )}
    </div>
  );
}
