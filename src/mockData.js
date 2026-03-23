// Mock data mirroring the exact JSON structures returned by the Spring Boot backend.
// Automatically used when the API or Keycloak is unreachable.
// Set MOCK_MODE = true in App.js to always use this data during development.

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
        { productName: 'SSB GX24100H 341001', marketVal: { currency: 'SGD', value: '1500.0' }, totalCost: { currency: '1500.0', value: 'SGD' } },
      ],
    },
    {
      assetClass: 'EQ',
      holdings: [
        { productName: 'TB BS26101E 260721', marketVal: { currency: 'SGD', value: '1389.79' }, totalCost: { currency: '1358.24', value: 'SGD' } },
        { productName: 'TB BS26102F 260804', marketVal: { currency: 'SGD', value: '1419.58' }, totalCost: { currency: '1383.34', value: 'SGD' } },
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
