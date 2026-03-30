// Mock data mirroring the exact JSON structures returned by the Spring Boot backend.
// Automatically used when the API or Keycloak is unreachable.
// Set MOCK_MODE = true in App.js to always use this data during development.

// ── Mock Cards (March 2026, demonstrates all 3 spend statuses) ────────────────
// Card 1 (DBS): ~SGD 2,150 / 2,000 limit → RED  (over limit)
// Card 2 (UOB): ~SGD 1,680 / 2,000 limit → AMBER (≥80%, day 30/31 = 97% of month)
// Card 3 (OCBC): ~SGD 680 / 1,500 limit → GREEN (45%)
// Card 4 (SC, weekly): ~SGD 380 / 500 limit → GREEN (76%)

export const mockCards = [
  {
    id: 'card-1',
    name: 'DBS Live Fresh',
    bank: 'DBS',
    lastFour: '4521',
    cardType: 'Visa',
    limitType: 'monthly',
    limitAmount: 2000,
    transactions: [
      { id: 'c1t1',  description: 'Cold Storage',      amount: 200.00, date: '2026-03-01', category: 'Shopping'      },
      { id: 'c1t2',  description: 'Grab Food',         amount: 180.00, date: '2026-03-03', category: 'Food & Dining' },
      { id: 'c1t3',  description: 'Koi Bubble Tea',    amount: 45.00,  date: '2026-03-05', category: 'Food & Dining' },
      { id: 'c1t4',  description: 'Shopee',            amount: 320.00, date: '2026-03-07', category: 'Shopping'      },
      { id: 'c1t5',  description: 'NTUC FairPrice',    amount: 90.00,  date: '2026-03-09', category: 'Shopping'      },
      { id: 'c1t6',  description: 'Grab',              amount: 25.00,  date: '2026-03-11', category: 'Transport'     },
      { id: 'c1t7',  description: 'Zalora',            amount: 280.00, date: '2026-03-13', category: 'Shopping'      },
      { id: 'c1t8',  description: 'Restaurant',        amount: 150.00, date: '2026-03-15', category: 'Food & Dining' },
      { id: 'c1t9',  description: 'Uniqlo',            amount: 120.00, date: '2026-03-17', category: 'Shopping'      },
      { id: 'c1t10', description: 'Electricity Bill',  amount: 85.00,  date: '2026-03-19', category: 'Utilities'     },
      { id: 'c1t11', description: 'Gym Membership',    amount: 95.00,  date: '2026-03-21', category: 'Healthcare'    },
      { id: 'c1t12', description: 'Date Night',        amount: 75.00,  date: '2026-03-23', category: 'Food & Dining' },
      { id: 'c1t13', description: 'Lazada',            amount: 260.00, date: '2026-03-25', category: 'Shopping'      },
      { id: 'c1t14', description: 'Weekend brunch',    amount: 225.00, date: '2026-03-28', category: 'Food & Dining' },
    ],
  },
  {
    id: 'card-2',
    name: 'UOB One Card',
    bank: 'UOB',
    lastFour: '8834',
    cardType: 'Mastercard',
    limitType: 'monthly',
    limitAmount: 2000,
    transactions: [
      { id: 'c2t1',  description: 'IKEA',              amount: 150.00, date: '2026-03-02', category: 'Shopping'      },
      { id: 'c2t2',  description: 'Grab Food',         amount: 89.00,  date: '2026-03-04', category: 'Food & Dining' },
      { id: 'c2t3',  description: 'H&M',               amount: 320.00, date: '2026-03-06', category: 'Shopping'      },
      { id: 'c2t4',  description: 'MRT Top-Up',        amount: 45.00,  date: '2026-03-08', category: 'Transport'     },
      { id: 'c2t5',  description: 'Spotify',           amount: 180.00, date: '2026-03-10', category: 'Entertainment' },
      { id: 'c2t6',  description: 'Watsons',           amount: 95.00,  date: '2026-03-12', category: 'Healthcare'    },
      { id: 'c2t7',  description: 'BreadTalk',         amount: 260.00, date: '2026-03-14', category: 'Food & Dining' },
      { id: 'c2t8',  description: 'Cathay Cinema',     amount: 120.00, date: '2026-03-17', category: 'Entertainment' },
      { id: 'c2t9',  description: 'Guardian',          amount: 75.00,  date: '2026-03-20', category: 'Healthcare'    },
      { id: 'c2t10', description: 'Foodpanda',         amount: 80.00,  date: '2026-03-23', category: 'Food & Dining' },
      { id: 'c2t11', description: 'Amazon SG',         amount: 45.00,  date: '2026-03-26', category: 'Shopping'      },
      { id: 'c2t12', description: 'Hawker dinner',     amount: 221.00, date: '2026-03-29', category: 'Food & Dining' },
    ],
  },
  {
    id: 'card-3',
    name: 'OCBC 365',
    bank: 'OCBC',
    lastFour: '2271',
    cardType: 'Visa',
    limitType: 'monthly',
    limitAmount: 1500,
    transactions: [
      { id: 'c3t1', description: 'Shell Petrol',       amount: 95.00,  date: '2026-03-05', category: 'Transport'     },
      { id: 'c3t2', description: 'NTUC FairPrice',     amount: 180.00, date: '2026-03-10', category: 'Shopping'      },
      { id: 'c3t3', description: 'Coffee Bean',        amount: 45.00,  date: '2026-03-14', category: 'Food & Dining' },
      { id: 'c3t4', description: 'Singtel Bill',       amount: 120.00, date: '2026-03-17', category: 'Utilities'     },
      { id: 'c3t5', description: 'Ya Kun Kaya Toast',  amount: 80.00,  date: '2026-03-21', category: 'Food & Dining' },
      { id: 'c3t6', description: 'Grab',               amount: 55.00,  date: '2026-03-24', category: 'Transport'     },
      { id: 'c3t7', description: 'Popular Bookstore',  amount: 105.00, date: '2026-03-28', category: 'Shopping'      },
    ],
  },
  {
    id: 'card-4',
    name: 'SC Simply Cash',
    bank: 'Standard Chartered',
    lastFour: '9103',
    cardType: 'Visa',
    limitType: 'weekly',
    limitAmount: 500,
    transactions: [
      { id: 'c4t1', description: 'Grab Food',          amount: 100.00, date: '2026-03-24', category: 'Food & Dining' },
      { id: 'c4t2', description: 'Starbucks',          amount: 85.00,  date: '2026-03-25', category: 'Food & Dining' },
      { id: 'c4t3', description: 'Uniqlo',             amount: 65.00,  date: '2026-03-26', category: 'Shopping'      },
      { id: 'c4t4', description: 'MRT Top-Up',         amount: 45.00,  date: '2026-03-27', category: 'Transport'     },
      { id: 'c4t5', description: 'Dinner',             amount: 85.00,  date: '2026-03-28', category: 'Food & Dining' },
    ],
  },
];

