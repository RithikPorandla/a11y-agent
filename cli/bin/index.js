#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const API_BASE = 'http://localhost:8000';

// ANSI terminal color helpers
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  underline: '\x1b[4m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m'
};

// Profile configuration path (workspace root)
const PROFILE_PATH = path.resolve('.a11y_agent_profile.json');

function loadProfile() {
  try {
    if (fs.existsSync(PROFILE_PATH)) {
      const data = fs.readFileSync(PROFILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    // Ignore, return default
  }
  return {
    xp: 0,
    streak: 1,
    last_active: new Date().toISOString().split('T')[0],
    badges: [],
    stats: {
      missing_alt: 0,
      div_button: 0,
      unlabelled_svg: 0,
      input_no_label: 0
    }
  };
}

function saveProfile(profile) {
  try {
    fs.writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 2), 'utf-8');
  } catch (e) {
    // Ignore
  }
}

function getLevelTitle(level) {
  if (level === 1) return 'A11y Apprentice';
  if (level === 2) return 'ARIA Ranger';
  if (level === 3) return 'Semantic Tactician';
  if (level === 4) return 'Compliance Overlord';
  return 'Universal Access Champion';
}

function awardCliXp(xpGained, patchTypes = []) {
  if (xpGained <= 0) return;
  
  const profile = loadProfile();
  const oldXp = profile.xp;
  const newXp = oldXp + xpGained;
  profile.xp = newXp;
  
  // Track stats
  if (!profile.stats) {
    profile.stats = { missing_alt: 0, div_button: 0, unlabelled_svg: 0, input_no_label: 0 };
  }
  
  patchTypes.forEach(t => {
    if (profile.stats[t] !== undefined) {
      profile.stats[t] += 1;
    }
  });

  const oldLevel = Math.floor(oldXp / 500) + 1;
  const newLevel = Math.floor(newXp / 500) + 1;
  const xpInLevel = newXp % 500;
  const barChars = Math.floor((xpInLevel / 500) * 20);
  const progressBar = `[${'█'.repeat(barChars)}${'░'.repeat(20 - barChars)}]`;
  const title = getLevelTitle(newLevel);

  console.log(`\n✨ ${colors.bold}${colors.green}XP EARNED:${colors.reset} ${colors.bold}+${xpGained} XP${colors.reset} gained! (${colors.cyan}${newXp} Total XP${colors.reset})`);
  console.log(`${colors.gray}   Level ${newLevel} ${title} ${progressBar} ${xpInLevel}/500 XP${colors.reset}`);

  if (newLevel > oldLevel) {
    console.log(`\n${colors.bold}${colors.magenta}🌟🌟🌟 LEVEL UP! 🌟🌟🌟${colors.reset}`);
    console.log(`${colors.bold}${colors.yellow}Ascended to Level ${newLevel}: ${title}!${colors.reset}`);
    console.log(`${colors.gray}You are making the digital world a more accessible place!${colors.reset}\n`);
  }

  // Check Badge Milestones
  if (!profile.badges) profile.badges = [];
  const milestones = [
    { key: 'alt_righteous', name: 'Alt-Righteous', stat: 'missing_alt', limit: 3, desc: 'Injected descriptive alt text tags to 3 image structures!' },
    { key: 'keyboard_gladiator', name: 'Keyboard Gladiator', stat: 'div_button', limit: 2, desc: 'Remediated 2 clickable div buttons to be fully keyboard-navigable!' },
    { key: 'svg_sage', name: 'SVG Sage', stat: 'unlabelled_svg', limit: 2, desc: 'Labeled 2 decorative SVG elements to declare proper graphic context!' },
    { key: 'label_legend', name: 'Label Legend', stat: 'input_no_label', limit: 2, desc: 'Associated labels or descriptive names to 2 raw form inputs!' }
  ];

  milestones.forEach(m => {
    if (!profile.badges.includes(m.key) && profile.stats[m.stat] >= m.limit) {
      profile.badges.push(m.key);
      console.log(`\n🏆 ${colors.bold}${colors.yellow}ACHIEVEMENT UNLOCKED: ${colors.bold}${colors.cyan}[${m.name}]${colors.reset}`);
      console.log(`   ${colors.bold}${colors.green}Description:${colors.reset} ${m.desc}`);
      console.log(`   Keep up the compliance crusade! Unlocked Trophies will glow in your Web Studio Dashboard. 🌟\n`);
    }
  });

  saveProfile(profile);
}

