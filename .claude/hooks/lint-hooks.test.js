#!/usr/bin/env node
'use strict';

/**
 * lint-hooks.test.js
 * 针对各语言 lint 钩子脚本的集成测试。
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const HOOK_DIR = __dirname;

function hookPath(name) {
  return path.join(HOOK_DIR, name);
}

function createPayload(filePath) {
  return {
    tool_name: 'Write',
    tool_input: {
      file_path: filePath,
    },
    tool_response: {
      filePath,
    },
  };
}

function runHook(scriptName, payload, options = {}) {
  const result = spawnSync('node', [hookPath(scriptName)], {
    input: `${JSON.stringify(payload)}\n`,
    encoding: 'utf8',
    ...options,
  });
  return result;
}

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function testPhpLintFailure() {
  const dir = createTempDir('lint-php-');
  const filePath = path.join(dir, 'sample.php');
  fs.writeFileSync(filePath, "<?php\nfunction foo() {\n    echo 'missing semicolon'\n}\n"); // 缺少分号

  const result = runHook('lint-php.js', createPayload(filePath));

  assert.strictEqual(result.status, 2);
  assert.ok(result.stderr.includes('php -l'), '错误信息应包含 php -l 命令');
}

function testPythonLintFailure() {
  const dir = createTempDir('lint-python-');
  const filePath = path.join(dir, 'broken.py');
  fs.writeFileSync(filePath, 'def broken(:\n    pass\n');

  const result = runHook('lint-python.js', createPayload(filePath));

  assert.strictEqual(result.status, 2);
  assert.ok(result.stderr.includes('python3 -m py_compile'), '错误信息应包含 python3 -m py_compile');
}

function testBashLintFailure() {
  const dir = createTempDir('lint-bash-');
  const filePath = path.join(dir, 'broken.sh');
  fs.writeFileSync(filePath, '#!/usr/bin/env bash\nif [ "$VAR" = "x" ]\n  echo hi\nfi\n');

  const result = runHook('lint-bash.js', createPayload(filePath));

  assert.strictEqual(result.status, 2);
  assert.ok(result.stderr.includes('bash -n'), '错误信息应包含 bash -n');
}

function testJsonLintFailure() {
  const dir = createTempDir('lint-json-');
  const filePath = path.join(dir, 'bad.json');
  fs.writeFileSync(filePath, '{"foo": }');

  const result = runHook('lint-json.js', createPayload(filePath));

  assert.strictEqual(result.status, 2);
  assert.ok(result.stderr.includes('json.tool'), '错误信息应包含 json.tool');
}

function testEslintSkipWithoutConfig() {
  const dir = createTempDir('lint-eslint-skip-');
  const filePath = path.join(dir, 'skip.js');
  fs.writeFileSync(filePath, 'const a = 1;\n');

  const result = runHook('lint-eslint.js', createPayload(filePath), { cwd: dir });

  assert.strictEqual(result.status, 0);
  assert.strictEqual(result.stderr.trim(), '');
}

function testEslintFailureWithStub() {
  const dir = createTempDir('lint-eslint-fail-');
  const filePath = path.join(dir, 'fail.js');
  fs.writeFileSync(filePath, 'const unused = 1;\n');

  fs.writeFileSync(path.join(dir, 'eslint.config.js'), 'module.exports = {};\n');

  const eslintBin = path.join(dir, 'node_modules', '.bin', 'eslint');
  fs.mkdirSync(path.dirname(eslintBin), { recursive: true });
  fs.writeFileSync(
    eslintBin,
    '#!/usr/bin/env bash\necho "Fake ESLint error" >&2\nexit 1\n',
    { mode: 0o755 },
  );

  const result = runHook('lint-eslint.js', createPayload(filePath), {
    cwd: dir,
    env: {
      ...process.env,
      PATH: `${path.dirname(eslintBin)}:${process.env.PATH}`,
    },
  });

  assert.strictEqual(result.status, 2);
  assert.ok(result.stderr.includes('Fake ESLint error'), '错误信息应包含 ESLint 假错误输出');
}

function testMarkdownLintWarning() {
  const dir = createTempDir('lint-markdown-');
  const filePath = path.join(dir, 'warn.md');
  fs.writeFileSync(filePath, '#标题\n正文\n'); // 刻意违反常见规则

  const markdownlintBin = path.join(dir, 'markdownlint');
  fs.writeFileSync(
    markdownlintBin,
    '#!/usr/bin/env bash\necho "Fake markdownlint warning" >&2\nexit 1\n',
    { mode: 0o755 },
  );

  const result = runHook('lint-markdown.js', createPayload(filePath), {
    env: {
      ...process.env,
      MARKDOWNLINT_BIN: markdownlintBin,
    },
  });

  assert.strictEqual(result.status, 0);
  assert.ok(result.stderr.includes('MarkdownLint 提示'), '应输出 MarkdownLint 提示文案');
  assert.ok(result.stderr.includes('Fake markdownlint warning'), '应包含 markdownlint 命令输出');
}

function runTests() {
  const tests = [
    ['PHP lint 失败', testPhpLintFailure],
    ['Python lint 失败', testPythonLintFailure],
    ['Bash lint 失败', testBashLintFailure],
    ['JSON lint 失败', testJsonLintFailure],
    ['ESLint 缺少配置自动跳过', testEslintSkipWithoutConfig],
    ['ESLint stub 失败', testEslintFailureWithStub],
    ['Markdown lint 产生告警但不阻断', testMarkdownLintWarning],
  ];

  for (const [name, fn] of tests) {
    fn();
    process.stdout.write(`通过：${name}\n`);
  }
}

runTests();
