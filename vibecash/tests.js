const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Extract pure functions from index.html and run unit tests
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const scriptMatch = html.match(/\/\/ =+\s*\n\s*\/\/ 1\. PURE CORE FUNCTIONS[\s\S]*?return results;\s*\n\s*\}/);
if (!scriptMatch) {
  throw new Error('Could not locate PURE CORE FUNCTIONS block in index.html');
}

const getZeroMatch = html.match(/function getZeroState\(\) \{[\s\S]*?\n    \}/);
const sandboxCode = `
  ${getZeroMatch[0]}
  ${scriptMatch[0]}
  module.exports = {
    evaluateMathInput,
    calculateAccountBalance,
    calculateTotalBalance,
    parseSmartPhrase,
    parseBankCsvLines,
    runBuiltInUnitTests,
    getZeroState
  };
`;

const vm = require('vm');
const mod = { exports: {} };
vm.runInNewContext(sandboxCode, { module: mod, exports: mod.exports, Date, Math, Array, Object, String, Number, RegExp, parseFloat, isNaN });
const {
  evaluateMathInput,
  calculateAccountBalance,
  calculateTotalBalance,
  parseSmartPhrase,
  parseBankCsvLines,
  runBuiltInUnitTests
} = mod.exports;

console.log('=== Running VibeCash v3.0 Unit Test Suite ===');
const suiteResults = runBuiltInUnitTests();
suiteResults.forEach((r, idx) => {
  console.log(`  [${r.pass ? 'PASS' : 'FAIL'}] Test #${idx + 1}: ${r.name}`);
  assert.strictEqual(r.pass, true, `Failed test: ${r.name}`);
});

// Additional edge-case assertions
assert.strictEqual(evaluateMathInput('1000-250+50'), 800, 'Math subtraction and addition failed');
assert.strictEqual(evaluateMathInput(''), 0, 'Empty math input should return 0');
assert.strictEqual(evaluateMathInput('300/0'), 300, 'Division by zero should not crash');

const accounts = [
  { id: 'card', initialBalance: 50000 },
  { id: 'cash', initialBalance: 5000 },
  { id: 'save', initialBalance: 100000 }
];
const txs = [
  { type: 'expense', amount: 4000, accountId: 'card' },
  { type: 'transfer', amount: 10000, accountId: 'card', toAccountId: 'save' },
  { type: 'transfer', amount: 2000, accountId: 'cash', toAccountId: 'card' }
];
assert.strictEqual(calculateAccountBalance('card', accounts, txs), 38000, 'Card balance after transfers mismatch');
assert.strictEqual(calculateAccountBalance('cash', accounts, txs), 3000, 'Cash balance after transfer mismatch');
assert.strictEqual(calculateAccountBalance('save', accounts, txs), 110000, 'Savings balance after transfer mismatch');
assert.strictEqual(calculateTotalBalance(accounts, txs), 151000, 'Total balance across all accounts must remain invariant under transfers');

console.log('ALL 16 ASSERTIONS PASSED SUCCESSFULLY!');