export const mockBanks = [
  { code: 'SC',   name: 'Standard Chartered', color: '#0099A8', available: true },
  { code: 'UOB',  name: 'United Overseas Bank', color: '#005DAA', available: true },
  { code: 'OCBC', name: 'OCBC Bank',            color: '#E30613', available: true },
  { code: 'DBS',  name: 'DBS Bank',             color: '#E50012', available: true },
];

// ── Standard Chartered ────────────────────────────────────────────────────────

const scStocks = {
  data: [
    { date: '31/08/2022', shortRegionCode: 'US', code: 'TSLA', PT: '2', last: 443.21, exRate: 1.2835, amt: 21340.46, name: 'TESLA ORD',                  profit: -101.16, qty: 48,  mkt: 'NMS', ccy: 'USD', acct: '123456789' },
    { date: '19/02/2021', shortRegionCode: 'US', code: 'CRSP', PT: '2', last:  63.77, exRate: 1.2835, amt:  2539.35, name: 'CRISPR THERAPEUTICS ORD',    profit: -1584.36, qty: 15, mkt: 'NMS', ccy: 'USD', acct: '123456789' },
    { date: '22/11/2021', shortRegionCode: 'US', code: 'PYPL', PT: '2', last:  69.68, exRate: 1.2835, amt:  2459.48, name: 'PAYPAL HOLDINGS ORD',        profit: -1763.82, qty: 10, mkt: 'NMS', ccy: 'USD', acct: '123456789' },
    { date: '24/11/2021', shortRegionCode: 'US', code: 'DIS',  PT: '2', last: 114.78, exRate: 1.2835, amt:  2173.47, name: 'WALT DISNEY ORD',            profit:  -683.78, qty: 13, mkt: 'NYS', ccy: 'USD', acct: '123456789' },
    { date: '17/06/2021', shortRegionCode: 'US', code: 'ABNB', PT: '2', last: 122.92, exRate: 1.2835, amt:  3243.31, name: 'AIRBNB CL A ORD',            profit:  -788.93, qty: 20, mkt: 'NMS', ccy: 'USD', acct: '123456789' },
    { date: '14/06/2021', shortRegionCode: 'US', code: 'LMND', PT: '2', last:  54.37, exRate: 1.2835, amt:  3818.28, name: 'LEMONADE ORD',               profit: -2244.13, qty: 29, mkt: 'NYS', ccy: 'USD', acct: '123456789' },
    { date: '21/07/2025', shortRegionCode: 'US', code: 'BIDU', PT: '2', last: 134.86, exRate: 1.2835, amt:   265.12, name: 'BAIDU ADS REP 8 CL A ORD',  profit:   138.80, qty:  3, mkt: 'NMS', ccy: 'USD', acct: '123456789' },
    { date: '12/08/2025', shortRegionCode: '',   code: 'ES3',  PT: '2', last:   4.36, exRate: 1.0,    amt:   142.08, name: 'STRAITS TIMES INDEX ETF',    profit:     5.79, qty: 34, mkt: 'SGX', ccy: 'SGD', acct: '123456789' },
  ],
  entityId: 'SG',
  timestamp: '30/09/2025 19:44:50',
};

const scUnitTrusts = [
  { investmentAccountNo: '612345789-1', fundCode: '069036-318', fundCcy: 'SGD', availableUnits: 24788.39, currentUnits: 24788.39, marketValueFundCcy: 21912.94, marketValueBaseCcy: 21912.94, fundName: 'SCHRODER ASIAN INCOME (SGD)', investmentAccountStatus: 'NORMAL' },
  { investmentAccountNo: '612345789-1', fundCode: '069038-357', fundCcy: 'SGD', availableUnits:  2785.19, currentUnits:  2785.19, marketValueFundCcy: 21689.35, marketValueBaseCcy: 21689.35, fundName: 'ALLIANZ INCOME AND GROWTH AM (H2-SGD) - REINVEST DIV', investmentAccountStatus: 'NORMAL' },
  { investmentAccountNo: '612345789-1', fundCode: '069073-832', fundCcy: 'SGD', availableUnits:   142.52, currentUnits:   142.52, marketValueFundCcy:  1200.00, marketValueBaseCcy:  1200.00, fundName: 'AB FCP I AMERICAN INCOME PORTFOLIO AT (SGD)', investmentAccountStatus: 'NORMAL' },
];

