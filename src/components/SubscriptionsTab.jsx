import React, { useState, useEffect, useCallback } from 'react';
import { mockSubscriptions } from '../mocks/mockData';

const SUB_CATEGORIES = [
  'Streaming', 'Utilities', 'Insurance', 'Loan / EMI',
  'Investment SIP', 'Health & Fitness', 'Software / SaaS', 'Food & Delivery', 'Other',
];

const EMPTY_SUB_FORM = {
  name: '', amount: '', category: 'Streaming', frequency: 'Monthly', billingDate: '', status: 'Active',
};

export default function SubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState(() => {
    try {
      const stored = localStorage.getItem('wealthSubscriptions');
      return stored ? JSON.parse(stored) : mockSubscriptions;
    } catch { return mockSubscriptions; }
  });
  const [subForm, setSubForm] = useState(EMPTY_SUB_FORM);
  const [subError, setSubError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    localStorage.setItem('wealthSubscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  const addSubscription = useCallback(() => {
    const { name, amount, category, frequency, billingDate, status } = subForm;
    if (!name.trim()) { setSubError('Name is required.'); return; }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setSubError('Enter a valid amount.'); return;
    }
    setSubError('');
    setSubscriptions(prev => [...prev, {
      id: Date.now(),
      name: name.trim(),
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      category, frequency, billingDate, status,
      addedAt: new Date().toLocaleDateString('en-SG'),
    }]);
    setSubForm(EMPTY_SUB_FORM);
  }, [subForm]);

  const removeSubscription = useCallback((id) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    if (editingId === id) setEditingId(null);
  }, [editingId]);

  const toggleSubStatus = useCallback((id) => {
    setSubscriptions(prev => prev.map(s =>
      s.id === id ? { ...s, status: s.status === 'Active' ? 'Paused' : 'Active' } : s
    ));
  }, []);

  const startEdit = useCallback((sub) => {
    setEditingId(sub.id);
    setEditForm({ ...sub, amount: String(sub.amount) });
  }, []);

  const saveEdit = useCallback(() => {
    if (!editForm.name?.trim() || !editForm.amount || parseFloat(editForm.amount) <= 0) return;
    setSubscriptions(prev => prev.map(s =>
      s.id === editingId
        ? { ...s, ...editForm, amount: parseFloat(parseFloat(editForm.amount).toFixed(2)) }
        : s
    ));
    setEditingId(null);
  }, [editingId, editForm]);

  const cancelEdit = useCallback(() => setEditingId(null), []);

  const active = subscriptions.filter(s => s.status === 'Active');
  const paused = subscriptions.filter(s => s.status === 'Paused');
  const monthlyEquiv = active.reduce((sum, s) =>
    sum + (s.frequency === 'Yearly' ? s.amount / 12 : s.amount), 0);
  const yearlyTotal = active.reduce((sum, s) =>
    sum + (s.frequency === 'Yearly' ? s.amount : s.amount * 12), 0);

  return (
    <div className="sub-container">
      <h2 className="section-title">Subscriptions & Scheduled Payments</h2>

      <div className="sub-summary-grid">
        <div className="sub-summary-card">
          <div className="sub-summary-label">Monthly Equivalent (Active)</div>
          <div className="sub-summary-value">SGD {monthlyEquiv.toFixed(2)}</div>
        </div>
        <div className="sub-summary-card">
          <div className="sub-summary-label">Yearly Total (Active)</div>
          <div className="sub-summary-value">SGD {yearlyTotal.toFixed(2)}</div>
        </div>
        <div className="sub-summary-card">
          <div className="sub-summary-label">Active</div>
          <div className="sub-summary-value">{active.length}</div>
        </div>
        <div className="sub-summary-card sub-summary-card--muted">
          <div className="sub-summary-label">Paused</div>
          <div className="sub-summary-value">{paused.length}</div>
        </div>
      </div>

      <div className="info-card sub-add-card">
        <h3>Add Payment</h3>
        <div className="sub-form">
          <input
            className="sub-input"
            placeholder="Name (e.g. Netflix)"
            value={subForm.name}
            onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addSubscription()}
          />
          <input
            className="sub-input sub-input--narrow"
            type="number" min="0" step="0.01"
            placeholder="Amount (SGD)"
            value={subForm.amount}
            onChange={e => setSubForm(f => ({ ...f, amount: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addSubscription()}
          />
          <select className="sub-select" value={subForm.category}
            onChange={e => setSubForm(f => ({ ...f, category: e.target.value }))}>
            {SUB_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="sub-select sub-select--narrow" value={subForm.frequency}
            onChange={e => setSubForm(f => ({ ...f, frequency: e.target.value }))}>
            <option>Monthly</option>
            <option>Yearly</option>
          </select>
          <input
            className="sub-input sub-input--narrow"
            type="number" min="1" max="31"
            placeholder="Billing day (1–31)"
            value={subForm.billingDate}
            onChange={e => setSubForm(f => ({ ...f, billingDate: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addSubscription()}
          />
          <select className="sub-select sub-select--narrow" value={subForm.status}
            onChange={e => setSubForm(f => ({ ...f, status: e.target.value }))}>
            <option>Active</option>
            <option>Paused</option>
          </select>
          <button className="sub-add-btn" onClick={addSubscription}
            disabled={!subForm.name.trim() || !subForm.amount}>
            + Add
          </button>
        </div>
        {subError && <div className="sub-error">{subError}</div>}
      </div>

      <div className="info-card" style={{ marginTop: '20px' }}>
        <h3>All Payments ({subscriptions.length})</h3>
        {subscriptions.length === 0 ? (
          <div className="sub-empty">No payments added yet. Use the form above to add your first one.</div>
        ) : (
          <table className="holdings-table sub-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Amount (SGD)</th>
                <th>Frequency</th>
                <th>Billing Day</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(s => editingId === s.id ? (
                <tr key={s.id} className="sub-edit-row">
                  <td>
                    <input className="sub-inline-input" value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                  </td>
                  <td>
                    <select className="sub-inline-select" value={editForm.category}
                      onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                      {SUB_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </td>
                  <td>
                    <input className="sub-inline-input sub-inline-input--narrow"
                      type="number" min="0" step="0.01" value={editForm.amount}
                      onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))} />
                  </td>
                  <td>
                    <select className="sub-inline-select" value={editForm.frequency}
                      onChange={e => setEditForm(f => ({ ...f, frequency: e.target.value }))}>
                      <option>Monthly</option>
                      <option>Yearly</option>
                    </select>
                  </td>
                  <td>
                    <input className="sub-inline-input sub-inline-input--narrow"
                      type="number" min="1" max="31" placeholder="1–31" value={editForm.billingDate}
                      onChange={e => setEditForm(f => ({ ...f, billingDate: e.target.value }))} />
                  </td>
                  <td>
                    <select className="sub-inline-select" value={editForm.status}
                      onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                      <option>Active</option>
                      <option>Paused</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="sub-save-btn" onClick={saveEdit}>Save</button>
                    <button className="sub-cancel-btn" onClick={cancelEdit}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={s.id} className={s.status === 'Paused' ? 'sub-row-paused' : ''}>
                  <td className="sub-name">{s.name}</td>
                  <td><span className="sub-category-badge">{s.category}</span></td>
                  <td className="sub-amount">SGD {s.amount.toFixed(2)}</td>
                  <td>
                    <span className={`sub-freq-badge sub-freq-badge--${s.frequency === 'Monthly' ? 'monthly' : 'yearly'}`}>
                      {s.frequency}
                    </span>
                  </td>
                  <td className="sub-billing-day">{s.billingDate ? `Day ${s.billingDate}` : '—'}</td>
                  <td>
                    <button
                      className={`sub-status-btn ${s.status === 'Active' ? 'sub-status-btn--active' : 'sub-status-btn--paused'}`}
                      onClick={() => toggleSubStatus(s.id)} title="Click to toggle">
                      {s.status}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="sub-edit-btn" onClick={() => startEdit(s)}>Edit</button>
                    <button className="watchlist-remove-btn" onClick={() => removeSubscription(s.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
