#!/usr/bin/env node
'use strict';

/**
 * llmignore 钩子 JS 版本：读取 stdin JSON 输入，根据 .llmignore 规则判断是否允许本次文件修改。
 */

const fs = require('fs');
const path = require('path');

const Section = Object.freeze({
  DEFAULT: 'default',
  NO_ACCESS: 'no-access',
  READ_ONLY: 'read-only',
});

class Rule {
  constructor(pattern, section) {
    this.pattern = pattern;
    this.section = section;
  }

  getPattern() {
    return this.pattern;
  }

  getSection() {
    return this.section;
  }

  isNoAccess() {
    return this.section === Section.NO_ACCESS;
  }

  isReadOnly() {
    return this.section === Section.READ_ONLY;
  }

  isDefault() {
    return this.section === Section.DEFAULT;
  }
}

class ParseResult {
  constructor() {
    this.rules = [];
  }

  addRule(rule) {
    this.rules.push(rule);
  }

  getRules() {
    return this.rules;
  }

  count() {
    return this.rules.length;
  }
}

class Matcher {
  constructor(rules) {
    this.rules = rules;
  }

  matchesAny(filePath) {
    return this.matches(filePath) !== null;
  }

  matches(filePath) {
    const normalizedPath = this.normalizePath(filePath);

    for (const rule of this.rules) {
      if (this.matchesPattern(normalizedPath, rule.getPattern())) {
        return rule;
      }
    }

    return null;
  }

  normalizePath(targetPath) {
    return targetPath.replace(/\\/g, '/').replace(/^\/+/, '');
  }

  matchesPattern(filePath, pattern) {
    const normalizedPattern = this.normalizePath(pattern);

    if (normalizedPattern.endsWith('/')) {
      const trimmed = normalizedPattern.slice(0, -1);
      return filePath === trimmed || filePath.startsWith(`${trimmed}/`);
    }

    const regex = this.convertGlobToRegex(normalizedPattern);
    return regex.test(filePath);
  }

  convertGlobToRegex(glob) {
    let regex = glob.replace(/([\\^$.|+()[\]{}])/g, '\\$1');

    const placeholder = '\x00';
    const wrap = (token) => `${placeholder}${token}${placeholder}`;

    regex = regex.replace(/\/\*\*\/\*/g, wrap('CURRENTANDSUBDIRS'));
    regex = regex.split('/**/').join(`/${wrap('ANYDIR')}/`);
    regex = regex.split('/**').join(`/${wrap('SLASHANYDIR')}`);
    regex = regex.split('**/').join(wrap('ANYDIRSLASH'));
    regex = regex.split('**').join(wrap('ANY'));
    regex = regex.split('*').join(wrap('STAR'));
    regex = regex.split('?').join(wrap('QUESTION'));

    regex = regex.split(wrap('CURRENTANDSUBDIRS')).join('/(?:.*/)?[^/]*');
    regex = regex.split(wrap('ANYDIRSLASH')).join('(?:.*/)?');
    regex = regex.split(wrap('SLASHANYDIR')).join('(?:/.*)?');
    regex = regex.split(wrap('ANYDIR')).join('.*');
    regex = regex.split(wrap('ANY')).join('.*');
    regex = regex.split(wrap('STAR')).join('[^/]*');
    regex = regex.split(wrap('QUESTION')).join('[^/]');

    return new RegExp(`^${regex}$`);
  }
}

class Parser {
  parse(content) {
    const lines = content.split('\n');
    const result = new ParseResult();
    let currentSection = Section.DEFAULT;

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line || line.startsWith('#')) {
        continue;
      }

      if (line === '[no-access]') {
        currentSection = Section.NO_ACCESS;
        continue;
      }

      if (line === '[read-only]') {
        currentSection = Section.READ_ONLY;
        continue;
      }

      const pattern = this.extractPattern(line);
      if (pattern) {
        result.addRule(new Rule(pattern, currentSection));
      }
    }

    return result;
  }

  extractPattern(line) {
    const commentPos = line.indexOf('#');
    const cleaned = commentPos === -1 ? line : line.slice(0, commentPos);
    return cleaned.trim();
  }
}

class AccessControl {
  constructor(parseResult) {
    this.matcher = new Matcher(parseResult.getRules());
  }

  canAccess(filePath) {
    const rule = this.matcher.matches(filePath);
    return rule === null || !rule.isNoAccess();
  }

  isNoAccess(filePath) {
    const rule = this.matcher.matches(filePath);
    return rule !== null && rule.isNoAccess();
  }

  canModify(filePath) {
    const rule = this.matcher.matches(filePath);
    return rule === null || rule.isDefault();
  }

  isReadOnly(filePath) {
    const rule = this.matcher.matches(filePath);
    return rule !== null && rule.isReadOnly();
  }

  getAccessLevel(filePath) {
    const rule = this.matcher.matches(filePath);
    return rule ? rule.getSection() : Section.DEFAULT;
  }
}

class LLMIgnore {
  constructor() {
    this.parser = new Parser();
    this.parseResult = null;
    this.accessControl = null;
  }

  loadFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    this.loadFromString(content);
  }

  loadFromString(content) {
    this.parseResult = this.parser.parse(content);
    this.accessControl = new AccessControl(this.parseResult);
  }

  ensureLoaded() {
    if (!this.accessControl) {
      throw new Error('No .llmignore file loaded. Call loadFromFile() or loadFromString() first.');
    }
  }

  canAccess(filePath) {
    this.ensureLoaded();
    return this.accessControl.canAccess(filePath);
  }

  canModify(filePath) {
    this.ensureLoaded();
    return this.accessControl.canModify(filePath);
  }

  isReadOnly(filePath) {
    this.ensureLoaded();
    return this.accessControl.isReadOnly(filePath);
  }

  isNoAccess(filePath) {
    this.ensureLoaded();
    return this.accessControl.isNoAccess(filePath);
  }

  getAccessLevel(filePath) {
    this.ensureLoaded();
    return this.accessControl.getAccessLevel(filePath);
  }

  getParseResult() {
    return this.parseResult;
  }
}

function toAbsolutePath(targetPath) {
  if (!path.isAbsolute(targetPath)) {
    return path.resolve(process.cwd(), targetPath);
  }
  return targetPath;
}

function findLLMIgnoreFiles(startPath) {
  let currentPath = toAbsolutePath(startPath);

  try {
    if (fs.existsSync(currentPath) && fs.statSync(currentPath).isFile()) {
      currentPath = path.dirname(currentPath);
    }
  } catch {
    currentPath = path.dirname(currentPath);
  }

  const visited = new Set();
  const chain = [];

  while (!visited.has(currentPath)) {
    visited.add(currentPath);

    const candidate = path.join(currentPath, '.llmignore');
    if (fs.existsSync(candidate)) {
      chain.push(candidate);
    }

    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      break;
    }

    currentPath = parentPath;
  }

  return chain.reverse();
}

function normalizeForMatching(filePath, llmignoreDir) {
  let normalizedPath = filePath.replace(/\\/g, '/');
  let normalizedDir = llmignoreDir.replace(/\\/g, '/');

  if (normalizedPath.startsWith('/')) {
    if (normalizedDir && normalizedPath.startsWith(`${normalizedDir}/`)) {
      normalizedPath = normalizedPath.slice(normalizedDir.length + 1);
    } else if (normalizedPath === normalizedDir) {
      normalizedPath = '.';
    }
  }

  return normalizedPath.replace(/^\/+/, '');
}

function loadLLMIgnoreChain(filePath, precomputed) {
  const llmignoreFiles = precomputed ?? findLLMIgnoreFiles(filePath);
  return llmignoreFiles.map((llmignorePath) => {
    const llmIgnore = new LLMIgnore();
    llmIgnore.loadFromFile(llmignorePath);
    return {
      llmIgnore,
      baseDir: path.dirname(llmignorePath),
      llmignorePath,
    };
  });
}

function evaluateAccessAcrossChain(filePath, chain) {
  let bestMatch = null;
  let bestSeverity = -1;

  for (const entry of chain) {
    const relativePath = normalizeForMatching(filePath, entry.baseDir);
    const section = entry.llmIgnore.getAccessLevel(relativePath);

    let severity = 0;
    if (section === Section.NO_ACCESS) {
      severity = 2;
    } else if (section === Section.READ_ONLY) {
      severity = 1;
    }

    if ((severity > bestSeverity || (severity === bestSeverity && severity > 0)) && severity > 0) {
      bestSeverity = severity;
      bestMatch = {
        entry,
        section,
        relativePath,
      };

      if (severity === 2) {
        break;
      }
    }
  }

  if (bestMatch) {
    return {
      denied: true,
      section: bestMatch.section,
      entry: bestMatch.entry,
      relativePath: bestMatch.relativePath,
    };
  }

  return {
    denied: false,
  };
}

function main() {
  let input;

  try {
    input = fs.readFileSync(0, 'utf8');
  } catch (error) {
    process.stderr.write(`Error: Failed to read input (${error.message})\n`);
    process.exit(1);
  }

  if (input === undefined) {
    process.stderr.write('Error: Failed to read input\n');
    process.exit(1);
  }

  let inputData;
  try {
    inputData = JSON.parse(input);
  } catch (error) {
    process.stderr.write(`Error: Invalid JSON input: ${error.message}\n`);
    process.exit(1);
  }

  const toolName = inputData.tool_name ?? '';
  const toolInput = inputData.tool_input ?? {};

  let filePath = null;
  if (toolName === 'Write') {
    filePath = toolInput.file_path ?? '';
  } else if (toolName === 'Edit' || toolName === 'MultiEdit') {
    filePath = toolInput.file_path ?? '';
  }

  if (!filePath) {
    process.exit(0);
  }

  const llmignoreFiles = findLLMIgnoreFiles(filePath);
  if (llmignoreFiles.length === 0) {
    process.exit(0);
  }

  let llmignoreChain;
  try {
    llmignoreChain = loadLLMIgnoreChain(filePath, llmignoreFiles);
  } catch (error) {
    process.stderr.write(`Error loading .llmignore file: ${error.message}\n`);
    process.exit(1);
  }

  const evaluation = evaluateAccessAcrossChain(filePath, llmignoreChain);
  if (evaluation.denied) {
    let message = `禁止修改文件: ${filePath}`;

    if (evaluation.section === Section.NO_ACCESS) {
      message += ' (文件被标记为 no-access)';
    } else if (evaluation.section === Section.READ_ONLY) {
      message += ' (文件被标记为 read-only)';
    }

    message += ' 请勿使用任何工具（内置工具、系统命令等）对该文件进行修改。';

    const output = {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: message,
      },
    };

    process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
    process.exit(0);
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = {
  Section,
  Rule,
  ParseResult,
  Matcher,
  Parser,
  AccessControl,
  LLMIgnore,
  normalizeForMatching,
  findLLMIgnoreFiles,
  loadLLMIgnoreChain,
  evaluateAccessAcrossChain,
  main,
};