const scCash = {
  balance: 14880,
  currency: 'SGD',
  recentTransactions: [
    { date: '2026-03-15', description: 'Cash Deposit', amount: 1000 },
    { date: '2026-02-28', description: 'Fund Redemption', amount: 5000 },
  ],
  dividendIncome: 2500,
};

const scPerformance = {
  history: [
    { label: 'Feb 21', value: 215200 }, { label: 'Feb 22', value: 217300 },
    { label: 'Feb 23', value: 216100 }, { label: 'Feb 24', value: 218500 },
    { label: 'Feb 25', value: 220100 }, { label: 'Feb 26', value: 218900 },
    { label: 'Feb 27', value: 221300 }, { label: 'Feb 28', value: 219800 },
    { label: 'Mar 1',  value: 222500 }, { label: 'Mar 2',  value: 224100 },
    { label: 'Mar 3',  value: 222800 }, { label: 'Mar 4',  value: 225400 },
    { label: 'Mar 5',  value: 226900 }, { label: 'Mar 6',  value: 225100 },
    { label: 'Mar 7',  value: 228300 }, { label: 'Mar 8',  value: 229700 },
    { label: 'Mar 9',  value: 228100 }, { label: 'Mar 10', value: 231500 },
    { label: 'Mar 11', value: 233200 }, { label: 'Mar 12', value: 231800 },
    { label: 'Mar 13', value: 234600 }, { label: 'Mar 14', value: 236100 },
    { label: 'Mar 15', value: 234500 }, { label: 'Mar 16', value: 237300 },
    { label: 'Mar 17', value: 238900 }, { label: 'Mar 18', value: 237200 },
    { label: 'Mar 19', value: 239800 }, { label: 'Mar 20', value: 241200 },
    { label: 'Mar 21', value: 239700 }, { label: 'Mar 22', value: 241500 },
  ],
  monthlyChanges: { stocks: 15.2, unitTrusts: 9.8 },
};

const scNews = {
  items: [
    { title: 'Market Update: Tech Stocks Rally',  date: '2026-03-22', category: 'Market'   },
    { title: 'Investment Tips for 2026',           date: '2026-03-20', category: 'Tips'     },
    { title: 'Global Economic Outlook',            date: '2026-03-18', category: 'Analysis' },
  ],
};

// ── UOB ───────────────────────────────────────────────────────────────────────

const uobStocks = {
  data: [
    { date: '15/03/2024', shortRegionCode: '',   code: 'D05',  PT: '2', last:  38.50, exRate: 1.0,    amt: 16200.00, name: 'DBS GROUP HOLDINGS',  profit:  3050, qty:  500, mkt: 'SGX', ccy: 'SGD', acct: 'UOB789012' },
    { date: '08/06/2023', shortRegionCode: '',   code: 'U11',  PT: '2', last:  33.20, exRate: 1.0,    amt:  8340.00, name: 'UNITED OVERSEAS BANK', profit:  1620, qty:  300, mkt: 'SGX', ccy: 'SGD', acct: 'UOB789012' },
    { date: '22/09/2022', shortRegionCode: '',   code: 'Z74',  PT: '2', last:   3.68, exRate: 1.0,    amt:  5700.00, name: 'SINGTEL',              profit:  1660, qty: 2000, mkt: 'SGX', ccy: 'SGD', acct: 'UOB789012' },
    { date: '14/11/2023', shortRegionCode: '',   code: 'C6L',  PT: '2', last:   6.95, exRate: 1.0,    amt:  2168.00, name: 'SINGAPORE AIRLINES',   profit:   612, qty:  400, mkt: 'SGX', ccy: 'SGD', acct: 'UOB789012' },
    { date: '20/07/2023', shortRegionCode: 'US', code: 'TSLA', PT: '2', last: 245.80, exRate: 1.3520, amt:  3957.17, name: 'TESLA INC',             profit:   756, qty:   15, mkt: 'NMS', ccy: 'USD', acct: 'UOB789012' },
    { date: '05/02/2024', shortRegionCode: 'US', code: 'NVDA', PT: '2', last: 875.50, exRate: 1.3520, amt:  5678.40, name: 'NVIDIA CORP',           profit:  4555, qty:   10, mkt: 'NMS', ccy: 'USD', acct: 'UOB789012' },
  ],
  entityId: 'SG',
  timestamp: '22/03/2026 18:00:00',
};

const uobUnitTrusts = [
  { investmentAccountNo: 'UOB-INV-789012', fundCode: 'FID-001-AEF', fundCcy: 'USD', availableUnits:  5000, currentUnits:  5000, marketValueFundCcy:  6225.00, marketValueBaseCcy:  8442.38, fundName: 'FIDELITY ASEAN EQUITY FUND (USD)',        investmentAccountStatus: 'NORMAL' },
  { investmentAccountNo: 'UOB-INV-789012', fundCode: 'JPM-002-PTF', fundCcy: 'USD', availableUnits:  2500, currentUnits:  2500, marketValueFundCcy:  7207.50, marketValueBaseCcy:  9779.42, fundName: 'JPMORGAN PACIFIC TECHNOLOGY FUND (USD)', investmentAccountStatus: 'NORMAL' },
  { investmentAccountNo: 'UOB-INV-789012', fundCode: 'FUL-003-SCF', fundCcy: 'SGD', availableUnits: 15000, currentUnits: 15000, marketValueFundCcy: 15123.00, marketValueBaseCcy: 15123.00, fundName: 'FULLERTON SGD CASH FUND',                 investmentAccountStatus: 'NORMAL' },
];

