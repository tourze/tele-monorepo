const {exec} = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');

// 读取 channel_macos.txt 文件
const channelFile = path.join(__dirname, 'channel_macos.txt');
if (!fs.existsSync(channelFile)) {
  console.error(`Error: channel_macos.txt file not found at ${channelFile}`);
  process.exit(1);
}

const channels = fs
  .readFileSync(channelFile, 'utf-8')
  .trim()
  .split('\n')
  .map(line => line.trim())
  .filter(line => line);
if (channels.length === 0) {
  console.error('Error: No channels found in channel_macos.txt');
  process.exit(1);
}

// .dmg 文件所在的目录
const dmgDir = path.join(
  rootDir,
  'dist/target/universal-apple-darwin/release/bundle/dmg',
);

// 创建目标目录
const targetDir = path.join(rootDir, 'dist/dmg/telescope');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, {recursive: true});
}

// 清理旧目录
const cacheDir = path.join(
  rootDir,
  'dist/target/universal-apple-darwin/release/bundle',
);
exec(`rm -rf "${cacheDir}"`);

// 构建和移动 .dmg 文件
const buildAndMove = channel => {
  return new Promise((resolve, reject) => {
    console.log(`Building for channel: ${channel}, ${(new Date()).toISOString()}`);
    exec(
      `cross-env TAURI_CHANNEL=${channel} nx run telescope-react-native:build-macos-universal`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(
            `Error during build for channel ${channel}: ${error.message}`,
          );
          reject(error);
          return;
        }
        console.log(`Build output for channel ${channel}: ${stdout}`);

        // 遍历目录中的所有 .dmg 文件
        fs.readdir(dmgDir, (err, files) => {
          if (err) {
            console.error(`Error reading directory: ${err.message}`);
            reject(err);
            return;
          }

          files.forEach(file => {
            if (path.extname(file) === '.dmg') {
              const oldPath = path.join(dmgDir, file);
              const basename = path.basename(file, '.dmg');
              const newPath = path.join(
                targetDir,
                `${basename}-${channel}.dmg`,
              );

              try {
                fs.rmSync(newPath);
              } catch (e) {
              }

              fs.rename(oldPath, newPath, err => {
                if (err) {
                  console.error(
                    `Error moving and renaming file: ${err.message}`,
                  );
                  reject(err);
                } else {
                  console.log(`Moved and renamed ${file} to ${newPath}, ${(new Date()).toISOString()}`);
                  // 清理旧目录
                  const cacheDir = path.join(
                    rootDir,
                    'dist/target/universal-apple-darwin/release/bundle',
                  );
                  exec(`rm -rf ${cacheDir}`);
                }
              });
            }
          });

          // 延迟10s
          setTimeout(resolve, 1000 * 10);
        });
      },
    );
  });
};

// 依次处理所有渠道
const processChannels = async () => {
  for (const channel of channels) {
    try {
      await buildAndMove(channel);
    } catch (error) {
      console.error(`Failed to process channel ${channel}: ${error.message}`);
      process.exit(1);
    }
  }
  console.log('All channels processed successfully.');
};

processChannels();
