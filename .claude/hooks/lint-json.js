#!/usr/bin/env node
'use strict';

/**
 * lint-json.js
 * JSON 校验钩子，借助 python3 -m json.tool 校验格式。
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

  if (!filePath || !/\.json$/i.test(filePath)) {
    process.exit(0);
  }

  if (!fs.existsSync(filePath)) {
    process.exit(0);
  }

  const command = `python3 -m json.tool ${shellQuote(filePath)} > /dev/null`;
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