function printHeader() {
  console.log(`\n${colors.bold}${colors.cyan}🛡️  A11Y-AGENT : AI-GENERATED UI COMPLIANCE CLI${colors.reset}`);
  console.log(`${colors.gray}Automated digital accessibility post-processor for React templates${colors.reset}\n`);
}

function printUsage() {
  printHeader();
  console.log(`${colors.bold}Usage:${colors.reset}`);
  console.log(`  a11y-agent scan [dir]       ${colors.dim}Audit target directory for WCAG violations${colors.reset}`);
  console.log(`  a11y-agent patch-all [dir]  ${colors.dim}Audit and auto-remediate all files on disk${colors.reset}`);
  console.log(`  a11y-agent status           ${colors.dim}Check accessibility engine online status${colors.reset}`);
  console.log(`\n${colors.bold}Options:${colors.reset}`);
  console.log(`  [dir]                       ${colors.dim}Target path to audit (defaults to current directory ".")${colors.reset}\n`);
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
        fileList.push({
          relPath,
          absPath
        });
      }
    }
  }
  return fileList;
}

// Checks if the FastAPI backend is running
async function checkBackend() {
  try {
    const res = await fetch(`${API_BASE}/api/status`);
    if (res.ok) {
      const data = await res.json();
      return { online: true, gemini: data.gemini_active };
    }
  } catch (e) {
    // Offline
  }
  return { online: false, gemini: false };
}

// Prints backend offline warning panel
function printOfflineWarning() {
  console.log(`${colors.bgRed}${colors.bold} ENGINE OFFLINE ${colors.reset}`);
  console.log(`\n${colors.red}A11y-Agent Core Service is not running on ${API_BASE}.${colors.reset}`);
  console.log(`To resolve this and activate AI audits, run the following in your repository backend folder:`);
  console.log(`\n  ${colors.bold}python3 -m uvicorn main:app --reload${colors.reset}\n`);
}

// Color badges based on violation type
function getBadge(type) {
  switch (type) {
    case 'div_button':
      return `${colors.bold}${colors.yellow}[DIV BUTTON]${colors.reset}`;
    case 'unlabelled_svg':
    case 'missing_button_label':
      return `${colors.bold}${colors.cyan}[UNLABELLED SVG]${colors.reset}`;
    case 'input_no_label':
      return `${colors.bold}${colors.magenta}[INPUT LABEL]${colors.reset}`;
    case 'missing_alt':
      return `${colors.bold}${colors.red}[MISSING ALT]${colors.reset}`;
    default:
      return `${colors.bold}${colors.gray}[WCAG VIOLATION]${colors.reset}`;
  }
}

async function runScan(targetDir) {
  const resolvedDir = path.resolve(targetDir || '.');
  console.log(`${colors.cyan}🔍 Scanning directory: ${colors.bold}${resolvedDir}${colors.reset}`);

  const backend = await checkBackend();
  if (!backend.online) {
    printOfflineWarning();
    process.exit(1);
  }

  const filesToScan = crawlDirectory(resolvedDir);
  if (filesToScan.length === 0) {
    console.log(`\n${colors.yellow}No scan targets found (.tsx, .jsx, .html) in the directory.${colors.reset}\n`);
    return [];
  }

  console.log(`📦 Found ${colors.bold}${filesToScan.length}${colors.reset} templates. Dispatching to A11yEngine...`);

  // Build payloads
  const payloads = filesToScan.map(f => {
    try {
      const html = fs.readFileSync(f.absPath, 'utf-8');
      return {
        filename: f.relPath,
        html
      };
    } catch (e) {
      console.error(`${colors.red}Error reading ${f.relPath}: ${e.message}${colors.reset}`);
      return null;
    }
  }).filter(Boolean);

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
    let totalViolations = 0;

    results.forEach(file => {
      if (file.violations.length === 0) {
        console.log(`\n✅ ${colors.bold}${colors.green}${file.filename}${colors.reset} - ${colors.bold}100% WCAG COMPLIANT${colors.reset}`);
        return;
      }

      totalViolations += file.violations.length;
      console.log(`\n📄 ${colors.bold}${colors.underline}${file.filename}${colors.reset}`);
      console.log(`${colors.dim}A11y Compliance Score: ${colors.reset}${colors.bold}${file.original_score}%${colors.reset} (${colors.red}${file.violations.length} outstanding bugs${colors.reset})`);

      file.violations.forEach((v, idx) => {
        console.log(`  ${colors.bold}${idx + 1}.${colors.reset} ${getBadge(v.type)} ${colors.bold}${v.description}${colors.reset}`);
        console.log(`     ${colors.dim}Selector:  ${colors.reset}${colors.magenta}${v.selector}${colors.reset}`);
        console.log(`     ${colors.dim}Infringing:${colors.reset} ${colors.red}${v.html.trim()}${colors.reset}`);
        console.log(`     ${colors.dim}Fix Patch: ${colors.reset} ${colors.green}${v.suggestion.trim()}${colors.reset}`);
        console.log(`     ${colors.dim}Rationale: ${colors.reset}${colors.gray}${v.explanation}${colors.reset}\n`);
      });
    });

    console.log(`\n${colors.bold}============================================================${colors.reset}`);
    if (totalViolations === 0) {
      console.log(`🎉 ${colors.bold}${colors.green}ALL SYSTEMS CLEAR! All templates are 100% WCAG compliant.${colors.reset}`);
    } else {
      console.log(`⚠️  ${colors.bold}${colors.yellow}AUDIT COMPLETE. Discovered ${totalViolations} violations across ${results.length} files.${colors.reset}`);
      console.log(`To auto-remediate all files on disk, run:`);
      console.log(`  ${colors.bold}a11y-agent patch-all ${targetDir || ''}${colors.reset}`);
    }
    console.log(`${colors.bold}============================================================${colors.reset}\n`);

    // Award basic check-in scan XP
    awardCliXp(25);

    return results;

  } catch (e) {
    console.error(`\n${colors.red}❌ Scan Request Failed: ${e.message}${colors.reset}\n`);
    process.exit(1);
  }
}

