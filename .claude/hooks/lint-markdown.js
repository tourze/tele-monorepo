#!/usr/bin/env node
'use strict';

/**
 * lint-markdown.js
 * Markdown lint 钩子，调用 markdownlint 检查语法，但仅以告警形式提示。
 */

const fs = require('fs');
const path = require('path');
const {
  readJsonInput,
  extractFilePath,
  shellQuote,
  runLintCommand,
} = require('./lint-common');

const MARKDOWN_PATTERN = /\.(md|markdown)$/i;

function resolveCommand(filePath) {
  const customBin = process.env.MARKDOWNLINT_BIN;
  if (customBin && customBin.trim().length > 0) {
    const quotedBin = shellQuote(customBin);
    return {
      command: `${quotedBin} ${shellQuote(filePath)}`,
      display: `${quotedBin} ${shellQuote(filePath)}`,
    };
  }

  const localBin = path.join(process.cwd(), 'node_modules', '.bin', 'markdownlint');
  if (fs.existsSync(localBin)) {
    const quotedLocal = shellQuote(localBin);
    return {
      command: `${quotedLocal} ${shellQuote(filePath)}`,
      display: `${quotedLocal} ${shellQuote(filePath)}`,
    };
  }

  const fallback = `npx --no-install markdownlint ${shellQuote(filePath)}`;
  return {
    command: fallback,
    display: fallback,
  };
}

function buildWarningMessage(filePath, command, output) {
  let message = '⚠️ MarkdownLint 提示（不会阻断当前操作）\n';
  message += `文件: ${filePath}\n`;
  message += `命令: ${command}\n`;
  message += 'Lint 输出:\n';
  message += '---\n';
  message += output.trimEnd();
  message += '\n---\n';
  message += '请酌情调整 Markdown 排版，以提升可读性。\n';
  return message;
}

function main() {
  const context = readJsonInput();
  const filePath = extractFilePath(context);

  if (!filePath || !MARKDOWN_PATTERN.test(filePath)) {
    process.exit(0);
  }

  if (!fs.existsSync(filePath)) {
    process.exit(0);
  }

  const { command, display } = resolveCommand(filePath);
  const result = runLintCommand(command);

  if (result.status === 0) {
    process.exit(0);
  }

  const output = result.output && result.output.trim().length > 0
    ? result.output
    : 'markdownlint 返回非零状态，但未产生输出。';
  const message = buildWarningMessage(filePath, display, output);
  process.stderr.write(`${message}\n`);
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
};
