#!/usr/bin/env node
'use strict';

/**
 * lint-eslint.js
 * JS/TS 语法检查钩子，若本地存在 ESLint 及配置则运行严格模式。
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const {
  readJsonInput,
  extractFilePath,
  shellQuote,
  runLintCommand,
  buildFailureMessage,
} = require('./lint-common');

const ESLINT_CONFIG_FILES = [
  'eslint.config.js',
  'eslint.config.cjs',
  'eslint.config.mjs',
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.json',
  '.eslintrc.yaml',
  '.eslintrc.yml',
];

function resolveEslintBinary() {
  const cwd = process.cwd();
  const localCandidate = path.join(cwd, 'node_modules', '.bin', 'eslint');
  if (fs.existsSync(localCandidate)) {
    return localCandidate;
  }

  const result = spawnSync('bash', ['-lc', 'command -v eslint >/dev/null 2>&1'], { encoding: 'utf8' });
  if (result.status === 0) {
    return 'eslint';
  }

  return null;
}

function hasEslintConfig() {
  return ESLINT_CONFIG_FILES.some((candidate) => fs.existsSync(path.join(process.cwd(), candidate)));
}

function main() {
  const context = readJsonInput();
  const filePath = extractFilePath(context);

  if (!filePath || !/\.(jsx?|tsx?)$/i.test(filePath)) {
    process.exit(0);
  }

  if (!fs.existsSync(filePath)) {
    process.exit(0);
  }

  const eslintBinary = resolveEslintBinary();
  if (!eslintBinary || !hasEslintConfig()) {
    process.exit(0);
  }

  const command = `${shellQuote(eslintBinary)} --format unix --max-warnings=0 ${shellQuote(filePath)}`;
  const result = runLintCommand(command);

  if (result.status === 0) {
    process.exit(0);
  }

  const message = buildFailureMessage(filePath, command, result.output.trimEnd());
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
  resolveEslintBinary,
  hasEslintConfig,
};

