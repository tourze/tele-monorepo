#!/usr/bin/env node
'use strict';

/**
 * lint-php.js
 * PHP 语法检查钩子，将 php -l 应用于最新修改的文件。
 */

const fs = require('fs');
const {
  readJsonInput,
  extractFilePath,
  shellQuote,
  runLintCommand,
  buildFailureMessage,
} = require('./lint-common');

function main() {
  const context = readJsonInput();
  const filePath = extractFilePath(context);

  if (!filePath || !/\.php$/i.test(filePath)) {
    process.exit(0);
  }

  if (!fs.existsSync(filePath)) {
    process.exit(0);
  }

  const command = `php -l ${shellQuote(filePath)}`;
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
};