async function runPatchAll(targetDir) {
  const resolvedDir = path.resolve(targetDir || '.');
  const results = await runScan(targetDir);

  if (results.length === 0) {
    return;
  }

  const filesWithViolations = results.filter(f => f.violations.length > 0);
  if (filesWithViolations.length === 0) {
    console.log(`${colors.green}No files need patching. Workspace is already fully compliant!${colors.reset}\n`);
    return;
  }

  console.log(`\n⚡ ${colors.bold}Applying high-precision structural patches back to files on disk...${colors.reset}`);

  let patchedCount = 0;

  filesWithViolations.forEach(file => {
    // Resolve absolute path back to original disk location
    const originalAbsPath = path.resolve(resolvedDir, file.filename);

    if (fs.existsSync(originalAbsPath)) {
      try {
        fs.writeFileSync(originalAbsPath, file.patched_html, 'utf-8');
        console.log(`  ✅ ${colors.green}Patched & Saved:${colors.reset} ${colors.bold}${file.filename}${colors.reset}`);
        patchedCount++;
      } catch (e) {
        console.error(`  ❌ ${colors.red}Failed writing patch to ${file.filename}: ${e.message}${colors.reset}`);
      }
    } else {
      console.error(`  ❌ ${colors.red}Target file disappeared during patching: ${file.filename}${colors.reset}`);
    }
  });

  // Gather all processed patch types across files
  const patchTypes = [];
  filesWithViolations.forEach(file => {
    file.violations.forEach(v => {
      patchTypes.push(v.type);
    });
  });
  
  // Award XP based on patches applied
  const patchesApplied = filesWithViolations.reduce((sum, f) => sum + f.violations.length, 0);
  awardCliXp(patchesApplied * 100, patchTypes);

  console.log(`\n🎉 ${colors.bold}${colors.green}SUCCESS! Auto-remediated ${patchedCount} React templates on disk!${colors.reset}`);
  console.log(`${colors.gray}Run "a11y-agent scan ${targetDir || ''}" to re-verify the new compliant code structure.${colors.reset}\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const target = args[1] || '.';

  if (!command) {
    printUsage();
    process.exit(0);
  }

  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      printUsage();
      break;
    case 'status':
      printHeader();
      console.log(`Checking A11y-Agent Core Service on ${colors.bold}${API_BASE}${colors.reset}...`);
      const backend = await checkBackend();
      if (backend.online) {
        console.log(`\n  🟢 ${colors.bold}${colors.green}ENGINE ONLINE${colors.reset}`);
        console.log(`  ✨ ${colors.bold}Gemini API Integration:${colors.reset} ${backend.gemini ? `${colors.green}Active (VLM Live)` : `${colors.yellow}Local Simulation (No Key)`}${colors.reset}\n`);
      } else {
        printOfflineWarning();
      }
      break;
    case 'scan':
      await runScan(target);
      break;
    case 'patch-all':
      await runPatchAll(target);
      break;
    default:
      console.log(`${colors.red}Unknown command: "${command}"${colors.reset}`);
      printUsage();
      process.exit(1);
  }
}

main();
