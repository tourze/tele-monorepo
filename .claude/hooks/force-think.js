#!/usr/bin/env node
'use strict';

/**
 * force-think 钩子 JS 版本：拦截用户提问，在缺少 think 关键字时追加提醒。
 */

const fs = require('fs');

function parseInput(raw) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const response = {
      decision: 'block',
      reason: `Error: Invalid JSON input. ${message}`,
    };
    process.stdout.write(`${JSON.stringify(response, null, 2)}\n`);
    process.exit(1);
  }
}

function containsThink(prompt) {
  if (typeof prompt !== 'string') {
    return false;
  }
  return prompt.toLowerCase().includes('think');
}

function buildResponse() {
  return {
    reason: 'Appended "think hard" to the prompt for deeper analysis.',
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: '\n（请一定要 think hard）',
    },
  };
}

function main() {
  let inputRaw;

  try {
    inputRaw = fs.readFileSync(0, 'utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error: Failed to read input (${message})\n`);
    process.exit(1);
  }

  if (inputRaw === undefined) {
    process.stderr.write('Error: Failed to read input\n');
    process.exit(1);
  }

  const context = parseInput(inputRaw) ?? {};
  const prompt = context.prompt ?? '';

  if (containsThink(prompt)) {
    process.exit(0);
  }

  const response = buildResponse();
  process.stdout.write(`${JSON.stringify(response, null, 2)}\n`);
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = {
  parseInput,
  containsThink,
  buildResponse,
  main,
};

