#!/usr/bin/env node
// Zero-dependency repository checks. Run with: npm run check
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (file) => readFileSync(join(root, file), 'utf8');
let passed = 0;
const ok = (name) => { passed += 1; console.log(`✓ ${name}`); };

// 1. JavaScript syntax.
execFileSync(process.execPath, ['--check', join(root, 'client.js')], { stdio: 'pipe' });
ok('client.js syntax');

// 2. JSON manifests and locale metadata.
for (const file of ['package.json', 'locale/zh.json', 'locale/en.json']) JSON.parse(read(file));
ok('JSON files parse');

// 3. Runtime locale dictionaries stay aligned.
const source = read('client.js');
const dictionaryKeys = (name) => {
  const start = source.indexOf(`const ${name} = {`);
  assert.ok(start >= 0, `missing "${name}" dictionary`);
  const end = source.indexOf('};', start);
  return new Set([...source.slice(start, end).matchAll(/'([a-zA-Z0-9_.-]+)':/g)].map((match) => match[1]));
};
const zh = dictionaryKeys('zh');
const en = dictionaryKeys('en');
const missingZh = [...en].filter((key) => !zh.has(key));
const missingEn = [...zh].filter((key) => !en.has(key));
assert.deepEqual(missingZh, [], `keys missing from zh: ${missingZh.join(', ')}`);
assert.deepEqual(missingEn, [], `keys missing from en: ${missingEn.join(', ')}`);
ok(`zh/en locale keys aligned (${zh.size} keys)`);

// 4. package.json files whitelist still covers the runtime files.
const pkg = JSON.parse(read('package.json'));
for (const file of ['index.js', 'client.js', 'cordis.patch.yml', 'icon.svg']) {
  assert.ok(pkg.files.includes(file), `package.json "files" is missing ${file}`);
}
ok('manifest "files" covers runtime files');

// 5. Module factory evaluates with a mocked host (catches top-level errors).
let factory;
const React = {
  createElement: () => null,
  Fragment: {},
  useState: () => [null, () => {}],
  useEffect: () => {},
  useMemo: (fn) => fn(),
  useRef: () => ({ current: null }),
  useReducer: () => [null, () => {}],
  useCallback: (fn) => fn,
  useSyncExternalStore: () => undefined,
};
const context = {
  window: { __ModuleLoader__: { load: (definition) => { factory = definition.factory; } } },
  console,
  localStorage: { getItem: () => null, setItem: () => {} },
  document: {},
  navigator: {},
  setTimeout,
  clearTimeout,
};
vm.runInNewContext(source, context, { filename: 'client.js' });
assert.equal(typeof factory, 'function', 'module factory was not registered');
const plugin = factory((name) => {
  if (name === 'react') return React;
  throw new Error(`unexpected require("${name}")`);
});
assert.equal(typeof plugin.apply, 'function', 'plugin.apply is missing');
assert.ok(Array.isArray(plugin.inject) && plugin.inject.length > 0, 'plugin.inject is missing');
ok(`module factory evaluates (${plugin.inject.length} injects)`);

console.log(`\n${passed} checks passed`);
