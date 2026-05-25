import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:8000';

// ANSI terminal color helpers
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m'
};

function getBadge(type) {
  switch (type) {
    case 'div_button': return 'DIV BUTTON';
    case 'unlabelled_svg':
    case 'missing_button_label': return 'UNLABELLED SVG';
    case 'input_no_label': return 'INPUT LABEL';
    case 'missing_alt': return 'MISSING ALT';
    default: return 'WCAG VIOLATION';
  }
}

// Walks directory recursively to gather .tsx, .jsx, and .html files
function crawlDirectory(dir, fileList = [], rootDir = dir) {
  const ignoreDirs = new Set([
    'node_modules', 'dist', 'build', '.git', '__pycache__',
    '.gemini', 'brain', 'venv', '.venv', 'env', '.env', 'cli'
  ]);
  
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.startsWith('.')) continue;
    const absPath = path.resolve(dir, file);
    const stat = fs.statSync(absPath);

    if (stat.isDirectory()) {
      const base = path.basename(absPath);
      if (!ignoreDirs.has(base)) {
        crawlDirectory(absPath, fileList, rootDir);
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.html')) {
        const relPath = path.relative(rootDir, absPath);
        fileList.push({ relPath, absPath });
      }
    }
  }
  return fileList;
}

async function main() {
  console.log(`\n🛡️  ${colors.bold}${colors.cyan}A11Y-AGENT PR BOT ACTIVATING...${colors.reset}`);

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const EVENT_PATH = process.env.GITHUB_EVENT_PATH;
  const REPO = process.env.GITHUB_REPOSITORY;

  if (!GITHUB_TOKEN) {
    console.log(`${colors.yellow}No GITHUB_TOKEN found. Skipping PR comments generation.${colors.reset}\n`);
    process.exit(0);
  }

  if (!EVENT_PATH || !fs.existsSync(EVENT_PATH)) {
    console.log(`${colors.yellow}No GITHUB_EVENT_PATH or event file found. Bot is running locally - skipping comments.${colors.reset}\n`);
    process.exit(0);
  }

  // Load GitHub PR context
  let prNumber, sha;
  try {
    const event = JSON.parse(fs.readFileSync(EVENT_PATH, 'utf-8'));
    if (event.pull_request) {
      prNumber = event.pull_request.number;
      sha = event.pull_request.head.sha;
      console.log(`Detected Pull Request: ${colors.bold}#${prNumber}${colors.reset} in ${colors.bold}${REPO}${colors.reset}`);
      console.log(`PR Head SHA: ${colors.bold}${sha}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}Event is not a Pull Request. Skipping comments.${colors.reset}\n`);
      process.exit(0);
    }
  } catch (e) {
    console.error(`${colors.red}Error parsing GITHUB_EVENT_PATH: ${e.message}${colors.reset}`);
    process.exit(1);
  }

  const targetDir = process.argv[2] || '.';
  const resolvedDir = path.resolve(targetDir);
  const filesToScan = crawlDirectory(resolvedDir);

  if (filesToScan.length === 0) {
    console.log(`No scan targets found.`);
    process.exit(0);
  }

  // Build payloads
  const payloads = filesToScan.map(f => {
    try {
      const html = fs.readFileSync(f.absPath, 'utf-8');
      return { filename: f.relPath, html };
    } catch (e) {
      return null;
    }
  }).filter(Boolean);

  console.log(`Auditing workspace templates for visual/structural corrections...`);
  
  try {
    const res = await fetch(`${API_BASE}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloads)
    });

    if (!res.ok) {
      throw new Error(`API scanning failed with HTTP ${res.status}`);
    }

    const results = await res.json();
    let commentCount = 0;

    for (const file of results) {
      if (file.violations.length === 0) continue;

      const patchedLines = file.patched_html.split('\n');

      for (const v of file.violations) {
        // Extract the target patched line content representing our compliance suggested patch
        const lineIdx = v.line - 1;
        if (lineIdx < 0 || lineIdx >= patchedLines.length) continue;
        const suggestedLine = patchedLines[lineIdx];

        console.log(`Generating code review suggestion for ${file.filename}:${v.line}...`);

        const commentBody = `### 🛡️ A11y-Agent Compliance Review Alert
**Type:** \`${getBadge(v.type)}\`
**Infraction:** ${v.description}

*Accessibility post-processing suggests the following compliance patch:*

\`\`\`suggestion
${suggestedLine}
\`\`\``;

        const commentPayload = {
          body: commentBody,
          commit_id: sha,
          path: file.filename,
          line: v.line,
          side: 'RIGHT'
        };

        const postUrl = `https://api.github.com/repos/${REPO}/pulls/${prNumber}/comments`;
        const postRes = await fetch(postUrl, {
          method: 'POST',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'A11y-Agent-PR-Bot'
          },
          body: JSON.stringify(commentPayload)
        });

        if (!postRes.ok) {
          const errText = await postRes.text();
          console.error(`  ❌ ${colors.red}Failed to post comment for line ${v.line}: ${errText}${colors.reset}`);
        } else {
          console.log(`  ✅ ${colors.green}Successfully posted review comment code suggestion!${colors.reset}`);
          commentCount++;
        }
      }
    }

    console.log(`\n🎉 ${colors.bold}${colors.green}PR COMMENTS COMPLETED! Posted ${commentCount} inline code suggestions review comments!${colors.reset}\n`);

  } catch (e) {
    console.error(`\n${colors.red}❌ PR Bot Failed: ${e.message}${colors.reset}\n`);
    process.exit(1);
  }
}

main();
