// Run with node scripts/check-admin-overview.cjs. No account or network required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function load(relativePath, resolve) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  new Function('require', 'exports', 'module', code)(resolve, module.exports, module);
  return module.exports;
}

const { nepalDateYYYYMMDD } = load('src/utils/getDate.ts', () => ({ NEPAL_OFFSET_MIN: 345 }));
assert.equal(nepalDateYYYYMMDD(new Date('2026-11-15T18:14:59Z')), '2026-11-15');
assert.equal(nepalDateYYYYMMDD(new Date('2026-11-15T18:15:00Z')), '2026-11-16');

async function check(results) {
  const queries = [];
  const supabase = {
    from(table) {
      const steps = [['from', table]];
      const index = queries.push(steps) - 1;
      const query = { then: (resolve, reject) => Promise.resolve(results[index]).then(resolve, reject) };
      for (const method of ['select', 'eq', 'not', 'is']) {
        query[method] = (...args) => { steps.push([method, ...args]); return query; };
      }
      return query;
    },
  };
  const { fetchAdminDashboardOverview } = load('src/services/admin/dashboard.service.ts', name => {
    if (name.endsWith('supabaseClient')) return { supabase };
    if (name.endsWith('getDate')) return { nepalDateYYYYMMDD: () => '2026-11-16' };
    throw new Error(`Unexpected import: ${name}`);
  });
  const promise = fetchAdminDashboardOverview(42);
  assert.equal(queries.length, 3);
  for (const [index, steps] of queries.entries()) {
    const includes = expected => steps.some(step => JSON.stringify(step) === JSON.stringify(expected));
    assert(includes(['eq', index === 0 ? 'organization_id' : 'profiles.organization_id', 42]));
    assert(steps.some(step => step[0] === 'select' && step[2].count === 'exact' && step[2].head === true));
    if (index !== 0) {
      assert(steps[1][1].includes('profiles!inner'));
      assert(includes(['eq', 'date', '2026-11-16']));
    }
    assert(includes(['eq', 'status', ['pending', 'incomplete', 'present'][index]]));
  }
  assert(queries[1].some(step => step[0] === 'is' && step[1] === 'check_out_time' && step[2] === null));
  return promise;
}

(async () => {
  assert.deepEqual(await check([2, 3, 4].map(count => ({ count, error: null }))), {
    pendingLeaves: 2, working: 3, completed: 4, date: '2026-11-16',
  });
  assert.equal((await check([0, 0, 0].map(count => ({ count, error: null })))).pendingLeaves, 0);
  await assert.rejects(check([{ count: null, error: new Error('Unavailable') }, { count: 0 }, { count: 0 }]), /Unavailable/);
  await assert.rejects(check([{ count: null }, { count: 0 }, { count: 0 }]), /unavailable/);
  console.log('Admin overview checks passed: organization/date filters, counts, errors, and Nepal midnight.');
})().catch(error => { console.error(error); process.exitCode = 1; });