const uobCasa = {
  casa: {
    accounts: [{
      accountId: '3010123456789', accountNickname: 'UOB One Account', accountStatus: 'Active',
      productCodeDescription: 'UOB One Account', displayAccountNumber: '301-012-345-6',
      availableBalance: { Currency: 'SGD', balance: '15432.67', displayBalance: 15432.67 },
      ledgerBalance:    { Currency: 'SGD', balance: '15432.67', displayBalance: 15432.67 },
    }],
    status: 'SUCCESS',
  },
};

const uobFixedDeposits = {
  fixedDeposit: {
    accounts: [{
      accountId: 'UOB-FD-456789', displayAccountNumber: 'UOB-456-789',
      accountNickname: 'UOB Fixed Deposit', currency: 'SGD',
      principalBalance: { Currency: 'SGD', balance: '50000.00', displayBalance: 50000.00 },
      availableBalance: { Currency: 'SGD', balance: '0.00',     displayBalance: 0.0 },
      interestRate: 3.45, maturityDate: '2026-03-15', tenorMonths: 6,
    }],
    status: 'SUCCESS',
  },
};

// ── OCBC ──────────────────────────────────────────────────────────────────────

const ocbcStocks = {
  data: [
    { date: '12/04/2022', shortRegionCode: '', code: 'C38U', PT: '2', last:  2.85, exRate: 1.0, amt:  6600.00, name: 'CAPITALAND ASCENDAS REIT', profit: 1950, qty: 3000, mkt: 'SGX', ccy: 'SGD', acct: 'OCBC654321' },
    { date: '30/09/2023', shortRegionCode: '', code: 'V03',  PT: '2', last: 12.68, exRate: 1.0, amt:  1890.00, name: 'VENTURE CORPORATION',      profit:  646, qty:  200, mkt: 'SGX', ccy: 'SGD', acct: 'OCBC654321' },
    { date: '18/06/2021', shortRegionCode: '', code: 'O39',  PT: '2', last: 15.38, exRate: 1.0, amt: 12600.00, name: 'OCBC BANK',                profit: 2980, qty: 1000, mkt: 'SGX', ccy: 'SGD', acct: 'OCBC654321' },
  ],
  entityId: 'SG',
  timestamp: '22/03/2026 18:00:00',
};

const ocbcUnitTrusts = [
  { investmentAccountNo: 'OCBC-INV-654321', fundCode: 'ABS-001-ABF', fundCcy: 'SGD', availableUnits: 10000, currentUnits: 10000, marketValueFundCcy:  9950.00, marketValueBaseCcy:  9950.00, fundName: 'ABERDEEN STANDARD SICAV I - ASIAN BOND FUND (SGD HEDGED)', investmentAccountStatus: 'NORMAL' },
  { investmentAccountNo: 'OCBC-INV-654321', fundCode: 'LGL-002-SDE', fundCcy: 'SGD', availableUnits:  8500, currentUnits:  8500, marketValueFundCcy:  3595.50, marketValueBaseCcy:  3595.50, fundName: 'LIONGLOBAL SINGAPORE DIVIDEND EQUITY FUND',                 investmentAccountStatus: 'NORMAL' },
  { investmentAccountNo: 'OCBC-INV-654321', fundCode: 'NAM-003-STI', fundCcy: 'SGD', availableUnits:  2000, currentUnits:  2000, marketValueFundCcy:  6960.00, marketValueBaseCcy:  6960.00, fundName: 'NIKKO AM SINGAPORE STI ETF',                                investmentAccountStatus: 'NORMAL' },
];

const ocbcCasa = {
  casa: {
    accounts: [{
      accountId: '5010987654321', accountNickname: 'OCBC 360 Account', accountStatus: 'Active',
      productCodeDescription: 'OCBC 360 Account', displayAccountNumber: '501-098-765-4',
      availableBalance: { Currency: 'SGD', balance: '28650.40', displayBalance: 28650.40 },
      ledgerBalance:    { Currency: 'SGD', balance: '28650.40', displayBalance: 28650.40 },
      interestRate: 4.05,
    }],
    status: 'SUCCESS',
  },
};

const ocbcFixedDeposits = {
  fixedDeposit: {
    accounts: [{
      accountId: 'OCBC-FD-987654', displayAccountNumber: 'OCBC-987-654',
      accountNickname: 'OCBC Fixed Deposit', currency: 'SGD',
      principalBalance: { Currency: 'SGD', balance: '30000.00', displayBalance: 30000.00 },
      availableBalance: { Currency: 'SGD', balance: '0.00',     displayBalance: 0.0 },
      interestRate: 3.65, maturityDate: '2026-09-30', tenorMonths: 12,
    }],
    status: 'SUCCESS',
  },
};

// ── DBS ───────────────────────────────────────────────────────────────────────

const dbsUnitTrusts = {
  investment: {
    accounts: [{
      productType: 'UNIT_TRUST', investmentId: 'IN000751826',
      marketValue: { Currency: 'SGD', balance: '0', displayBalance: 0.0 },
      displayAccountNumber: 'IN000751826', productCode: '0283',
      productCodeDescription: 'UT', productCategory: 'UT', fundsAvailable: 'false',
    }],
    status: 'SUCCESS',
  },
};

const dbsCasa = {
  casa: {
    accounts: [{
      accountId: '09385724610058', accountNickname: 'My savings account', accountStatus: 'Active',
      productCodeDescription: 'POSB Everyday Savings Account', displayAccountNumber: '847-29163-5',
      availableBalance: { Currency: 'SGD', balance: '6839.21', displayBalance: 6839.21 },
      ledgerBalance:    { Currency: 'SGD', balance: '6839.28', displayBalance: 6839.28 },
    }],
    status: 'SUCCESS',
  },
};

