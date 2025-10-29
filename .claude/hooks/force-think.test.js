#!/usr/bin/env node
'use strict';

/**
 * force-think 钩子测试：验证 think 追加逻辑与异常处理。
 */

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const HOOK_PATH = path.join(__dirname, 'force-think.js');

function runHook(input) {
  return spawnSync('node', [HOOK_PATH], {
    input: input.endsWith('\n') ? input : `${input}\n`,
    encoding: 'utf8',
  });
}

function testAppendWhenMissingThink() {
  const payload = JSON.stringify({ prompt: '请回答这个问题' });
  const result = runHook(payload);

  assert.strictEqual(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.strictEqual(parsed.hookSpecificOutput.additionalContext, '\n（请一定要 think hard）');
}

function testSkipWhenAlreadyContainsThink() {
  const payload = JSON.stringify({ prompt: 'please THINK about it' });
  const result = runHook(payload);

  assert.strictEqual(result.status, 0);
  assert.strictEqual(result.stdout.trim(), '');
}

function testInvalidJson() {
  const result = runHook('{invalid json');
  assert.notStrictEqual(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.strictEqual(parsed.decision, 'block');
}

function runTests() {
  const tests = [
    ['缺少 think 时追加提示', testAppendWhenMissingThink],
    ['已有 think 时不处理', testSkipWhenAlreadyContainsThink],
    ['无效 JSON 时阻止', testInvalidJson],
  ];

  for (const [name, fn] of tests) {
    fn();
    process.stdout.write(`通过：${name}\n`);
  }
}

runTests();

