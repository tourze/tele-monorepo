#!/usr/bin/env node
'use strict';

/**
 * phpstan-require-path 钩子测试。
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const HOOK_PATH = path.join(__dirname, 'phpstan-require-path.js');

function runHook(command, options = {}) {
  const payload = {
    tool_name: 'Bash',
    tool_input: {
      command,
      workdir: options.workdir,
    },
  };

  const result = spawnSync('node', [HOOK_PATH], {
    input: `${JSON.stringify(payload)}\n`,
    encoding: 'utf8',
    cwd: options.cwd ?? process.cwd(),
  });

  return result;
}

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function testNonPhpStanCommandPass() {
  const result = runHook('ls -la');
  assert.strictEqual(result.status, 0);
}

function testAnalyseWithoutPathsBlocked() {
  const tmp = createTempDir('phpstan-hook-');
  const result = runHook('./vendor/bin/phpstan analyse', { workdir: tmp, cwd: tmp });

  assert.strictEqual(result.status, 2);
  assert.ok(result.stderr.includes('phpstan must be scoped with explicit paths'));
}

function testAnalyseWithPathsAllowed() {
  const tmp = createTempDir('phpstan-hook-');
  fs.mkdirSync(path.join(tmp, 'src'), { recursive: true });

  const result = runHook('./vendor/bin/phpstan analyse src', { workdir: tmp, cwd: tmp });

  assert.strictEqual(result.status, 0);
}

function testAnalyseTargetingPackagesBlocked() {
  const tmp = createTempDir('phpstan-hook-');
  fs.mkdirSync(path.join(tmp, 'packages'), { recursive: true });

  const result = runHook('./vendor/bin/phpstan analyse packages', { workdir: tmp, cwd: tmp });

  assert.strictEqual(result.status, 2);
  assert.ok(result.stderr.includes('禁止以 packages 目录作为扫描目标'));
}

function testPathsFileBlockedWhenListingPackages() {
  const tmp = createTempDir('phpstan-hook-');
  fs.mkdirSync(path.join(tmp, 'packages'), { recursive: true });

  const pathsFile = path.join(tmp, 'phpstan.paths');
  fs.writeFileSync(pathsFile, 'packages\n');

  const result = runHook(`./vendor/bin/phpstan analyse --paths-file=${pathsFile}`, { workdir: tmp, cwd: tmp });

  assert.strictEqual(result.status, 2);
  assert.ok(result.stderr.includes('packages 目录作为扫描目标'));
}

function testAllowedSubcommandSkipsChecks() {
  const result = runHook('./vendor/bin/phpstan help');
  assert.strictEqual(result.status, 0);
}

function runTests() {
  const tests = [
    ['非 phpstan 命令直接通过', testNonPhpStanCommandPass],
    ['analyse 缺少路径被拦截', testAnalyseWithoutPathsBlocked],
    ['analyse 指定路径放行', testAnalyseWithPathsAllowed],
    ['analyse 指向 packages 被拦截', testAnalyseTargetingPackagesBlocked],
    ['paths-file 指向 packages 被拦截', testPathsFileBlockedWhenListingPackages],
    ['help 子命令跳过检查', testAllowedSubcommandSkipsChecks],
  ];

  for (const [name, fn] of tests) {
    fn();
    process.stdout.write(`通过：${name}\n`);
  }
}

runTests();