const dbsFixedDeposits = {
  fixedDeposit: {
    accounts: [{
      accountId: '0583741629003', displayAccountNumber: '0583-74162900-3',
      accountNickname: '', currency: 'SGD',
      principalBalance: { Currency: 'SGD' },
      availableBalance: { Currency: 'SGD', balance: '0.00', displayBalance: 0.0 },
    }],
    status: 'SUCCESS',
  },
};

const dbsSrs = {
  investment: {
    accounts: [{
      productType: 'SRS', investmentId: '04726381590148',
      marketValue:        { Currency: 'SGD', balance: '2183.47',  displayBalance: 2183.47  },
      totalPortFolioValue:{ Currency: 'SGD', balance: '52849.31', displayBalance: 52849.31 },
      displayAccountNumber: '0472-638159-0-148', productCode: '0223',
      productCodeDescription: 'SRS Account', productCategory: 'SRS', productBrand: 'DBS',
    }],
    status: 'SUCCESS',
  },
};

const dbsSrsUnitTrusts = {
  SRSDetails: [
    {
      assetClass: 'BO',
      holdings: [
        { productName: 'SSB PL83749X 627384', marketVal: { currency: 'SGD', value: '1500.0' }, totalCost: { currency: '1500.0', value: 'SGD' } },
      ],
    },
    {
      assetClass: 'EQ',
      holdings: [
        { productName: 'TB NR59214M 813047', marketVal: { currency: 'SGD', value: '1389.79' }, totalCost: { currency: '1358.24', value: 'SGD' } },
        { productName: 'TB KT71638D 492715', marketVal: { currency: 'SGD', value: '1419.58' }, totalCost: { currency: '1383.34', value: 'SGD' } },
      ],
    },
    {
      assetClass: 'MF',
      holdings: [
        { productName: 'SCHRODER ASIA MORE+ S$ D DIS',  marketVal: { currency: 'SGD', value: '9284.47'  } },
        { productName: 'FID EMERGING MKT FD A SGD',      marketVal: { currency: 'SGD', value: '8293.19'  } },
        { productName: 'FRK TECH A (ACC) S$-H1',         marketVal: { currency: 'SGD', value: '17469.12' } },
        { productName: 'FID GLB DIV FUND A-MINCOME SGD', marketVal: { currency: 'SGD', value: '5283.82'  } },
        { productName: 'SCHRODER ASIA MORE+ SGD A DIS',  marketVal: { currency: 'SGD', value: '7831.52'  } },
        { productName: 'FSSA DIV ADVANTAGE A(QDIST) S$', marketVal: { currency: 'SGD', value: '6669.17'  } },
      ],
    },
  ],
};

// ── Assembled portfolio responses (matching BankController output) ─────────────

export const mockBankPortfolios = {
  SC: {
    bankCode: 'SC',
    stocks:       scStocks,
    unitTrusts:   scUnitTrusts,
    cash:         scCash,
    casa:         null,
    fixedDeposits:null,
    cpf:          null,
    srs:          null,
    srsUnitTrusts:null,
    performance:  scPerformance,
    news:         scNews,
  },
  UOB: {
    bankCode: 'UOB',
    stocks:       uobStocks,
    unitTrusts:   uobUnitTrusts,
    cash:         null,
    casa:         uobCasa,
    fixedDeposits:uobFixedDeposits,
    cpf:          null,
    srs:          null,
    srsUnitTrusts:null,
    performance:  null,
    news:         null,
  },
  OCBC: {
    bankCode: 'OCBC',
    stocks:       ocbcStocks,
    unitTrusts:   ocbcUnitTrusts,
    cash:         null,
    casa:         ocbcCasa,
    fixedDeposits:ocbcFixedDeposits,
    cpf:          null,
    srs:          null,
    srsUnitTrusts:null,
    performance:  null,
    news:         null,
  },
  DBS: {
    bankCode: 'DBS',
    stocks:       null,
    unitTrusts:   dbsUnitTrusts,
    cash:         null,
    casa:         dbsCasa,
    fixedDeposits:dbsFixedDeposits,
    cpf:          null,
    srs:          dbsSrs,
    srsUnitTrusts:dbsSrsUnitTrusts,
    performance:  null,
    news:         null,
  },
};

// ── Subscriptions / Scheduled Payments ───────────────────────────────────────
// Used as the initial seed when localStorage is empty.
// All edits made in the UI are persisted back to localStorage automatically.

export const mockSubscriptions = [
  { id: 1,  name: 'Netflix',            amount:   15.98, category: 'Streaming',       frequency: 'Monthly', billingDate: '1',  status: 'Active', addedAt: '01/01/2026' },
  { id: 2,  name: 'Spotify',            amount:    9.90, category: 'Streaming',       frequency: 'Monthly', billingDate: '5',  status: 'Active', addedAt: '01/01/2026' },
  { id: 3,  name: 'StarHub Broadband',  amount:   59.90, category: 'Utilities',       frequency: 'Monthly', billingDate: '20', status: 'Active', addedAt: '01/01/2026' },
  { id: 4,  name: 'Gym Membership',     amount:   80.00, category: 'Health & Fitness',frequency: 'Monthly', billingDate: '1',  status: 'Active', addedAt: '01/01/2026' },
  { id: 5,  name: 'Microsoft 365',      amount:   99.00, category: 'Software / SaaS', frequency: 'Yearly',  billingDate: '10', status: 'Active', addedAt: '01/01/2026' },
  { id: 6,  name: 'Home Insurance',     amount: 1200.00, category: 'Insurance',       frequency: 'Yearly',  billingDate: '15', status: 'Active', addedAt: '01/01/2026' },
  { id: 7,  name: 'Term Life Insurance',amount: 1800.00, category: 'Insurance',       frequency: 'Yearly',  billingDate: '3',  status: 'Active', addedAt: '01/01/2026' },
  { id: 8,  name: 'Apple iCloud+',      amount:    3.98, category: 'Software / SaaS', frequency: 'Monthly', billingDate: '8',  status: 'Paused', addedAt: '01/01/2026' },
  { id: 9,  name: 'Car Loan EMI',       amount:  850.00, category: 'Loan / EMI',      frequency: 'Monthly', billingDate: '25', status: 'Active', addedAt: '01/01/2026' },
  { id: 10, name: 'NTUC Income Shield', amount:  600.00, category: 'Insurance',       frequency: 'Yearly',  billingDate: '12', status: 'Active', addedAt: '01/01/2026' },
];

