#!/usr/bin/env node

const path = require('path');
const fs = require('fs/promises');

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const sourceDir = path.join(projectRoot, 'src', 'shared', 'config');
  const targetDir = path.join(projectRoot, 'build', 'config');

  const copiedFiles = await copyJsonFiles(sourceDir, targetDir);
  if (copiedFiles.length === 0) {
    console.log('Không tìm thấy file JSON nào trong src/shared/config để sao chép.');
    return;
  }

  console.log(
    `Đã sao chép ${copiedFiles.length} file JSON từ src/shared/config -> build/config: ${copiedFiles.join(
      ', '
    )}`
  );
}

main().catch((error) => {
  console.error('Copy config thất bại:', error);
  process.exit(1);
});

async function copyJsonFiles(sourceDir, targetDir) {
  const entries = await safeReadDir(sourceDir);
  if (!entries.length) {
    return [];
  }

  await fs.mkdir(targetDir, { recursive: true });

  const copied = [];
  for (const entry of entries) {
    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== '.json') {
      continue;
    }

    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    await fs.copyFile(sourcePath, targetPath);
    copied.push(entry.name);
  }

  return copied;
}

async function safeReadDir(targetDir) {
  try {
    return await fs.readdir(targetDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

