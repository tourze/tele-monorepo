#!/usr/bin/env node

/**
 * 将类似 apps/yiling-taro/src/foo.tsx 的路径转换为
 * yarn --cwd apps/yiling-taro eslint src/foo.tsx 并执行。
 */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const inputPaths = process.argv.slice(2);

if (inputPaths.length === 0) {
  console.error('Usage: node eslint-run.js <workspace-relative-path> [...]');
  process.exit(1);
}

const resolveTarget = (rawPath) => {
  const normalized = rawPath.replace(/\\/g, '/').replace(/^\.?\/*/, '');
  const segments = normalized.split('/').filter(Boolean);

  if (segments.length < 3) {
    throw new Error(`路径 "${rawPath}" 无法拆分为 <workspace>/<file> 结构`);
  }

  const workspaceDir = segments.slice(0, 2).join('/');
  const lintTarget = segments.slice(2).join('/');

  const workspaceAbs = path.resolve(process.cwd(), workspaceDir);
  if (!fs.existsSync(workspaceAbs) || !fs.statSync(workspaceAbs).isDirectory()) {
    throw new Error(`workspace 目录不存在：${workspaceDir}`);
  }

  return { workspaceDir, lintTarget };
};

const runCommand = ({ workspaceDir, lintTarget }) =>
  new Promise((resolve, reject) => {
    const args = ['--cwd', workspaceDir, 'eslint', lintTarget];
    const command = spawn('yarn', args, { stdio: 'inherit' });

    command.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`命令失败：yarn ${args.join(' ')}`));
      }
    });

    command.on('error', reject);
  });

(async () => {
  try {
    for (const rawPath of inputPaths) {
      const target = resolveTarget(rawPath);
      console.log(`[eslint-run] yarn --cwd ${target.workspaceDir} eslint ${target.lintTarget}`);
      await runCommand(target);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();
