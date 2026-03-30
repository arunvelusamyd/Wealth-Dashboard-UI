import React, { useState } from 'react';
import { DEV_MODE } from '../config/devConfig';
import { mockTransferAccounts, mockRecentTransfers } from '../mocks/mockData';

// ── Constants ─────────────────────────────────────────────────────────────────

const TRANSFER_TYPES = [
  { id: 'own',      label: 'Own Account',      icon: '↔',  desc: 'Between your accounts'           },
  { id: 'paynow',  label: 'PayNow',            icon: '⚡', desc: 'Mobile, NRIC/FIN, UEN, VPA'      },
  { id: 'fast',    label: 'Local Transfer',    icon: '🏦', desc: 'FAST to any Singapore bank'       },
  { id: 'giro',    label: 'GIRO / Recurring',  icon: '🔄', desc: 'Scheduled recurring payments'     },
  { id: 'intl',    label: 'International (TT)',icon: '🌐', desc: 'SWIFT wire to overseas accounts'  },
  { id: 'bill',    label: 'Bill Payment',      icon: '🧾', desc: 'Utilities, telco, government'     },
];

const SINGAPORE_BANKS = [
  'DBS / POSB', 'UOB', 'OCBC', 'Standard Chartered', 'Citibank',
  'HSBC', 'Maybank', 'Bank of China', 'CIMB', 'RHB', 'SBI',
];

const CURRENCIES = ['SGD', 'USD', 'EUR', 'GBP', 'AUD', 'JPY', 'HKD', 'CNY', 'INR', 'MYR'];

const BILL_BILLERS = [
  { group: 'Utilities',    items: ['SP Group (Electricity & Gas)', 'PUB (Water)', 'City Energy'] },
  { group: 'Telecom',      items: ['Singtel', 'StarHub', 'M1', 'TPG', 'Circles.Life'] },
  { group: 'Government',   items: ['IRAS (Tax)', 'HDB (Loan / Conservancy)', 'CPF Board', 'LTA (Fines)', 'SLA', 'MOH (MediShield Life)'] },
  { group: 'Credit Cards', items: ['DBS Card', 'UOB Card', 'OCBC Card', 'Citibank Card', 'Standard Chartered Card', 'American Express'] },
  { group: 'Insurance',    items: ['Great Eastern', 'Prudential', 'AIA', 'Manulife', 'Income Insurance'] },
];

const PAYNOW_TYPES = [
  { id: 'mobile', label: 'Mobile Number',  placeholder: '+65 9XXX XXXX'        },
  { id: 'nric',   label: 'NRIC / FIN',     placeholder: 'SXXXXXXXX'            },
  { id: 'uen',    label: 'UEN (Business)', placeholder: 'XXXXXXXXX'            },
  { id: 'vpa',    label: 'VPA / PayID',    placeholder: 'yourname@bank'        },
];

const GIRO_FREQUENCIES = ['Weekly', 'Fortnightly', 'Monthly', 'Quarterly', 'Half-yearly', 'Yearly'];

// ── Helper ────────────────────────────────────────────────────────────────────

const fmt = (n) => Number(n).toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function nextWeekStr() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TypeSelector({ onSelect }) {
  return (
    <div className="ft-type-grid">
      {TRANSFER_TYPES.map(t => (
        <button key={t.id} className="ft-type-card" onClick={() => onSelect(t)}>
          <span className="ft-type-icon">{t.icon}</span>
          <span className="ft-type-label">{t.label}</span>
          <span className="ft-type-desc">{t.desc}</span>
        </button>
      ))}
    </div>
  );
}

// ── Form: Own Account ─────────────────────────────────────────────────────────

