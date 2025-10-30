#!/usr/bin/env node

/**
 * OpenSpec 验证脚本
 *
 * 这个脚本用于验证整个工作区的 OpenSpec 规范遵循情况
 * 包括检查项目配置、代码质量、规范文件等
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OPENSPEC_ROOT = path.join(PROJECT_ROOT, 'openspec');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(level, message) {
  const timestamp = new Date().toISOString().slice(11, 19);
  const color = colors[level] || colors.reset;
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

function success(message) { log('green', `✓ ${message}`); }
function warning(message) { log('yellow', `⚠ ${message}`); }
function error(message) { log('red', `✗ ${message}`); }
function info(message) { log('blue', `ℹ ${message}`); }

// 检查 OpenSpec 目录结构
function validateOpenSpecStructure() {
  info('验证 OpenSpec 目录结构...');

  const requiredFiles = [
    'AGENTS.md',
    'project.md'
  ];

  const requiredDirs = [
    'specs',
    'changes',
    'changes/archive'
  ];

  let isValid = true;

  for (const file of requiredFiles) {
    const filePath = path.join(OPENSPEC_ROOT, file);
    if (fs.existsSync(filePath)) {
      success(`${file} 存在`);
    } else {
      error(`${file} 不存在`);
      isValid = false;
    }
  }

  for (const dir of requiredDirs) {
    const dirPath = path.join(OPENSPEC_ROOT, dir);
    if (fs.existsSync(dirPath)) {
      success(`${dir}/ 目录存在`);
    } else {
      error(`${dir}/ 目录不存在`);
      isValid = false;
    }
  }

  return isValid;
}

// 检查项目配置
function validateProjectConfigs() {
  info('验证项目配置...');

  const appsDir = path.join(PROJECT_ROOT, 'apps');
  if (!fs.existsSync(appsDir)) {
    warning('apps 目录不存在');
    return true;
  }

  const projects = fs.readdirSync(appsDir)
    .filter(item => fs.statSync(path.join(appsDir, item)).isDirectory());

  let isValid = true;

  for (const project of projects) {
    const projectDir = path.join(appsDir, project);
    const openspecFile = path.join(projectDir, '.openspec');

    if (fs.existsSync(openspecFile)) {
      success(`${project} 项目有 .openspec 配置`);

      try {
        const config = JSON.parse(fs.readFileSync(openspecFile, 'utf8'));
        if (config.extends && config.project) {
          success(`${project} .openspec 配置格式正确`);
        } else {
          warning(`${project} .openspec 配置可能不完整`);
        }
      } catch (err) {
        error(`${project} .openspec 配置解析失败: ${err.message}`);
        isValid = false;
      }
    } else {
      warning(`${project} 项目没有 .openspec 配置`);
    }
  }

  return isValid;
}

// 检查工作区配置
function validateWorkspaceConfig() {
  info('验证 Yarn 工作区配置...');

  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    error('package.json 不存在');
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const rawWorkspaces = packageJson.workspaces;
    let patterns = [];

    if (Array.isArray(rawWorkspaces)) {
      patterns = rawWorkspaces;
    } else if (rawWorkspaces && Array.isArray(rawWorkspaces.packages)) {
      patterns = rawWorkspaces.packages;
    }

    if (!patterns.length) {
      error('未检测到 workspaces 配置');
      return false;
    }

    success(`检测到 ${patterns.length} 个工作区模式`);

    const requiredPatterns = ['apps/*', 'packages/*'];
    let allRequiredPresent = true;

    for (const required of requiredPatterns) {
      if (patterns.includes(required)) {
        success(`包含工作区模式：${required}`);
      } else {
        warning(`缺少工作区模式：${required}`);
        allRequiredPresent = false;
      }
    }

    const workspaceDirs = patterns
      .filter(pattern => pattern.endsWith('/*'))
      .map(pattern => pattern.replace('/*', ''));

    let dirsValid = true;
    for (const dir of workspaceDirs) {
      const workspaceDirPath = path.join(PROJECT_ROOT, dir);
      if (fs.existsSync(workspaceDirPath) && fs.statSync(workspaceDirPath).isDirectory()) {
        success(`${dir}/ 目录存在`);
      } else {
        warning(`${dir}/ 目录不存在`);
        dirsValid = false;
      }
    }

    return allRequiredPresent && dirsValid;
  } catch (err) {
    error(`package.json 解析失败: ${err.message}`);
    return false;
  }
}

// 运行 OpenSpec 验证（如果可用）
function runOpenSpecValidation() {
  info('尝试运行 OpenSpec CLI 验证...');

  try {
    const result = execSync('npx openspec --version', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    success(`OpenSpec CLI 已安装: ${result.trim()}`);

    // 尝试验证所有规范和变更
    execSync('openspec validate --all', {
      stdio: 'inherit',
      cwd: PROJECT_ROOT
    });

    success('OpenSpec CLI 验证通过');
    return true;
  } catch (err) {
    warning(`OpenSpec CLI 验证失败: ${err.message}`);
    info('请确保已安装 OpenSpec CLI: npm install -g openspec');
    return false;
  }
}

// 主函数
function main() {
  info('开始 OpenSpec 工作区验证...');
  console.log('');

  const results = [];

  results.push(validateOpenSpecStructure());
  console.log('');

  results.push(validateProjectConfigs());
  console.log('');

  results.push(validateWorkspaceConfig());
  console.log('');

  results.push(runOpenSpecValidation());
  console.log('');

  // 总结
  const passedCount = results.filter(Boolean).length;
  const totalCount = results.length;

  if (passedCount === totalCount) {
    success(`所有验证通过 (${passedCount}/${totalCount})`);
    info('你的 OpenSpec 配置已准备就绪！');
  } else {
    warning(`部分验证失败 (${passedCount}/${totalCount})`);
    info('请查看上述警告和错误信息，修复后重新运行验证。');
  }

  // 返回适当的退出码
  process.exit(passedCount === totalCount ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  validateOpenSpecStructure,
  validateProjectConfigs,
  validateWorkspaceConfig,
  runOpenSpecValidation
};
