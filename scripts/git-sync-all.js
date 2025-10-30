#!/usr/bin/env node
/**
 * 统一对多个 Git 仓库执行 push/pull 操作
 * - 覆盖范围：仓库根目录 + apps/* + packages/*
 * - 用法：
 *   node scripts/git-sync-all.js push
 *   node scripts/git-sync-all.js pull
 *
 * 注意：
 * - 本脚本默认不会自动提交未提交的更改，仅推送已提交的内容；
 * - 如存在未提交更改，push 会跳过该仓库并给出提示；
 * - pull 使用 --rebase --autostash（若不支持会降级），以减少合并提交；
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');

function logRepo(title, repoPath) {
  const name = repoPath === PROJECT_ROOT ? 'root(仓库根)' : path.basename(repoPath);
  console.log(`\n================ ${title}: ${name} ================`);
  console.log(repoPath);
}

function run(cmd, cwd) {
  return execSync(cmd, { cwd, stdio: 'pipe', encoding: 'utf8' }).trim();
}

function safeRun(cmd, cwd) {
  try {
    return run(cmd, cwd);
  } catch (e) {
    return null;
  }
}

function hasGitDir(dir) {
  // 兼容 .git 目录或文件（worktree/submodule 场景）
  const p = path.join(dir, '.git');
  return fs.existsSync(p);
}

function isGitRepo(dir) {
  try {
    const out = run('git rev-parse --is-inside-work-tree', dir);
    return out === 'true';
  } catch {
    return false;
  }
}

function collectRepos() {
  const repos = [];

  // 根仓库
  if (hasGitDir(PROJECT_ROOT) && isGitRepo(PROJECT_ROOT)) {
    repos.push(PROJECT_ROOT);
  }

  // apps/*
  const appsDir = path.join(PROJECT_ROOT, 'apps');
  if (fs.existsSync(appsDir) && fs.statSync(appsDir).isDirectory()) {
    for (const name of fs.readdirSync(appsDir)) {
      const dir = path.join(appsDir, name);
      if (fs.statSync(dir).isDirectory() && hasGitDir(dir) && isGitRepo(dir)) {
        repos.push(dir);
      }
    }
  }

  // packages/*
  const pkgsDir = path.join(PROJECT_ROOT, 'packages');
  if (fs.existsSync(pkgsDir) && fs.statSync(pkgsDir).isDirectory()) {
    for (const name of fs.readdirSync(pkgsDir)) {
      const dir = path.join(pkgsDir, name);
      if (fs.statSync(dir).isDirectory() && hasGitDir(dir) && isGitRepo(dir)) {
        repos.push(dir);
      }
    }
  }

  return repos;
}

function currentBranch(repo) {
  const b = safeRun('git rev-parse --abbrev-ref HEAD', repo);
  return b || null;
}

function hasUncommittedChanges(repo) {
  const status = safeRun('git status --porcelain', repo) || '';
  return status.length > 0;
}

function ensureUpstream(repo, branch) {
  const upstream = safeRun('git rev-parse --abbrev-ref --symbolic-full-name @{u}', repo);
  if (!upstream) {
    // 自动设置上游到 origin/<branch>
    console.log(`未检测到上游分支，为 ${branch} 设置上游到 origin/${branch} ...`);
    try {
      run(`git push -u origin ${branch}`, repo);
      return true;
    } catch (e) {
      console.error('设置上游失败：', e.message);
      return false;
    }
  }
  return true;
}

function doPush(repo) {
  logRepo('准备推送', repo);

  const branch = currentBranch(repo);
  if (!branch || branch === 'HEAD') {
    console.warn('无法确定当前分支，跳过。');
    return;
  }

  if (hasUncommittedChanges(repo)) {
    console.warn('存在未提交更改，已跳过该仓库。请先提交后再推送。');
    return;
  }

  // 先 fetch 更新远端引用
  safeRun('git fetch --all --prune', repo);

  if (!ensureUpstream(repo, branch)) {
    console.warn('未能设置上游分支，跳过推送。');
    return;
  }

  try {
    const out = run('git push', repo);
    console.log(out || '推送完成');
  } catch (e) {
    console.error('推送失败：', e.message);
  }
}

function doPull(repo) {
  logRepo('准备拉取', repo);

  const branch = currentBranch(repo);
  if (!branch || branch === 'HEAD') {
    console.warn('无法确定当前分支，跳过。');
    return;
  }

  // 若未设置上游，尝试设置；若失败则仅 fetch
  const hasUpstream = !!safeRun('git rev-parse --abbrev-ref --symbolic-full-name @{u}', repo);
  if (!hasUpstream) {
    console.warn('未检测到上游分支，尝试先 fetch...');
    safeRun('git fetch --all --prune', repo);
    // 不自动设置上游分支，避免误拉错分支
  }

  // 优先使用 rebase/autostash，失败时回退
  let pulled = false;
  const cmds = [
    'git pull --rebase --autostash',
    'git pull --rebase',
    'git pull'
  ];
  for (const cmd of cmds) {
    try {
      const out = run(cmd, repo);
      console.log(out || `拉取完成（${cmd}）`);
      pulled = true;
      break;
    } catch (e) {
      console.warn(`尝试 ${cmd} 失败：${e.message}`);
    }
  }

  if (!pulled) {
    console.error('拉取失败，请手动处理冲突或检查网络/权限。');
  }
}

function main() {
  const cmd = process.argv[2];
  if (!cmd || !['push', 'pull'].includes(cmd)) {
    console.log('用法: node scripts/git-sync-all.js <push|pull>');
    process.exit(1);
  }

  const repos = collectRepos();
  if (!repos.length) {
    console.log('未发现任何 Git 仓库（根、apps/*、packages/*）。');
    process.exit(0);
  }

  console.log(`共发现 ${repos.length} 个仓库：`);
  repos.forEach(r => console.log(' - ' + (r === PROJECT_ROOT ? `${r} (root)` : r)));

  for (const repo of repos) {
    try {
      if (cmd === 'push') doPush(repo);
      else doPull(repo);
    } catch (e) {
      console.error('处理仓库时出现错误：', e.message);
    }
  }
}

if (require.main === module) {
  main();
}