function OwnAccountForm({ accounts, onReview }) {
  const [form, setForm] = useState({ fromId: '', toId: '', amount: '', note: '' });
  const [err, setErr]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.fromId) return setErr('Select a source account.');
    if (!form.toId)   return setErr('Select a destination account.');
    if (form.fromId === form.toId) return setErr('Source and destination must differ.');
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return setErr('Enter a valid amount.');
    const from = accounts.find(a => a.id === form.fromId);
    if (from && amt > from.balance) return setErr(`Insufficient funds. Available: SGD ${fmt(from.balance)}`);
    setErr('');
    const to = accounts.find(a => a.id === form.toId);
    onReview({
      type: 'own', fromAcct: from, toAcct: to,
      amount: amt, currency: 'SGD', note: form.note,
      summary: `${from.label} → ${to.label}`,
    });
  };

  const otherAccounts = accounts.filter(a => a.id !== form.fromId);

  return (
    <div className="ft-form">
      <label className="ft-label">From Account</label>
      <select className="ft-select" value={form.fromId} onChange={e => set('fromId', e.target.value)}>
        <option value="">— Select account —</option>
        {accounts.map(a => (
          <option key={a.id} value={a.id}>{a.label} — SGD {fmt(a.balance)}</option>
        ))}
      </select>

      <label className="ft-label">To Account</label>
      <select className="ft-select" value={form.toId} onChange={e => set('toId', e.target.value)}>
        <option value="">— Select account —</option>
        {otherAccounts.map(a => (
          <option key={a.id} value={a.id}>{a.label} — SGD {fmt(a.balance)}</option>
        ))}
      </select>

      <label className="ft-label">Amount (SGD)</label>
      <input className="ft-input" type="number" min="0.01" step="0.01" placeholder="0.00"
        value={form.amount} onChange={e => set('amount', e.target.value)} />

      <label className="ft-label">Note (optional)</label>
      <input className="ft-input" type="text" maxLength={100} placeholder="Reference or note"
        value={form.note} onChange={e => set('note', e.target.value)} />

      {err && <div className="ft-error">{err}</div>}
      <button className="ft-btn-primary" onClick={submit}>Review Transfer</button>
    </div>
  );
}

// ── Form: PayNow ──────────────────────────────────────────────────────────────

function PayNowForm({ accounts, onReview }) {
  const [pnType, setPnType] = useState('mobile');
  const [form, setForm] = useState({ fromId: '', recipient: '', amount: '', note: '' });
  const [err, setErr] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const placeholder = PAYNOW_TYPES.find(p => p.id === pnType)?.placeholder || '';

  const submit = () => {
    if (!form.fromId)    return setErr('Select a source account.');
    if (!form.recipient) return setErr('Enter PayNow identifier.');
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return setErr('Enter a valid amount.');
    const from = accounts.find(a => a.id === form.fromId);
    if (from && amt > from.balance) return setErr(`Insufficient funds. Available: SGD ${fmt(from.balance)}`);
    setErr('');
    onReview({
      type: 'paynow', fromAcct: from,
      payNowType: PAYNOW_TYPES.find(p => p.id === pnType)?.label,
      recipient: form.recipient,
      amount: amt, currency: 'SGD', note: form.note,
      summary: `PayNow → ${form.recipient}`,
    });
  };

  return (
    <div className="ft-form">
      <label className="ft-label">From Account</label>
      <select className="ft-select" value={form.fromId} onChange={e => set('fromId', e.target.value)}>
        <option value="">— Select account —</option>
        {accounts.map(a => (
          <option key={a.id} value={a.id}>{a.label} — SGD {fmt(a.balance)}</option>
        ))}
      </select>

      <label className="ft-label">PayNow Type</label>
      <div className="ft-pill-row">
        {PAYNOW_TYPES.map(p => (
          <button key={p.id}
            className={`ft-pill${pnType === p.id ? ' active' : ''}`}
            onClick={() => { setPnType(p.id); set('recipient', ''); }}>
            {p.label}
          </button>
        ))}
      </div>

      <label className="ft-label">
        {PAYNOW_TYPES.find(p => p.id === pnType)?.label}
      </label>
      <input className="ft-input" type="text" placeholder={placeholder}
        value={form.recipient} onChange={e => set('recipient', e.target.value)} />

      <label className="ft-label">Amount (SGD)</label>
      <input className="ft-input" type="number" min="0.01" step="0.01" placeholder="0.00"
        value={form.amount} onChange={e => set('amount', e.target.value)} />

      <label className="ft-label">Note (optional)</label>
      <input className="ft-input" type="text" maxLength={100} placeholder="Reference or note"
        value={form.note} onChange={e => set('note', e.target.value)} />

      {err && <div className="ft-error">{err}</div>}
      <button className="ft-btn-primary" onClick={submit}>Review Transfer</button>
    </div>
  );
}

