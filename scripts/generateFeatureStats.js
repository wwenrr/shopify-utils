#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const APP_ROOT = path.resolve(__dirname, '..');
const START_PATH = APP_ROOT;
const ARG_REPO = '--repo';
const LOG_FORMAT = '%H\\|%an\\|%ad\\|%s';
const COMMIT_TYPE_MAP = {
  feat: 'feature',
  feature: 'feature',
  bugfix: 'bugfix',
  fix: 'bugfix',
  hotfix: 'bugfix',
  enhance: 'enhancement',
  chore: 'chore',
  style: 'style',
};

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg.startsWith(`${ARG_REPO}=`)) {
      options.repo = arg.split('=')[1];
      continue;
    }
    if (arg === ARG_REPO) {
      options.repo = argv[index + 1];
      index += 1;
    }
  }
  return options;
}

const cliOptions = parseArgs(process.argv.slice(2));
const resolvedRepoRoot = resolveRepoRoot(cliOptions.repo);
const repoRoot = resolvedRepoRoot;
const gitDir = path.join(repoRoot, '.git');
const featuresDir = path.join(APP_ROOT, 'src', 'features');
const publicDir = path.join(APP_ROOT, 'public');
const outputPath = path.join(publicDir, 'feature-stats.json');

ensureGitDir();
ensurePublicDir();

function resolveRepoRoot(repoArg) {
  if (repoArg) {
    const target = path.resolve(repoArg);
    if (fs.existsSync(path.join(target, '.git'))) {
      return target;
    }
    console.error(`Không tìm thấy thư mục .git tại ${target}`);
    process.exit(1);
  }

  const autoDetected = findGitRoot(START_PATH);
  if (!autoDetected) {
    console.error('Không tìm thấy repo git nào (tìm lên trên nhưng không có .git).');
    process.exit(1);
  }
  return autoDetected;
}

function findGitRoot(startPath) {
  let current = startPath;
  while (current && current !== path.parse(current).root) {
    if (fs.existsSync(path.join(current, '.git'))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return fs.existsSync(path.join(current, '.git')) ? current : null;
}

function ensureGitDir() {
  if (!fs.existsSync(gitDir)) {
    console.error(`Không tìm thấy thư mục .git tại ${gitDir}`);
    process.exit(1);
  }
}

function ensurePublicDir() {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
}

function runGit(args) {
  try {
    const output = execSync(`git ${args}`, {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 10 * 1024 * 1024,
    });
    return output.toString().trim();
  } catch (error) {
    return null;
  }
}

function getFeatureDirectories() {
  if (!fs.existsSync(featuresDir)) {
    return [];
  }

  return fs
    .readdirSync(featuresDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function buildFeatureStats(featureName) {
  const featurePath = path.join(featuresDir, featureName);
  const relativePath = toRepoRelativePath(featurePath);
  const commitCountRaw = runGit(`rev-list --count HEAD -- "${relativePath}"`);
  const commitCount = commitCountRaw ? Number(commitCountRaw) : 0;
  const lastCommitRaw = runGit(
    `log -1 --pretty=format:${LOG_FORMAT} --date=iso -- "${relativePath}"`
  );

  return {
    feature: featureName,
    commitCount,
    lastCommit: lastCommitRaw ? parseCommit(lastCommitRaw) : null,
  };
}

function parseCommit(raw) {
  const [hash, author, date, ...messageParts] = raw.split('|');
  const message = messageParts.join('|');
  return {
    hash,
    author,
    date,
    message,
    type: detectCommitType(message),
  };
}

function detectCommitType(message) {
  if (!message) {
    return 'other';
  }

  const normalized = message.trim().toLowerCase();
  const prefix = normalized.split(':')[0];
  if (COMMIT_TYPE_MAP[prefix]) {
    return COMMIT_TYPE_MAP[prefix];
  }
  return 'other';
}

function writeOutputFile(payload) {
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
  console.log(`Feature stats saved to ${path.relative(APP_ROOT, outputPath)}`);
}

function getCommitHistory() {
  const logRaw = runGit(`log --pretty=format:${LOG_FORMAT} --date=iso`);
  if (!logRaw) {
    return [];
  }
  return logRaw
    .split('\n')
    .filter(Boolean)
    .map(parseCommit);
}

function main() {
  const features = getFeatureDirectories();
  const featureStats = features.map(buildFeatureStats);
  const commits = getCommitHistory();
  const payload = {
    generatedAt: new Date().toISOString(),
    repoRoot,
    appRoot: APP_ROOT,
    totalCommits: commits.length,
    commits,
    features: featureStats,
  };

  writeOutputFile(payload);
}

main();

function toRepoRelativePath(targetPath) {
  const relativePath = path.relative(repoRoot, targetPath);
  return relativePath.split(path.sep).join(path.posix.sep);
}

