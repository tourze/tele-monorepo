#!/usr/bin/env node
'use strict';

/**
 * llmignore 钩子测试：验证默认允许、单层拒绝、多层覆盖等场景。
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const HOOK_PATH = path.join(__dirname, 'llmignore.js');

function runHook(payload) {
  const output = execFileSync('node', [HOOK_PATH], {
    input: `${JSON.stringify(payload)}\n`,
    encoding: 'utf8',
  });
  return output;
}

function createTempProject() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'llmignore-js-'));
  return tempDir;
}

function writeFileSyncRecursive(targetPath, content) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content, 'utf8');
}

function testAllowWhenNoRules() {
  const projectDir = createTempProject();
  const filePath = path.join(projectDir, 'src', 'index.js');
  writeFileSyncRecursive(filePath, '// test');

  const payload = {
    tool_name: 'Write',
    tool_input: {
      file_path: filePath,
    },
  };

  const output = runHook(payload);
  assert.strictEqual(output.trim(), '');
}

function testSingleLevelDeny() {
  const projectDir = createTempProject();
  const llmignorePath = path.join(projectDir, '.llmignore');
  fs.writeFileSync(llmignorePath, '[no-access]\nsrc/\n', 'utf8');

  const filePath = path.join(projectDir, 'src', 'blocked.txt');
  writeFileSyncRecursive(filePath, 'blocked');

  const payload = {
    tool_name: 'Write',
    tool_input: {
      file_path: filePath,
    },
  };

  const output = runHook(payload);
  const parsed = JSON.parse(output);

  assert.strictEqual(parsed.hookSpecificOutput.permissionDecision, 'deny');
  assert(
    parsed.hookSpecificOutput.permissionDecisionReason.includes('no-access'),
    '拒绝信息应包含 no-access 提示',
  );
}

function testMultiLevelAggregation() {
  const projectDir = createTempProject();
  const nestedDir = path.join(projectDir, 'config', 'private');

  fs.writeFileSync(path.join(projectDir, '.llmignore'), '[read-only]\nconfig/\n', 'utf8');
  fs.mkdirSync(path.join(projectDir, 'config'), { recursive: true });
  fs.writeFileSync(path.join(projectDir, 'config', '.llmignore'), '[no-access]\nprivate/secret.txt\n', 'utf8');

  const filePath = path.join(nestedDir, 'secret.txt');
  writeFileSyncRecursive(filePath, 'top secret');

  const payload = {
    tool_name: 'Write',
    tool_input: {
      file_path: filePath,
    },
  };

  const output = runHook(payload);
  const parsed = JSON.parse(output);

  assert.strictEqual(parsed.hookSpecificOutput.permissionDecision, 'deny');
  assert(
    parsed.hookSpecificOutput.permissionDecisionReason.includes('no-access'),
    '多层规则应选择更严格的 no-access',
  );
}

function runTests() {
  const tests = [
    ['无规则允许', testAllowWhenNoRules],
    ['单层 no-access 拒绝', testSingleLevelDeny],
    ['多层规则聚合', testMultiLevelAggregation],
  ];

  for (const [name, fn] of tests) {
    fn();
    process.stdout.write(`通过：${name}\n`);
  }
}

runTests();