// ── Form: Local FAST ──────────────────────────────────────────────────────────

function FastForm({ accounts, onReview }) {
  const [form, setForm] = useState({ fromId: '', bank: '', acctNo: '', name: '', amount: '', note: '' });
  const [err, setErr] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.fromId) return setErr('Select a source account.');
    if (!form.bank)   return setErr('Select destination bank.');
    if (!form.acctNo) return setErr('Enter account number.');
    if (!form.name)   return setErr('Enter account holder name.');
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return setErr('Enter a valid amount.');
    const from = accounts.find(a => a.id === form.fromId);
    if (from && amt > from.balance) return setErr(`Insufficient funds. Available: SGD ${fmt(from.balance)}`);
    setErr('');
    onReview({
      type: 'fast', fromAcct: from,
      bank: form.bank, acctNo: form.acctNo, beneficiaryName: form.name,
      amount: amt, currency: 'SGD', note: form.note,
      summary: `FAST → ${form.bank} ****${form.acctNo.slice(-4)}`,
    });
  };

  return (
    <div className="ft-form">
      <label className="ft-label">From Account</label>
      <select className="ft-select" value={form.fromId} onChange={e => set('fromId', e.target.value)}>
        <option value="">— Select account —</option>
        {accounts.map(a => (
          <option key={a.id} value={a.id}>{a.label} — SGD {fmt(a.balance)}</option>
        ))}
      </select>

      <label className="ft-label">Destination Bank</label>
      <select className="ft-select" value={form.bank} onChange={e => set('bank', e.target.value)}>
        <option value="">— Select bank —</option>
        {SINGAPORE_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
      </select>

      <label className="ft-label">Account Number</label>
      <input className="ft-input" type="text" placeholder="e.g. 1234567890"
        value={form.acctNo} onChange={e => set('acctNo', e.target.value)} />

      <label className="ft-label">Account Holder Name</label>
      <input className="ft-input" type="text" placeholder="Full name as registered"
        value={form.name} onChange={e => set('name', e.target.value)} />

      <label className="ft-label">Amount (SGD)</label>
      <input className="ft-input" type="number" min="0.01" step="0.01" placeholder="0.00"
        value={form.amount} onChange={e => set('amount', e.target.value)} />

      <label className="ft-label">Note (optional)</label>
      <input className="ft-input" type="text" maxLength={100} placeholder="Reference"
        value={form.note} onChange={e => set('note', e.target.value)} />

      {err && <div className="ft-error">{err}</div>}
      <button className="ft-btn-primary" onClick={submit}>Review Transfer</button>
    </div>
  );
}

// ── Form: GIRO / Recurring ────────────────────────────────────────────────────