// ── Mock stock prices for DEV_MODE watchlist ──────────────────────────────────

const MOCK_PRICE_TABLE = {
  AAPL:  { currentPrice: 213.49, change:  1.23, percentChange:  0.58 },
  AMZN:  { currentPrice: 194.50, change:  3.12, percentChange:  1.63 },
  GOOGL: { currentPrice: 162.23, change: -0.87, percentChange: -0.53 },
  GOOG:  { currentPrice: 161.80, change: -0.90, percentChange: -0.55 },
  MSFT:  { currentPrice: 378.15, change:  2.54, percentChange:  0.68 },
  META:  { currentPrice: 502.30, change: -4.50, percentChange: -0.89 },
  NVDA:  { currentPrice: 821.40, change: 15.20, percentChange:  1.88 },
  TSLA:  { currentPrice: 248.42, change: -3.21, percentChange: -1.27 },
  NFLX:  { currentPrice: 628.90, change:  8.75, percentChange:  1.41 },
  AMD:   { currentPrice: 168.30, change: -2.10, percentChange: -1.23 },
  INTC:  { currentPrice:  42.15, change:  0.35, percentChange:  0.84 },
  BABA:  { currentPrice:  85.60, change:  1.10, percentChange:  1.30 },
  TSM:   { currentPrice: 142.75, change:  2.30, percentChange:  1.64 },
  SBUX:  { currentPrice:  79.40, change: -0.60, percentChange: -0.75 },
  DIS:   { currentPrice: 112.80, change:  1.45, percentChange:  1.30 },
  JPM:   { currentPrice: 198.60, change:  0.90, percentChange:  0.46 },
  BAC:   { currentPrice:  38.25, change: -0.15, percentChange: -0.39 },
  V:     { currentPrice: 276.40, change:  1.80, percentChange:  0.66 },
  MA:    { currentPrice: 462.10, change:  3.20, percentChange:  0.70 },
  PFE:   { currentPrice:  27.85, change: -0.30, percentChange: -1.07 },
};

export const getMockPrice = (symbol) =>
  MOCK_PRICE_TABLE[symbol] || {
    currentPrice: +(50 + Math.random() * 450).toFixed(2),
    change: +((Math.random() - 0.5) * 5).toFixed(2),
    percentChange: +((Math.random() - 0.5) * 3).toFixed(2),
  };

// ── Mock price history for DEV_MODE ──────────────────────────────────────────

