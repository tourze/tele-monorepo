#!/usr/bin/env node
'use strict';

/**
 * phpstan-require-path.js
 * 确保 Bash 工具调用 phpstan analyse 时必须指定明确的路径，且禁止扫描 packages 根目录。
 */

const fs = require('fs');
const path = require('path');

function readJsonInput() {
  try {
    const raw = fs.readFileSync(0, 'utf8');
    if (!raw.trim()) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function normalizePath(target) {
  if (typeof target !== 'string') {
    return '';
  }

  let normalized = target.trim().replace(/[\\]+/g, '/');
  normalized = normalized.replace(/\/{2,}/g, '/');
  normalized = normalized.replace(/^\.\/+/, '');
  normalized = normalized.replace(/\/+$/, '');
  return normalized;
}

function gatherForbiddenTargets(workdir) {
  const targets = new Set();
  targets.add('packages');

  if (workdir) {
    const joined = path.join(workdir, 'packages');
    targets.add(normalizePath(joined));
    const real = fs.existsSync(joined) ? fs.realpathSync(joined) : null;
    if (real) {
      targets.add(normalizePath(real));
    }
  }

  return Array.from(targets).filter(Boolean);
}

function candidateHitsForbidden(candidate, forbidden, workdir) {
  const variants = new Set();
  variants.add(normalizePath(candidate));

  if (workdir) {
    const joined = path.join(workdir, candidate);
    variants.add(normalizePath(joined));
    if (fs.existsSync(joined)) {
      variants.add(normalizePath(fs.realpathSync(joined)));
    }
  }

  if (fs.existsSync(candidate)) {
    variants.add(normalizePath(fs.realpathSync(candidate)));
  }

  return Array.from(variants).some((variant) => forbidden.includes(variant));
}

function parseTokens(command) {
  return command.trim().split(/\s+/);
}

function locatePhpStan(tokens) {
  for (let i = 0; i < tokens.length; i += 1) {
    const candidate = tokens[i].replace(/^['"]|['"]$/g, '');
    const base = path.basename(candidate);
    if (base === 'phpstan' || base === 'phpstan.phar' || candidate.includes('vendor/bin/phpstan')) {
      return i;
    }
  }
  return null;
}

function isAllowedSubcommand(subcmd) {
  const allowed = new Set([
    'help', 'list', 'pro', 'pro:help', 'pro:login', 'pro:logout', 'pro:status',
    'clear-result-cache', 'clear', 'cache:clear', 'dump-deps', 'dump-types', 'version',
  ]);

  if (['-h', '--help'].includes(subcmd)) {
    return true;
  }

  if (['-v', '-V', '--version'].includes(subcmd)) {
    return true;
  }

  return allowed.has(subcmd);
}

function extractPaths(tokens, startIndex) {
  const positional = [];
  const pathsFile = [];

  const optsExpectValue = new Set([
    '-c', '--configuration',
    '-l', '--level',
    '--error-format', '--autoload-file',
    '--memory-limit', '--paths-file',
    '--generate-baseline', '--baseline',
    '--project-dir', '--xdebug', '--debug',
  ]);

  let skipNext = false;
  let sawDoubleDash = false;

  for (let i = startIndex; i < tokens.length; i += 1) {
    let token = tokens[i].replace(/^['"]|['"]$/g, '');
    if (!token) {
      continue;
    }

    if (skipNext) {
      skipNext = false;
      continue;
    }

    if (token === '--') {
      sawDoubleDash = true;
      continue;
    }

    if (token.startsWith('--paths-file=')) {
      const value = token.slice('--paths-file='.length);
      if (value) {
        pathsFile.push(value);
      }
      continue;
    }

    if (token === '--paths-file') {
      const next = tokens[i + 1] ? tokens[i + 1].replace(/^['"]|['"]$/g, '') : '';
      if (next && !next.startsWith('-')) {
        pathsFile.push(next);
      }
      skipNext = true;
      continue;
    }

    if (!sawDoubleDash && token.startsWith('-')) {
      if (!token.includes('=') && optsExpectValue.has(token)) {
        skipNext = true;
      }
      continue;
    }

    positional.push(token);
  }

  return { positional, pathsFile };
}

function collectPathsFromFiles(pathsFileEntries, workdir) {
  const results = [];

  for (const fileEntry of pathsFileEntries) {
    const originalPath = fileEntry;
    let candidate = originalPath;
    if (workdir && !path.isAbsolute(candidate)) {
      candidate = path.join(workdir, candidate);
    }

    if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
      continue;
    }

    const content = fs.readFileSync(candidate, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      results.push({
        value: trimmed,
        source: `paths-file:${originalPath}`,
      });
    }
  }

  return results;
}

function buildBlockedMessage(entries) {
  const lines = [
    '🚫 Blocked: phpstan analyse 禁止以 packages 目录作为扫描目标。',
    'Reason: packages 目录体量过大，会让静态分析极慢且浪费资源。',
    'Action: 限定到具体子包或子目录，再重新执行命令。',
    'Detected:',
  ];

  for (const entry of entries) {
    lines.push(`  - ${entry.value} (from ${entry.source})`);
  }

  lines.push('Example: ./vendor/bin/phpstan analyse packages/foo/src');
  return `${lines.join('\n')}\n`;
}

function main() {
  const payload = readJsonInput();
  if (!payload || payload.tool_name !== 'Bash') {
    process.exit(0);
  }

  const command = String(payload.tool_input?.command ?? '');
  if (!command.includes('phpstan')) {
    process.exit(0);
  }

  const tokens = parseTokens(command);
  const phpStanIdx = locatePhpStan(tokens);
  if (phpStanIdx === null) {
    process.exit(0);
  }

  let subcmd = tokens[phpStanIdx + 1] ? tokens[phpStanIdx + 1].replace(/^['"]|['"]$/g, '') : null;
  subcmd = subcmd ? subcmd.toLowerCase() : null;

  if (subcmd && isAllowedSubcommand(subcmd)) {
    process.exit(0);
  }

  let isAnalyse = false;
  let scanIndex = phpStanIdx + 1;

  if (subcmd === 'analyse' || subcmd === 'analyze') {
    isAnalyse = true;
    scanIndex = phpStanIdx + 2;
  } else if (!subcmd || subcmd.startsWith('-')) {
    isAnalyse = true;
    scanIndex = phpStanIdx + 1;
  } else {
    process.exit(0);
  }

  if (!isAnalyse) {
    process.exit(0);
  }

  const { positional, pathsFile } = extractPaths(tokens, scanIndex);

  if (positional.length === 0 && pathsFile.length === 0) {
    const msg = [
      '🚫 Blocked: phpstan must be scoped with explicit paths.',
      'Reason: Running phpstan without target directories can scan the entire repo and time out.',
      'Action: Re-run with at least one path or --paths-file.',
      'Examples:',
      '  ./vendor/bin/phpstan analyse src tests',
      '  php -d memory_limit=1G ./vendor/bin/phpstan analyse --paths-file=phpstan.paths',
    ].join('\n');
    process.stderr.write(`${msg}\n`);
    process.exit(2);
  }

  const workdir = typeof payload.tool_input?.workdir === 'string' && payload.tool_input.workdir
    ? payload.tool_input.workdir
    : process.cwd();

  const forbidden = gatherForbiddenTargets(workdir);

  const collected = [...positional.map((value) => ({ value, source: 'argument' }))];
  const fromFiles = collectPathsFromFiles(pathsFile, workdir);
  collected.push(...fromFiles);

  const blocked = collected.filter((entry) => candidateHitsForbidden(entry.value, forbidden, workdir));

  if (blocked.length > 0) {
    process.stderr.write(buildBlockedMessage(blocked));
    process.exit(2);
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = {
  readJsonInput,
  normalizePath,
  gatherForbiddenTargets,
  candidateHitsForbidden,
  parseTokens,
  locatePhpStan,
  isAllowedSubcommand,
  extractPaths,
  collectPathsFromFiles,
  buildBlockedMessage,
  main,
};