function GiroForm({ accounts, onReview }) {
  const [form, setForm] = useState({
    fromId: '', bank: '', acctNo: '', name: '', amount: '',
    frequency: 'Monthly', startDate: nextWeekStr(), note: '',
  });
  const [err, setErr] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.fromId) return setErr('Select a source account.');
    if (!form.bank)   return setErr('Select destination bank.');
    if (!form.acctNo) return setErr('Enter account number.');
    if (!form.name)   return setErr('Enter account holder name.');
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return setErr('Enter a valid amount.');
    setErr('');
    const from = accounts.find(a => a.id === form.fromId);
    onReview({
      type: 'giro', fromAcct: from,
      bank: form.bank, acctNo: form.acctNo, beneficiaryName: form.name,
      amount: amt, currency: 'SGD',
      frequency: form.frequency, startDate: form.startDate, note: form.note,
      summary: `GIRO ${form.frequency} → ${form.bank}`,
    });
  };

  return (
    <div className="ft-form">
      <label className="ft-label">From Account</label>
      <select className="ft-select" value={form.fromId} onChange={e => set('fromId', e.target.value)}>
        <option value="">— Select account —</option>
        {accounts.map(a => (
          <option key={a.id} value={a.id}>{a.label} — SGD {fmt(a.balance)}</option>
        ))}
      </select>

      <label className="ft-label">Destination Bank</label>
      <select className="ft-select" value={form.bank} onChange={e => set('bank', e.target.value)}>
        <option value="">— Select bank —</option>
        {SINGAPORE_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
      </select>

      <label className="ft-label">Account Number</label>
      <input className="ft-input" type="text" placeholder="e.g. 1234567890"
        value={form.acctNo} onChange={e => set('acctNo', e.target.value)} />

      <label className="ft-label">Account Holder Name</label>
      <input className="ft-input" type="text" placeholder="Full name"
        value={form.name} onChange={e => set('name', e.target.value)} />

      <div className="ft-two-col">
        <div>
          <label className="ft-label">Amount (SGD)</label>
          <input className="ft-input" type="number" min="0.01" step="0.01" placeholder="0.00"
            value={form.amount} onChange={e => set('amount', e.target.value)} />
        </div>
        <div>
          <label className="ft-label">Frequency</label>
          <select className="ft-select" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
            {GIRO_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>

      <label className="ft-label">First Payment Date</label>
      <input className="ft-input" type="date" value={form.startDate} min={todayStr()}
        onChange={e => set('startDate', e.target.value)} />

      <label className="ft-label">Reference (optional)</label>
      <input className="ft-input" type="text" maxLength={100} placeholder="e.g. Rent"
        value={form.note} onChange={e => set('note', e.target.value)} />

      {err && <div className="ft-error">{err}</div>}
      <button className="ft-btn-primary" onClick={submit}>Set Up GIRO</button>
    </div>
  );
}

// ── Form: International TT ────────────────────────────────────────────────────

function IntlForm({ accounts, onReview }) {
  const [form, setForm] = useState({
    fromId: '', currency: 'USD', amount: '',
    beneficiaryName: '', bankName: '', swift: '', acctNo: '', bankAddress: '',
    note: '',
  });
  const [err, setErr] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.fromId)          return setErr('Select a source account.');
    if (!form.beneficiaryName) return setErr('Enter beneficiary name.');
    if (!form.bankName)        return setErr('Enter beneficiary bank name.');
    if (!form.swift)           return setErr('Enter SWIFT / BIC code.');
    if (!form.acctNo)          return setErr('Enter account / IBAN number.');
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0)      return setErr('Enter a valid amount.');
    setErr('');
    const from = accounts.find(a => a.id === form.fromId);
    onReview({
      type: 'intl', fromAcct: from,
      currency: form.currency, amount: amt,
      beneficiaryName: form.beneficiaryName,
      bankName: form.bankName, swift: form.swift, acctNo: form.acctNo,
      bankAddress: form.bankAddress, note: form.note,
      summary: `TT ${form.currency} ${fmt(amt)} → ${form.beneficiaryName}`,
    });
  };

  return (
    <div className="ft-form">
      <div className="ft-info-banner">
        International transfers are subject to bank processing times (1–3 business days) and correspondent bank fees.
      </div>

      <label className="ft-label">From Account</label>
      <select className="ft-select" value={form.fromId} onChange={e => set('fromId', e.target.value)}>
        <option value="">— Select account —</option>
        {accounts.map(a => (
          <option key={a.id} value={a.id}>{a.label} — SGD {fmt(a.balance)}</option>
        ))}
      </select>

      <div className="ft-two-col">
        <div>
          <label className="ft-label">Currency</label>
          <select className="ft-select" value={form.currency} onChange={e => set('currency', e.target.value)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="ft-label">Amount</label>
          <input className="ft-input" type="number" min="0.01" step="0.01" placeholder="0.00"
            value={form.amount} onChange={e => set('amount', e.target.value)} />
        </div>
      </div>

      <label className="ft-label">Beneficiary Name</label>
      <input className="ft-input" type="text" placeholder="Full name or company"
        value={form.beneficiaryName} onChange={e => set('beneficiaryName', e.target.value)} />

      <label className="ft-label">Beneficiary Bank Name</label>
      <input className="ft-input" type="text" placeholder="e.g. HDFC Bank"
        value={form.bankName} onChange={e => set('bankName', e.target.value)} />

      <div className="ft-two-col">
        <div>
          <label className="ft-label">SWIFT / BIC Code</label>
          <input className="ft-input" type="text" placeholder="e.g. HDFCINBB"
            value={form.swift} onChange={e => set('swift', e.target.value.toUpperCase())} />
        </div>
        <div>
          <label className="ft-label">Account / IBAN</label>
          <input className="ft-input" type="text" placeholder="Account or IBAN number"
            value={form.acctNo} onChange={e => set('acctNo', e.target.value)} />
        </div>
      </div>

      <label className="ft-label">Bank Address (optional)</label>
      <input className="ft-input" type="text" placeholder="Bank branch address"
        value={form.bankAddress} onChange={e => set('bankAddress', e.target.value)} />

      <label className="ft-label">Purpose / Reference</label>
      <input className="ft-input" type="text" maxLength={140} placeholder="e.g. Family support"
        value={form.note} onChange={e => set('note', e.target.value)} />

      {err && <div className="ft-error">{err}</div>}
      <button className="ft-btn-primary" onClick={submit}>Review Transfer</button>
    </div>
  );
}

