import { useState, useEffect, useCallback } from 'react';
import { DEV_MODE } from '../config/devConfig';
import { mockCards } from '../mocks/mockData';

// ── Constants ─────────────────────────────────────────────────────────────────

const BANKS      = ['DBS', 'UOB', 'OCBC', 'Standard Chartered', 'Citibank', 'HSBC', 'Other'];
const CARD_TYPES = ['Visa', 'Mastercard', 'Amex', 'Other'];
const CATEGORIES = ['Food & Dining', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare', 'Travel', 'Other'];

const BANK_COLORS = {
  'DBS':                 '#E50012',
  'UOB':                 '#005DAA',
  'OCBC':                '#E30613',
  'Standard Chartered':  '#0099A8',
  'Citibank':            '#003B8D',
  'HSBC':                '#DB0011',
  'Other':               '#555555',
};

// ── Status config (3 states as specified) ─────────────────────────────────────
// Red   = at or above limit
// Amber = reached 80% of limit within 80%+ of the time period
// Green = well below 80%

const STATUS_CFG = {
  over:   { label: 'Over limit',        barColor: '#e74c3c', bg: '#fde8e8', textColor: '#c0392b', border: '#f5c6c0' },
  warn:   { label: 'Approaching limit', barColor: '#e67e22', bg: '#fef3e2', textColor: '#d35400', border: '#fcd3a0' },
  good:   { label: 'On track',          barColor: '#27ae60', bg: '#e8f8ef', textColor: '#1e7e34', border: '#b2dfcc' },
  none:   { label: 'No limit set',      barColor: '#95a5a6', bg: '#f5f5f5', textColor: '#7f8c8d', border: '#ddd'    },
};

// ── Date / spend helpers ──────────────────────────────────────────────────────

function getWeekBounds() {
  const now = new Date();
  const dow = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon=0…Sun=6
  const start = new Date(now);
  start.setDate(now.getDate() - dow);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

function getPeriodInfo(limitType) {
  const now = new Date();
  if (limitType === 'monthly') {
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return {
      elapsed:  now.getDate(),
      total:    totalDays,
      label:    now.toLocaleString('default', { month: 'long', year: 'numeric' }),
    };
  }
  const { start, end } = getWeekBounds();
  const fmt = d => d.toLocaleDateString('en-SG', { month: 'short', day: 'numeric' });
  const endDisplay = new Date(end); endDisplay.setDate(end.getDate() - 1);
  const dow = new Date().getDay() === 0 ? 7 : new Date().getDay();
  return {
    elapsed: dow,
    total:   7,
    label:   `${fmt(start)} – ${fmt(endDisplay)}`,
  };
}

function getCardSpend(card) {
  const now = new Date();
  return card.transactions
    .filter(tx => {
      const d = new Date(tx.date);
      if (card.limitType === 'monthly') {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }
      const { start, end } = getWeekBounds();
      return d >= start && d < end;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
}

function getStatus(spend, limitAmount, limitType) {
  if (!limitAmount || limitAmount <= 0) return 'none';
  const spendRatio = spend / limitAmount;
  if (spendRatio >= 1) return 'over';
  if (spendRatio >= 0.8) {
    // Check if 80%+ of the time period has elapsed
    const { elapsed, total } = getPeriodInfo(limitType);
    const timePct = elapsed / total;
    return timePct >= 0.8 ? 'warn' : 'warn'; // Show amber in both sub-cases; time info shown as text
  }
  return 'good';
}

const fmt$ = n => `SGD ${n.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Modals ────────────────────────────────────────────────────────────────────

function AddCardModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: '', bank: 'DBS', lastFour: '', cardType: 'Visa',
    limitType: 'monthly', limitAmount: '',
  });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = () => {
    if (!form.name.trim() || !form.limitAmount) return;
    onSave({
      id:          crypto.randomUUID(),
      name:        form.name.trim(),
      bank:        form.bank,
      lastFour:    form.lastFour.replace(/\D/g, '').slice(0, 4),
      cardType:    form.cardType,
      limitType:   form.limitType,
      limitAmount: parseFloat(form.limitAmount),
      transactions: [],
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cards-modal" onClick={e => e.stopPropagation()}>
        <h3 className="cards-modal-title">Add Card</h3>

        <label className="cards-modal-label">Card Name</label>
        <input className="cards-modal-input" value={form.name} onChange={set('name')} placeholder="e.g. DBS Live Fresh" />

        <label className="cards-modal-label">Bank</label>
        <select className="cards-modal-input" value={form.bank} onChange={set('bank')}>
          {BANKS.map(b => <option key={b}>{b}</option>)}
        </select>

        <div className="cards-modal-row">
          <div className="cards-modal-col">
            <label className="cards-modal-label">Last 4 Digits</label>
            <input className="cards-modal-input" value={form.lastFour} onChange={set('lastFour')}
              maxLength={4} placeholder="4521" />
          </div>
          <div className="cards-modal-col">
            <label className="cards-modal-label">Card Type</label>
            <select className="cards-modal-input" value={form.cardType} onChange={set('cardType')}>
              {CARD_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="cards-modal-row">
          <div className="cards-modal-col">
            <label className="cards-modal-label">Limit Type</label>
            <select className="cards-modal-input" value={form.limitType} onChange={set('limitType')}>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div className="cards-modal-col">
            <label className="cards-modal-label">Spend Limit (SGD)</label>
            <input className="cards-modal-input" type="number" min="0" value={form.limitAmount}
              onChange={set('limitAmount')} placeholder="2000" />
          </div>
        </div>

        <div className="cards-modal-actions">
          <button className="cards-modal-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="cards-modal-btn-primary" onClick={save}
            disabled={!form.name.trim() || !form.limitAmount}>Save Card</button>
        </div>
      </div>
    </div>
  );
}

function EditLimitModal({ card, onSave, onClose }) {
  const [limitType,   setLimitType]   = useState(card.limitType);
  const [limitAmount, setLimitAmount] = useState(String(card.limitAmount));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cards-modal" onClick={e => e.stopPropagation()}>
        <h3 className="cards-modal-title">Edit Limit — {card.name}</h3>

        <div className="cards-modal-row">
          <div className="cards-modal-col">
            <label className="cards-modal-label">Limit Type</label>
            <select className="cards-modal-input" value={limitType} onChange={e => setLimitType(e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div className="cards-modal-col">
            <label className="cards-modal-label">Spend Limit (SGD)</label>
            <input className="cards-modal-input" type="number" min="0" value={limitAmount}
              onChange={e => setLimitAmount(e.target.value)} />
          </div>
        </div>

        <div className="cards-modal-actions">
          <button className="cards-modal-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="cards-modal-btn-primary"
            onClick={() => onSave({ limitType, limitAmount: parseFloat(limitAmount) })}
            disabled={!limitAmount || parseFloat(limitAmount) <= 0}>Save</button>
        </div>
      </div>
    </div>
  );
}

function AddTransactionModal({ card, onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ description: '', amount: '', date: today, category: 'Food & Dining' });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = () => {
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    onSave({
      id:          crypto.randomUUID(),
      description: form.description.trim() || form.category,
      amount:      parseFloat(form.amount),
      date:        form.date,
      category:    form.category,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cards-modal" onClick={e => e.stopPropagation()}>
        <h3 className="cards-modal-title">Add Spend — {card.name}</h3>

        <label className="cards-modal-label">Description</label>
        <input className="cards-modal-input" value={form.description} onChange={set('description')}
          placeholder="e.g. Lunch at Hawker Centre" />

        <div className="cards-modal-row">
          <div className="cards-modal-col">
            <label className="cards-modal-label">Amount (SGD)</label>
            <input className="cards-modal-input" type="number" min="0" step="0.01"
              value={form.amount} onChange={set('amount')} placeholder="25.50" />
          </div>
          <div className="cards-modal-col">
            <label className="cards-modal-label">Date</label>
            <input className="cards-modal-input" type="date" value={form.date} onChange={set('date')} />
          </div>
        </div>

        <label className="cards-modal-label">Category</label>
        <select className="cards-modal-input" value={form.category} onChange={set('category')}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>

        <div className="cards-modal-actions">
          <button className="cards-modal-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="cards-modal-btn-primary" onClick={save}
            disabled={!form.amount || parseFloat(form.amount) <= 0}>Add Spend</button>
        </div>
      </div>
    </div>
  );
}

// ── Card Widget ───────────────────────────────────────────────────────────────

function CardWidget({ card, onAddTx, onEditLimit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const spend  = getCardSpend(card);
  const status = getStatus(spend, card.limitAmount, card.limitType);
  const period = getPeriodInfo(card.limitType);
  const cfg    = STATUS_CFG[status];
  const pct    = card.limitAmount > 0 ? Math.min((spend / card.limitAmount) * 100, 100) : 0;
  const timePct = Math.round((period.elapsed / period.total) * 100);
  const bankColor = BANK_COLORS[card.bank] || BANK_COLORS.Other;

  // Current-period transactions only, newest first
  const now = new Date();
  const { start: wkStart, end: wkEnd } = getWeekBounds();
  const periodTxns = card.transactions
    .filter(tx => {
      const d = new Date(tx.date);
      if (card.limitType === 'monthly')
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      return d >= wkStart && d < wkEnd;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className={`cards-widget cards-widget--${status}`}>

      {/* Coloured accent stripe */}
      <div className="cards-widget-stripe" style={{ background: bankColor }} />

      <div className="cards-widget-body">
        {/* Header row */}
        <div className="cards-widget-header">
          <div className="cards-widget-info">
            <div className="cards-chip" style={{ background: bankColor }} />
            <div>
              <div className="cards-name">{card.name}</div>
              <div className="cards-meta">{card.bank} · {card.cardType} ···· {card.lastFour || '????'}</div>
            </div>
          </div>
          <span className="cards-status-badge"
            style={{ background: cfg.bg, color: cfg.textColor, borderColor: cfg.border }}>
            {cfg.label}
          </span>
        </div>

        {/* Period info */}
        <div className="cards-period-row">
          <span className="cards-period-type-badge">
            {card.limitType === 'monthly' ? 'Monthly' : 'Weekly'}
          </span>
          <span className="cards-period-label">{period.label}</span>
          <span className="cards-period-days">{period.elapsed}/{period.total} days ({timePct}%)</span>
        </div>

        {/* Progress bar */}
        <div className="cards-bar-track">
          <div className="cards-bar-fill" style={{ width: `${pct}%`, background: cfg.barColor }} />
          <div className="cards-bar-threshold" style={{ left: '80%' }} title="80% limit threshold" />
        </div>

        {/* Amounts */}
        <div className="cards-amounts-row">
          <span className="cards-spend-val" style={{ color: cfg.barColor }}>{fmt$(spend)}</span>
          <span className="cards-limit-val">
            of {fmt$(card.limitAmount)} &nbsp;·&nbsp; <strong>{pct.toFixed(0)}%</strong>
          </span>
        </div>

        <div className="cards-remaining-row">
          {status === 'over'
            ? <span className="cards-over-msg">⚠ {fmt$(spend - card.limitAmount)} over budget</span>
            : <span className="cards-remaining-msg">{fmt$(card.limitAmount - spend)} remaining</span>}
        </div>

        {/* Actions */}
        <div className="cards-actions-row">
          <button className="cards-btn cards-btn--action" onClick={() => onAddTx(card.id)}>
            + Add Spend
          </button>
          <button className="cards-btn cards-btn--action" onClick={() => onEditLimit(card.id)}>
            ✎ Edit Limit
          </button>
          <button className="cards-btn cards-btn--action cards-btn--delete" onClick={() => onDelete(card.id)}>
            ✕
          </button>
          {periodTxns.length > 0 && (
            <button className="cards-btn cards-btn--expand" onClick={() => setExpanded(e => !e)}>
              {periodTxns.length} transaction{periodTxns.length !== 1 ? 's' : ''} {expanded ? '▲' : '▼'}
            </button>
          )}
        </div>

        {/* Transaction list */}
        {expanded && (
          <div className="cards-txn-list">
            {periodTxns.map(tx => (
              <div key={tx.id} className="cards-txn-row">
                <span className="cards-txn-date">
                  {new Date(tx.date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
                </span>
                <span className="cards-txn-desc">{tx.description}</span>
                <span className="cards-txn-cat">{tx.category}</span>
                <span className="cards-txn-amt">{fmt$(tx.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Summary bar ───────────────────────────────────────────────────────────────

function SummaryBar({ cards }) {
  const totalSpend = cards.reduce((s, c) => s + getCardSpend(c), 0);
  const overCards  = cards.filter(c => getStatus(getCardSpend(c), c.limitAmount, c.limitType) === 'over');
  const warnCards  = cards.filter(c => getStatus(getCardSpend(c), c.limitAmount, c.limitType) === 'warn');

  return (
    <div className="cards-summary-bar">
      <div className="cards-summary-item">
        <div className="cards-summary-val">{fmt$(totalSpend)}</div>
        <div className="cards-summary-lbl">Total spend this period</div>
      </div>
      <div className="cards-summary-item">
        <div className="cards-summary-val">{cards.length}</div>
        <div className="cards-summary-lbl">Cards tracked</div>
      </div>
      {overCards.length > 0 && (
        <div className="cards-summary-item cards-summary-item--over">
          <div className="cards-summary-val">{overCards.length}</div>
          <div className="cards-summary-lbl">Over limit</div>
        </div>
      )}
      {warnCards.length > 0 && (
        <div className="cards-summary-item cards-summary-item--warn">
          <div className="cards-summary-val">{warnCards.length}</div>
          <div className="cards-summary-lbl">Near limit</div>
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function CardsTab() {
  const [cards, setCards] = useState(() => {
    if (DEV_MODE) return mockCards;
    try { return JSON.parse(localStorage.getItem('wealthCards') || '[]'); }
    catch { return []; }
  });
  const [showAddCard,    setShowAddCard]    = useState(false);
  const [addTxCardId,    setAddTxCardId]    = useState(null);
  const [editLimitId,    setEditLimitId]    = useState(null);

  useEffect(() => {
    if (!DEV_MODE) localStorage.setItem('wealthCards', JSON.stringify(cards));
  }, [cards]);

  const handleAddCard    = useCallback(card => { setCards(cs => [...cs, card]); setShowAddCard(false); }, []);
  const handleAddTx      = useCallback((id, tx) => {
    setCards(cs => cs.map(c => c.id === id ? { ...c, transactions: [...c.transactions, tx] } : c));
    setAddTxCardId(null);
  }, []);
  const handleEditLimit  = useCallback((id, update) => {
    setCards(cs => cs.map(c => c.id === id ? { ...c, ...update } : c));
    setEditLimitId(null);
  }, []);
  const handleDelete     = useCallback(id => {
    if (window.confirm('Remove this card and all its transactions?'))
      setCards(cs => cs.filter(c => c.id !== id));
  }, []);

  const addTxCard    = cards.find(c => c.id === addTxCardId);
  const editLimitCard = cards.find(c => c.id === editLimitId);

  return (
    <div className="cards-container">

      <div className="cards-page-header">
        <div>
          <h2 className="section-title">Cards &amp; Spend Limits</h2>
          <p className="ta-subtitle">Track monthly or weekly spend per card against your set limits</p>
        </div>
        <button className="cards-add-btn" onClick={() => setShowAddCard(true)}>+ Add Card</button>
      </div>

      {/* Legend */}
      <div className="cards-legend">
        <span className="cards-legend-item cards-legend-item--over">● Over limit</span>
        <span className="cards-legend-item cards-legend-item--warn">● 80%+ of limit reached</span>
        <span className="cards-legend-item cards-legend-item--good">● Within budget</span>
        <span className="cards-legend-item cards-legend-note">▏80% threshold marker shown on bar</span>
      </div>

      {cards.length > 0 && <SummaryBar cards={cards} />}

      {cards.length === 0 ? (
        <div className="cards-empty">
          <div className="cards-empty-icon">💳</div>
          <p>No cards added yet.</p>
          <p>Click <strong>+ Add Card</strong> to start tracking your spend limits.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {cards.map(card => (
            <CardWidget key={card.id} card={card}
              onAddTx={setAddTxCardId}
              onEditLimit={setEditLimitId}
              onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showAddCard   && <AddCardModal      onSave={handleAddCard}                  onClose={() => setShowAddCard(false)} />}
      {addTxCard     && <AddTransactionModal card={addTxCard} onSave={tx => handleAddTx(addTxCardId, tx)}   onClose={() => setAddTxCardId(null)} />}
      {editLimitCard && <EditLimitModal     card={editLimitCard} onSave={u => handleEditLimit(editLimitId, u)} onClose={() => setEditLimitId(null)} />}
    </div>
  );
}
