#!/usr/bin/env node
'use strict';

/**
 * lint-common.js
 * 提供各语言 lint 钩子共用的基础能力：读取输入、解析文件路径、执行命令与生成错误信息。
 */

const fs = require('fs');
const { spawnSync } = require('child_process');

function readJsonInput() {
  let rawInput;

  try {
    rawInput = fs.readFileSync(0, 'utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error: Failed to read input (${message})\n`);
    process.exit(1);
  }

  if (rawInput === undefined) {
    process.stderr.write('Error: Failed to read input\n');
    process.exit(1);
  }

  if (!rawInput.trim()) {
    return {};
  }

  try {
    const data = JSON.parse(rawInput);
    return data ?? {};
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error: Invalid JSON input: ${message}\n`);
    process.exit(1);
  }
}

function extractFilePath(context) {
  if (!context || typeof context !== 'object') {
    return null;
  }

  const toolName = context.tool_name ?? '';
  const toolInput = context.tool_input ?? {};
  const toolResponse = context.tool_response ?? {};

  if (toolName === 'Edit' || toolName === 'MultiEdit') {
    return typeof toolInput.file_path === 'string' ? toolInput.file_path : null;
  }

  if (toolName === 'Write') {
    if (typeof toolResponse.filePath === 'string' && toolResponse.filePath.length > 0) {
      return toolResponse.filePath;
    }

    return typeof toolInput.file_path === 'string' ? toolInput.file_path : null;
  }

  return null;
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function runLintCommand(command) {
  const executed = `${command} 2>&1`;
  const result = spawnSync('bash', ['-lc', executed], {
    encoding: 'utf8',
  });

  if (result.error) {
    const message = result.error instanceof Error ? result.error.message : String(result.error);
    return {
      status: typeof result.status === 'number' ? result.status : 1,
      output: message,
    };
  }

  const status = typeof result.status === 'number' ? result.status : 0;
  const output = result.stdout ?? '';

  return { status, output };
}

function buildFailureMessage(filePath, command, output) {
  let message = '🚫 Syntax Error Detected!\n';
  message += `File: ${filePath}\n`;
  message += `Linter Command: ${command}\n`;
  message += 'Error Output:\n';
  message += '---\n';
  message += output;
  if (!output.endsWith('\n')) {
    message += '\n';
  }
  message += '---\n\n';
  message += 'Please fix this syntax error immediately.';

  return message;
}

module.exports = {
  readJsonInput,
  extractFilePath,
  shellQuote,
  runLintCommand,
  buildFailureMessage,
};