// ── Form: Bill Payment ────────────────────────────────────────────────────────

function BillForm({ accounts, onReview }) {
  const [form, setForm] = useState({ fromId: '', billerGroup: '', biller: '', refNo: '', amount: '', note: '' });
  const [err, setErr] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const billersInGroup = BILL_BILLERS.find(g => g.group === form.billerGroup)?.items || [];

  const submit = () => {
    if (!form.fromId) return setErr('Select a source account.');
    if (!form.biller) return setErr('Select a biller.');
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return setErr('Enter a valid amount.');
    const from = accounts.find(a => a.id === form.fromId);
    if (from && amt > from.balance) return setErr(`Insufficient funds. Available: SGD ${fmt(from.balance)}`);
    setErr('');
    onReview({
      type: 'bill', fromAcct: from,
      biller: form.biller, refNo: form.refNo,
      amount: amt, currency: 'SGD', note: form.note,
      summary: `Bill → ${form.biller}`,
    });
  };

  return (
    <div className="ft-form">
      <label className="ft-label">From Account</label>
      <select className="ft-select" value={form.fromId} onChange={e => set('fromId', e.target.value)}>
        <option value="">— Select account —</option>
        {accounts.map(a => (
          <option key={a.id} value={a.id}>{a.label} — SGD {fmt(a.balance)}</option>
        ))}
      </select>

      <label className="ft-label">Category</label>
      <select className="ft-select" value={form.billerGroup}
        onChange={e => { set('billerGroup', e.target.value); set('biller', ''); }}>
        <option value="">— Select category —</option>
        {BILL_BILLERS.map(g => <option key={g.group} value={g.group}>{g.group}</option>)}
      </select>

      {form.billerGroup && (
        <>
          <label className="ft-label">Biller</label>
          <select className="ft-select" value={form.biller} onChange={e => set('biller', e.target.value)}>
            <option value="">— Select biller —</option>
            {billersInGroup.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </>
      )}

      <label className="ft-label">Reference / Account Number</label>
      <input className="ft-input" type="text" placeholder="Bill reference or account number"
        value={form.refNo} onChange={e => set('refNo', e.target.value)} />

      <label className="ft-label">Amount (SGD)</label>
      <input className="ft-input" type="number" min="0.01" step="0.01" placeholder="0.00"
        value={form.amount} onChange={e => set('amount', e.target.value)} />

      <label className="ft-label">Note (optional)</label>
      <input className="ft-input" type="text" maxLength={100} placeholder="Reference"
        value={form.note} onChange={e => set('note', e.target.value)} />

      {err && <div className="ft-error">{err}</div>}
      <button className="ft-btn-primary" onClick={submit}>Review Payment</button>
    </div>
  );
}

// ── Review Screen ─────────────────────────────────────────────────────────────

function ReviewScreen({ data, onConfirm, onBack }) {
  const rows = buildReviewRows(data);
  return (
    <div className="ft-review">
      <h3 className="ft-review-title">Review Transfer</h3>
      <div className="ft-review-table">
        {rows.map(r => (
          <div key={r.label} className="ft-review-row">
            <span className="ft-review-label">{r.label}</span>
            <span className="ft-review-value">{r.value}</span>
          </div>
        ))}
      </div>
      <div className="ft-review-amount">
        {data.currency} {fmt(data.amount)}
      </div>
      <div className="ft-review-disclaimer">
        Please verify all details before confirming. Transfers cannot be recalled once processed.
      </div>
      <div className="ft-btn-row">
        <button className="ft-btn-secondary" onClick={onBack}>Back</button>
        <button className="ft-btn-primary" onClick={onConfirm}>Confirm &amp; Transfer</button>
      </div>
    </div>
  );
}

function buildReviewRows(data) {
  const rows = [];
  if (data.fromAcct) rows.push({ label: 'From',      value: data.fromAcct.label });
  if (data.toAcct)   rows.push({ label: 'To',        value: data.toAcct.label });
  if (data.payNowType) rows.push({ label: 'PayNow Type', value: data.payNowType });
  if (data.recipient) rows.push({ label: 'Recipient', value: data.recipient });
  if (data.beneficiaryName) rows.push({ label: 'Beneficiary', value: data.beneficiaryName });
  if (data.bank)     rows.push({ label: 'Bank',       value: data.bank });
  if (data.bankName) rows.push({ label: 'Bank',       value: data.bankName });
  if (data.swift)    rows.push({ label: 'SWIFT / BIC', value: data.swift });
  if (data.acctNo)   rows.push({ label: 'Account No', value: `****${data.acctNo.slice(-4)}` });
  if (data.biller)   rows.push({ label: 'Biller',     value: data.biller });
  if (data.refNo)    rows.push({ label: 'Reference',  value: data.refNo });
  if (data.frequency) rows.push({ label: 'Frequency', value: data.frequency });
  if (data.startDate) rows.push({ label: 'Start Date', value: data.startDate });
  if (data.note)     rows.push({ label: 'Note',       value: data.note });
  rows.push({ label: 'Transfer Type', value: TRANSFER_TYPES.find(t => t.id === data.type)?.label || data.type });
  return rows;
}

// ── Success Screen ────────────────────────────────────────────────────────────

function SuccessScreen({ data, onDone }) {
  const ref = `TXN${Date.now().toString().slice(-8).toUpperCase()}`;
  return (
    <div className="ft-success">
      <div className="ft-success-icon">✓</div>
      <h3 className="ft-success-title">Transfer Submitted</h3>
      <p className="ft-success-desc">{data.summary}</p>
      <div className="ft-success-amount">{data.currency} {fmt(data.amount)}</div>
      <div className="ft-success-ref">Reference: {ref}</div>
      <p className="ft-success-note">
        {data.type === 'intl'
          ? 'International transfers are processed within 1–3 business days.'
          : data.type === 'giro'
          ? `Your GIRO will start on ${data.startDate}.`
          : 'Funds are typically credited within minutes via FAST.'}
      </p>
      <button className="ft-btn-primary" onClick={onDone}>Make Another Transfer</button>
    </div>
  );
}

// ── Recent Transfers ──────────────────────────────────────────────────────────

function RecentTransfers({ transfers }) {
  if (!transfers.length) return null;
  return (
    <div className="ft-recent">
      <h3 className="ft-recent-title">Recent Transfers</h3>
      <div className="ft-recent-list">
        {transfers.map(t => (
          <div key={t.id} className="ft-recent-row">
            <div className="ft-recent-icon">{TRANSFER_TYPES.find(x => x.id === t.type)?.icon || '↔'}</div>
            <div className="ft-recent-info">
              <div className="ft-recent-name">{t.summary}</div>
              <div className="ft-recent-meta">{t.date} · {t.status}</div>
            </div>
            <div className={`ft-recent-amount ${t.status === 'Failed' ? 'ft-red' : ''}`}>
              {t.currency} {fmt(t.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function FundTransferTab() {
  const accounts = DEV_MODE ? mockTransferAccounts : [];
  const recentTransfers = DEV_MODE ? mockRecentTransfers : [];

  const [selectedType, setSelectedType] = useState(null); // null = type picker
  const [stage, setStage] = useState('form');             // 'form' | 'review' | 'success'
  const [reviewData, setReviewData] = useState(null);

  const handleTypeSelect = (t) => {
    setSelectedType(t);
    setStage('form');
    setReviewData(null);
  };

  const handleReview = (data) => {
    setReviewData(data);
    setStage('review');
  };

  const handleConfirm = () => {
    setStage('success');
  };

  const handleDone = () => {
    setSelectedType(null);
    setStage('form');
    setReviewData(null);
  };

  const renderForm = () => {
    if (!selectedType) return null;
    switch (selectedType.id) {
      case 'own':    return <OwnAccountForm accounts={accounts} onReview={handleReview} />;
      case 'paynow': return <PayNowForm accounts={accounts} onReview={handleReview} />;
      case 'fast':   return <FastForm accounts={accounts} onReview={handleReview} />;
      case 'giro':   return <GiroForm accounts={accounts} onReview={handleReview} />;
      case 'intl':   return <IntlForm accounts={accounts} onReview={handleReview} />;
      case 'bill':   return <BillForm accounts={accounts} onReview={handleReview} />;
      default:       return null;
    }
  };

  return (
    <div className="ft-container">
      <div className="ft-main">
        {/* Header / breadcrumb */}
        <div className="ft-header">
          {selectedType ? (
            <button className="ft-back-btn" onClick={() => { setSelectedType(null); setStage('form'); }}>
              ← Back
            </button>
          ) : null}
          <h2 className="ft-page-title">
            {selectedType
              ? `${selectedType.icon} ${selectedType.label}`
              : 'Fund Transfer'}
          </h2>
        </div>

        {/* Stage rendering */}
        {!selectedType && (
          <TypeSelector onSelect={handleTypeSelect} />
        )}

        {selectedType && stage === 'form' && renderForm()}

        {selectedType && stage === 'review' && reviewData && (
          <ReviewScreen
            data={reviewData}
            onConfirm={handleConfirm}
            onBack={() => setStage('form')}
          />
        )}

        {selectedType && stage === 'success' && reviewData && (
          <SuccessScreen data={reviewData} onDone={handleDone} />
        )}
      </div>

      {/* Recent transfers sidebar */}
      {(!selectedType || stage === 'form') && (
        <RecentTransfers transfers={recentTransfers} />
      )}
    </div>
  );
}
