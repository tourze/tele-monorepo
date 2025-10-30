#!/usr/bin/env node

/**
 * 简易工作区列表工具
 * 读取根目录 package.json 的 workspaces 配置并输出实际存在的子项目
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON_PATH = path.join(PROJECT_ROOT, 'package.json');

function loadWorkspacePatterns() {
  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    throw new Error('未找到 package.json，无法读取工作区配置');
  }

  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  const raw = packageJson.workspaces;

  if (Array.isArray(raw)) {
    return raw;
  }

  if (raw && Array.isArray(raw.packages)) {
    return raw.packages;
  }

  return [];
}

function readWorkspaceEntries(pattern) {
  if (pattern.endsWith('/*')) {
    const dir = pattern.slice(0, -2);
    const absDir = path.join(PROJECT_ROOT, dir);

    if (!fs.existsSync(absDir)) {
      return [{
        pattern,
        directory: dir,
        exists: false
      }];
    }

    return fs.readdirSync(absDir)
      .filter(item => {
        const target = path.join(absDir, item);
        return fs.statSync(target).isDirectory();
      })
      .map(folder => {
        const packageJsonPath = path.join(absDir, folder, 'package.json');
        let packageName = '(未命名)';

        if (fs.existsSync(packageJsonPath)) {
          try {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            packageName = pkg.name || packageName;
          } catch {
            packageName = '(package.json 解析失败)';
          }
        }

        return {
          pattern,
          directory: path.join(dir, folder),
          exists: true,
          name: packageName
        };
      });
  }

  const absPath = path.join(PROJECT_ROOT, pattern);
  const packageJsonPath = path.join(absPath, 'package.json');
  let packageName = '(未命名)';

  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      packageName = pkg.name || packageName;
    } catch {
      packageName = '(package.json 解析失败)';
    }
  }

  return [{
    pattern,
    directory: pattern,
    exists: fs.existsSync(absPath),
    name: packageName
  }];
}

function main() {
  try {
    const patterns = loadWorkspacePatterns();

    if (!patterns.length) {
      console.log('未检测到 Yarn 工作区配置。');
      return;
    }

    console.log('📦 Yarn 工作区列表：\n');
    patterns.forEach(pattern => {
      console.log(`- 模式：${pattern}`);
      const entries = readWorkspaceEntries(pattern);

      entries.forEach(entry => {
        const status = entry.exists ? '✓' : '✗';
        const name = entry.name ? `（${entry.name}）` : '';
        console.log(`  ${status} ${entry.directory}${name}`);
      });

      console.log('');
    });
  } catch (err) {
    console.error(`列出工作区失败：${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
