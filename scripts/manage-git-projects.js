#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG_FILE = path.join(__dirname, '..', 'local-projects.json');
const DEFAULT_CONFIG = {
  // 默认配置包含空项目列表以及基础目录信息
  projects: [],
  defaultAppsDir: 'apps',
  defaultBranch: 'master'
};

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.warn(`未找到配置文件，自动创建默认配置：${CONFIG_FILE}`);
    saveConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function cloneProject(project) {
  const { name, giteeUrl, branch = 'master' } = project;
  const targetDir = path.join(__dirname, '..', 'apps', name);

  if (fs.existsSync(targetDir)) {
    console.log(`Project ${name} already exists in apps/${name}`);
    return;
  }

  console.log(`Cloning ${name} from ${giteeUrl}...`);

  try {
    execSync(`git clone ${giteeUrl} ${targetDir}`, { stdio: 'inherit' });

    // Checkout specific branch if not master
    if (branch !== 'master') {
      execSync(`cd ${targetDir} && git checkout ${branch}`, { stdio: 'inherit' });
    }

    console.log(`Successfully cloned ${name} to apps/${name}`);
  } catch (error) {
    console.error(`Failed to clone ${name}:`, error.message);
    process.exit(1);
  }
}

function cloneFromUrl(name, giteeUrl) {
  const targetDir = path.join(__dirname, '..', 'apps', name);

  if (fs.existsSync(targetDir)) {
    console.log(`Project ${name} already exists in apps/${name}`);
    return;
  }

  console.log(`Cloning ${name} from ${giteeUrl}...`);

  try {
    execSync(`git clone ${giteeUrl} ${targetDir}`, { stdio: 'inherit' });

    // Update project list
    updateProjectList(name, giteeUrl);

    console.log(`Successfully cloned ${name} to apps/${name}`);
    console.log('\n📦 请在仓库根目录执行 yarn install 更新依赖');

  } catch (error) {
    console.error(`Failed to clone ${name}:`, error.message);
    process.exit(1);
  }
}

function updateProjectList(name, giteeUrl) {
  const config = loadConfig();

  // Check if project already exists in config
  const existingIndex = config.projects.findIndex(p => p.name === name);
  const projectInfo = {
    name,
    giteeUrl,
    branch: 'master'
  };

  if (existingIndex >= 0) {
    config.projects[existingIndex] = projectInfo;
    console.log(`Updated existing entry for ${name} in project list`);
  } else {
    config.projects.push(projectInfo);
    console.log(`Added ${name} to project list`);
  }

  saveConfig(config);
}

function pullProject(project) {
  const { name, branch = 'master' } = project;
  const targetDir = path.join(__dirname, '..', 'apps', name);

  if (!fs.existsSync(targetDir)) {
    console.log(`Project ${name} not found in apps/${name}, cloning instead...`);
    cloneProject(project);
    return;
  }

  console.log(`Pulling latest changes for ${name}...`);

  try {
    execSync(`cd ${targetDir} && git pull origin ${branch}`, { stdio: 'inherit' });
    console.log(`Successfully updated ${name}`);
  } catch (error) {
    console.error(`Failed to pull ${name}:`, error.message);
  }
}

function updateProject(name) {
  const targetDir = path.join(__dirname, '..', 'apps', name);

  if (!fs.existsSync(targetDir)) {
    console.error(`Project ${name} not found in apps/${name}`);
    process.exit(1);
  }

  console.log(`Updating ${name}...`);

  try {
    execSync(`cd ${targetDir} && git pull`, { stdio: 'inherit' });
    console.log(`Successfully updated ${name}`);
  } catch (error) {
    console.error(`Failed to update ${name}:`, error.message);
    process.exit(1);
  }
}


function listProjects() {
  const config = loadConfig();
  const appsDir = path.join(__dirname, '..', 'apps');

  console.log('Configured Gitee projects:');
  config.projects.forEach(project => {
    const exists = fs.existsSync(path.join(appsDir, project.name));
    console.log(`  ${project.name}: ${project.giteeUrl} ${exists ? '✓' : '✗'}`);
  });
}


function main() {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case 'clone-project':
      if (args.length !== 2) {
        console.error('Usage: clone-project <project-name> <repository-url>');
        console.error('Example: clone-project micro-mall https://gitee.com/umworks/micro-mall');
        process.exit(1);
      }
      const [projectName, repositoryUrl] = args;
      cloneFromUrl(projectName, repositoryUrl);
      break;

    case 'update-project':
      if (args.length !== 1) {
        console.error('Usage: update-project <project-name>');
        console.error('Example: update-project micro-mall');
        process.exit(1);
      }
      updateProject(args[0]);
      break;

    case 'sync-project':
      if (args.length > 0 && args[0].startsWith('http')) {
        // Direct clone with URL (legacy support)
        const urlParts = args[0].split('/');
        const repoName = urlParts[urlParts.length - 1].replace('.git', '');
        cloneFromUrl(repoName, args[0]);
      } else {
        // Clone all configured projects
        const config = loadConfig();
        config.projects.forEach(cloneProject);
      }
      break;

    case 'pull':
      const config = loadConfig();
      config.projects.forEach(pullProject);
      break;

    case 'list':
      listProjects();
      break;

    case 'sync':
      const syncConfig = loadConfig();
      syncConfig.projects.forEach(pullProject);
      break;

    default:
      console.log(`
Usage: node manage-gitee-projects.js <command> [args]

Commands:
  clone-project <name> <url>    Clone a new project and add to project list
  update-project <name>        Pull latest changes for an existing project
  clone [url]                  Clone project(s) - with URL clones directly (legacy)
  pull                         Pull updates for all configured projects
  sync                         Sync all configured projects (same as pull)
  list                         List all configured projects and their status

Examples:
  node manage-gitee-projects.js clone-project micro-mall https://gitee.com/umworks/micro-mall
  node manage-gitee-projects.js update-project micro-mall
  node manage-gitee-projects.js clone https://gitee.com/user/project.git
  node manage-gitee-projects.js pull
  node manage-gitee-projects.js list
      `);
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  loadConfig,
  cloneProject,
  pullProject,
  listProjects
};
