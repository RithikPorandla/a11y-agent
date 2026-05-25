import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

// Read JSON input from standard input
async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.on('data', chunk => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
    process.stdin.on('error', err => {
      reject(err);
    });
  });
}

async function main() {
  let browser = null;
  try {
    const inputStr = await readStdin();
    if (!inputStr.trim()) {
      console.log(JSON.stringify({ success: false, error: "Empty input received via stdin" }));
      process.exit(1);
    }

    const payload = JSON.parse(inputStr);
    const { file_path, selector } = payload;

    if (!file_path || !selector) {
      console.log(JSON.stringify({ success: false, error: "Missing file_path or selector in payload" }));
      process.exit(1);
    }

    // Standardize paths
    const resolvedPath = path.resolve(file_path);
    const dir = path.dirname(fileURLToPath(import.meta.url));
    
    // Create unique temporary names in the backend directory to prevent parallel lock collisions
    const rand = Math.floor(Math.random() * 100000);
    const defaultPath = path.join(dir, `temp_default_${rand}.png`);
    const focusedPath = path.join(dir, `temp_focused_${rand}.png`);

    // Launch headless Chromium
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Load local file
    await page.goto(`file://${resolvedPath}`, { waitUntil: 'load' });

    // Wait for the element
    const element = await page.waitForSelector(selector, { timeout: 3000 });
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    // Scroll into view and add margin for visual context
    await page.evaluate(el => {
      el.scrollIntoView({ block: 'center', inline: 'center' });
    }, element);
    
    // Small delay to let rendering / layout settle
    await new Promise(r => setTimeout(r, 150));

    // Capture default state screenshot
    await element.screenshot({ path: defaultPath });

    // Focus the element to check keyboard focus indicators
    await page.focus(selector);
    
    // Wait for focus transitions to complete
    await new Promise(r => setTimeout(r, 150));

    // Capture focused state screenshot
    await element.screenshot({ path: focusedPath });

    await browser.close();

    console.log(JSON.stringify({
      success: true,
      default_image: defaultPath,
      focused_image: focusedPath,
      error: null
    }));

  } catch (e) {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        // Ignore
      }
    }
    console.log(JSON.stringify({ success: false, error: `Puppeteer execution failed: ${e.message}` }));
  }
}

main();