export function getMockHistory(symbol, period = 'YTD') {
  const base = getMockPrice(symbol);
  const endPrice = base.currentPrice;

  // Number of data points per period
  const today = new Date();
  const ytdDays = Math.floor((today - new Date(today.getFullYear(), 0, 1)) / 86400000);
  const counts  = { '5D': 5, '1M': 22, 'YTD': Math.max(ytdDays, 10), '1Y': 252, '5Y': 260 };
  const n = counts[period] || ytdDays;

  // Build prices backwards from endPrice using a random walk
  const prices = [endPrice];
  for (let i = 1; i < n; i++) {
    const prev   = prices[0];
    const change = prev * (Math.random() * 0.028 - 0.012); // slight downward bias = upward trend forward
    prices.unshift(+(prev - change).toFixed(2));
  }

  // Build labels
  const labels = prices.map((_, i) => {
    const d = new Date(today);
    if (period === '5Y') {
      d.setDate(d.getDate() - (n - 1 - i) * 7);
      return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    } else if (period === '5D') {
      d.setDate(d.getDate() - (n - 1 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } else {
      d.setDate(d.getDate() - (n - 1 - i));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  });

  const firstPrice    = prices[0];
  const lastPrice     = prices[prices.length - 1];
  const changeAmount  = +(lastPrice - firstPrice).toFixed(2);
  const changePercent = +((changeAmount / firstPrice) * 100).toFixed(2);

  return { symbol, period, labels, prices, firstPrice, lastPrice, changeAmount, changePercent };
}

// ── Mock stock fundamentals for DEV_MODE ─────────────────────────────────────

const MOCK_FUNDAMENTALS = {
  AAPL:  { peRatio: 28.5,  pbRatio: 45.2, dividendYield: 0.52, netProfitMargin: 25.3, earningsToBookValue: 1.72, pegRatio: 2.1,  currentRatio: 1.07, workingCapitalToDebt: null, netCurrentAssetToDebt: null, roe: 155.0, roce: 48.2 },
  MSFT:  { peRatio: 33.1,  pbRatio: 12.4, dividendYield: 0.72, netProfitMargin: 35.7, earningsToBookValue: 0.95, pegRatio: 2.4,  currentRatio: 1.77, workingCapitalToDebt: null, netCurrentAssetToDebt: null, roe:  38.5, roce: 28.7 },
  GOOGL: { peRatio: 22.8,  pbRatio:  6.1, dividendYield: 0.46, netProfitMargin: 23.9, earningsToBookValue: 0.52, pegRatio: 1.6,  currentRatio: 2.10, workingCapitalToDebt: null, netCurrentAssetToDebt: null, roe:  26.8, roce: 22.1 },
  AMZN:  { peRatio: 42.3,  pbRatio:  8.9, dividendYield: null, netProfitMargin:  5.3, earningsToBookValue: 0.29, pegRatio: 1.9,  currentRatio: 1.05, workingCapitalToDebt: null, netCurrentAssetToDebt: null, roe:  21.4, roce: 13.5 },
  TSLA:  { peRatio: 62.1,  pbRatio: 11.3, dividendYield: null, netProfitMargin: 10.8, earningsToBookValue: 0.48, pegRatio: 3.2,  currentRatio: 1.84, workingCapitalToDebt: null, netCurrentAssetToDebt: null, roe:  18.6, roce: 14.2 },
  NVDA:  { peRatio: 55.4,  pbRatio: 30.2, dividendYield: 0.03, netProfitMargin: 48.9, earningsToBookValue: 2.11, pegRatio: 1.4,  currentRatio: 4.17, workingCapitalToDebt: null, netCurrentAssetToDebt: null, roe:  91.5, roce: 62.8 },
  META:  { peRatio: 24.7,  pbRatio:  7.6, dividendYield: 0.40, netProfitMargin: 34.1, earningsToBookValue: 0.74, pegRatio: 1.3,  currentRatio: 2.67, workingCapitalToDebt: null, netCurrentAssetToDebt: null, roe:  33.2, roce: 27.9 },
  NFLX:  { peRatio: 38.9,  pbRatio: 15.8, dividendYield: null, netProfitMargin: 16.4, earningsToBookValue: 0.88, pegRatio: 2.0,  currentRatio: 1.32, workingCapitalToDebt: null, netCurrentAssetToDebt: null, roe:  41.3, roce: 30.6 },
  AMD:   { peRatio: 118.6, pbRatio:  3.9, dividendYield: null, netProfitMargin:  5.8, earningsToBookValue: 0.14, pegRatio: 4.2,  currentRatio: 2.54, workingCapitalToDebt: null, netCurrentAssetToDebt: null, roe:   3.3, roce:  2.9 },
  JPM:   { peRatio: 12.1,  pbRatio:  1.9, dividendYield: 2.20, netProfitMargin: 26.8, earningsToBookValue: 0.18, pegRatio: 1.1,  currentRatio: null, workingCapitalToDebt: null, netCurrentAssetToDebt: null, roe:  15.4, roce: null },
  DIS:   { peRatio: 21.4,  pbRatio:  1.8, dividendYield: 0.78, netProfitMargin:  6.9, earningsToBookValue: 0.11, pegRatio: 1.8,  currentRatio: 0.95, workingCapitalToDebt: null, netCurrentAssetToDebt: null, roe:   5.3, roce:  4.1 },
};

export const getMockFundamentals = (symbol) => {
  const data = MOCK_FUNDAMENTALS[symbol.toUpperCase()];
  if (data) return { symbol: symbol.toUpperCase(), ...data };
  // Generic fallback for unknown symbols
  return {
    symbol: symbol.toUpperCase(),
    peRatio: +(10 + Math.random() * 40).toFixed(1),
    pbRatio: +(0.8 + Math.random() * 8).toFixed(2),
    dividendYield: Math.random() > 0.4 ? +(Math.random() * 4).toFixed(2) : null,
    netProfitMargin: +(-5 + Math.random() * 35).toFixed(1),
    earningsToBookValue: +(Math.random() * 2).toFixed(2),
    pegRatio: +(0.5 + Math.random() * 3.5).toFixed(2),
    currentRatio: +(0.5 + Math.random() * 3).toFixed(2),
    workingCapitalToDebt: null,
    netCurrentAssetToDebt: null,
    roe: +(-5 + Math.random() * 50).toFixed(1),
    roce: +(Math.random() * 35).toFixed(1),
  };
};

// ── Mock technical analysis for DEV_MODE ─────────────────────────────────────

const MOCK_TECHNICAL = {
  AAPL:  { currentPrice: 213.49, change:  1.23, percentChange:  0.58, high: 215.10, low: 211.80, open: 212.30, previousClose: 212.26, supportLevels: [205.00, 200.50, 195.25], resistanceLevels: [220.00, 225.75, 230.00], rsi: 58.3, rsiSignal: 'Neutral' },
  MSFT:  { currentPrice: 378.15, change:  2.54, percentChange:  0.68, high: 380.00, low: 374.50, open: 375.60, previousClose: 375.61, supportLevels: [370.00, 362.50, 355.00], resistanceLevels: [385.00, 392.00, 400.00], rsi: 62.7, rsiSignal: 'Neutral' },
  TSLA:  { currentPrice: 248.42, change: -3.21, percentChange: -1.27, high: 254.00, low: 246.10, open: 252.00, previousClose: 251.63, supportLevels: [240.00, 230.00, 220.50], resistanceLevels: [255.00, 265.00, 275.00], rsi: 42.1, rsiSignal: 'Neutral' },
  NVDA:  { currentPrice: 821.40, change: 15.20, percentChange:  1.88, high: 830.00, low: 808.00, open: 810.00, previousClose: 806.20, supportLevels: [800.00, 780.00, 760.00], resistanceLevels: [840.00, 860.00, 900.00], rsi: 71.4, rsiSignal: 'Overbought' },
  AMZN:  { currentPrice: 194.50, change:  3.12, percentChange:  1.63, high: 196.00, low: 191.20, open: 191.80, previousClose: 191.38, supportLevels: [188.00, 182.50, 175.00], resistanceLevels: [198.00, 205.00, 212.00], rsi: 55.8, rsiSignal: 'Neutral' },
  GOOGL: { currentPrice: 162.23, change: -0.87, percentChange: -0.53, high: 164.50, low: 161.00, open: 163.50, previousClose: 163.10, supportLevels: [158.00, 153.50, 148.00], resistanceLevels: [166.00, 170.00, 175.00], rsi: 47.9, rsiSignal: 'Neutral' },
  META:  { currentPrice: 502.30, change: -4.50, percentChange: -0.89, high: 509.00, low: 499.50, open: 507.00, previousClose: 506.80, supportLevels: [492.00, 480.00, 465.00], resistanceLevels: [512.00, 525.00, 540.00], rsi: 44.2, rsiSignal: 'Neutral' },
  AMD:   { currentPrice: 168.30, change: -2.10, percentChange: -1.23, high: 172.00, low: 167.00, open: 170.50, previousClose: 170.40, supportLevels: [162.00, 155.00, 148.00], resistanceLevels: [175.00, 182.00, 190.00], rsi: 38.6, rsiSignal: 'Neutral' },
  JPM:   { currentPrice: 198.60, change:  0.90, percentChange:  0.46, high: 200.00, low: 197.00, open: 197.80, previousClose: 197.70, supportLevels: [194.00, 188.00, 180.00], resistanceLevels: [202.00, 208.00, 215.00], rsi: 60.1, rsiSignal: 'Neutral' },
  INTC:  { currentPrice:  42.15, change:  0.35, percentChange:  0.84, high:  43.00, low:  41.50, open:  41.90, previousClose:  41.80, supportLevels: [ 40.00,  38.00,  35.50], resistanceLevels: [ 44.00,  46.50,  50.00], rsi: 28.4, rsiSignal: 'Oversold' },
};

export const getMockTechnical = (symbol, resolution = 'D') => {
  const data = MOCK_TECHNICAL[symbol.toUpperCase()];
  if (data) return { symbol: symbol.toUpperCase(), resolution, ...data };
  // Generic fallback
  const price = +(50 + Math.random() * 450).toFixed(2);
  const spread = price * 0.08;
  return {
    symbol: symbol.toUpperCase(),
    resolution,
    currentPrice: price,
    change: +((Math.random() - 0.5) * 5).toFixed(2),
    percentChange: +((Math.random() - 0.5) * 3).toFixed(2),
    high: +(price + price * 0.01).toFixed(2),
    low:  +(price - price * 0.01).toFixed(2),
    open: +(price + (Math.random() - 0.5) * 2).toFixed(2),
    previousClose: +(price - (Math.random() - 0.5) * 3).toFixed(2),
    supportLevels:    [+(price - spread * 0.4).toFixed(2), +(price - spread * 0.7).toFixed(2), +(price - spread).toFixed(2)],
    resistanceLevels: [+(price + spread * 0.4).toFixed(2), +(price + spread * 0.7).toFixed(2), +(price + spread).toFixed(2)],
    rsi: +(25 + Math.random() * 50).toFixed(1),
    rsiSignal: 'Neutral',
  };
};

// ── Mock ticker typeahead ─────────────────────────────────────────────────────

export const mockTickerSearch = (query) => {
  const q = query.toLowerCase();
  const pool = [
    { symbol: 'AAPL',  description: 'Apple Inc',                   type: 'Common Stock' },
    { symbol: 'AMZN',  description: 'Amazon.com Inc',              type: 'Common Stock' },
    { symbol: 'GOOGL', description: 'Alphabet Inc Class A',        type: 'Common Stock' },
    { symbol: 'GOOG',  description: 'Alphabet Inc Class C',        type: 'Common Stock' },
    { symbol: 'MSFT',  description: 'Microsoft Corp',              type: 'Common Stock' },
    { symbol: 'META',  description: 'Meta Platforms Inc',          type: 'Common Stock' },
    { symbol: 'NVDA',  description: 'NVIDIA Corp',                 type: 'Common Stock' },
    { symbol: 'TSLA',  description: 'Tesla Inc',                   type: 'Common Stock' },
    { symbol: 'NFLX',  description: 'Netflix Inc',                 type: 'Common Stock' },
    { symbol: 'AMD',   description: 'Advanced Micro Devices Inc',  type: 'Common Stock' },
    { symbol: 'INTC',  description: 'Intel Corp',                  type: 'Common Stock' },
    { symbol: 'BABA',  description: 'Alibaba Group Holding Ltd',   type: 'Common Stock' },
    { symbol: 'TSM',   description: 'Taiwan Semiconductor Mfg',   type: 'Common Stock' },
    { symbol: 'SBUX',  description: 'Starbucks Corp',              type: 'Common Stock' },
    { symbol: 'DIS',   description: 'Walt Disney Co',              type: 'Common Stock' },
    { symbol: 'JPM',   description: 'JPMorgan Chase & Co',         type: 'Common Stock' },
    { symbol: 'BAC',   description: 'Bank of America Corp',        type: 'Common Stock' },
    { symbol: 'V',     description: 'Visa Inc',                    type: 'Common Stock' },
    { symbol: 'MA',    description: 'Mastercard Inc',              type: 'Common Stock' },
    { symbol: 'PFE',   description: 'Pfizer Inc',                  type: 'Common Stock' },
  ];
  return pool
    .filter(r => r.symbol.toLowerCase().startsWith(q) || r.description.toLowerCase().includes(q))
    .slice(0, 8);
};
