#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG_FILE = path.join(__dirname, '..', 'gitee-projects.json');

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error('Configuration file not found:', CONFIG_FILE);
    process.exit(1);
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

function cloneFromUrl(giteeUrl) {
  // Extract project name from URL
  const urlParts = giteeUrl.split('/');
  const repoName = urlParts[urlParts.length - 1].replace('.git', '');
  const targetDir = path.join(__dirname, '..', 'apps', repoName);

  if (fs.existsSync(targetDir)) {
    console.log(`Project ${repoName} already exists in apps/${repoName}`);
    return;
  }

  console.log(`Cloning ${repoName} from ${giteeUrl}...`);

  try {
    execSync(`git clone ${giteeUrl} ${targetDir}`, { stdio: 'inherit' });
    console.log(`Successfully cloned ${repoName} to apps/${repoName}`);
  } catch (error) {
    console.error(`Failed to clone ${repoName}:`, error.message);
    process.exit(1);
  }
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
    case 'clone':
      if (args.length > 0 && args[0].startsWith('http')) {
        // Direct clone with URL
        cloneFromUrl(args[0]);
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
  clone [url]   Clone project(s) - with URL clones directly, without URL clones all configured
  pull          Pull updates for all configured projects
  sync          Sync all configured projects (same as pull)
  list          List all configured projects and their status

Examples:
  node manage-gitee-projects.js clone
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