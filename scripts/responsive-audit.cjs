/*
 * Usage: node scripts/responsive-audit.cjs before|after OUTPUT_DIR BASE_URL
 * Tool packages may be installed separately from the app. Set AUDIT_MODULE_PATHS
 * to a path.delimiter-separated list of node_modules directories if necessary.
 * This tests public routes and customer overlays; it does not sign in as admin.
 */
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const moduleRoots = (process.env.AUDIT_MODULE_PATHS || '').split(path.delimiter).filter(Boolean);
function dependency(name) {
  for (const root of [path.resolve('node_modules'), ...moduleRoots]) {
    try { return createRequire(path.join(root, '..', 'package.json'))(name); } catch {}
  }
  throw new Error(`Missing audit dependency ${name}; install it separately or set AUDIT_MODULE_PATHS.`);
}
const { chromium, webkit } = dependency('playwright');
const AxeBuilder = dependency('@axe-core/playwright').default;
const [phase = 'before', output = 'responsive-results', base = 'http://127.0.0.1:4173'] = process.argv.slice(2);
const selectedEngine = process.env.AUDIT_ENGINE;
const sizes = [320, 360, 375, 390, 402, 412, 430, 440, 768, 1280, 1440].map(width => ({ width, height: width >= 1280 ? 1000 : 900 }));
sizes.push({ width: 956, height: 440 });
const routes = { home: 'Featured Products', products: 'Our Products', about: 'Our Story', contact: 'Get in Touch' };
fs.mkdirSync(output, { recursive: true });

function measure() {
  const viewport = { width: document.documentElement.clientWidth, height: innerHeight };
  const selector = el => {
    if (el.id) return `#${el.id}`;
    const classes = [...el.classList].slice(0, 4).map(name => `.${CSS.escape(name)}`).join('');
    return el.tagName.toLowerCase() + classes;
  };
  const visible = el => {
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (!r.width || !r.height || style.display === 'none' || style.visibility === 'hidden') return false;
    for (let parent = el; parent; parent = parent.parentElement) if (Number(getComputedStyle(parent).opacity) === 0) return false;
    return true;
  };
  const geometry = el => {
    const rect = el.getBoundingClientRect();
    return { element: selector(el), text: (el.getAttribute('aria-label') || el.innerText || el.getAttribute('placeholder') || '').trim().slice(0, 100), x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  };
  const overlay = [...document.querySelectorAll('div.fixed')].find(el => visible(el) && (el.classList.contains('max-w-4xl') || el.classList.contains('inset-y-0')));
  const scope = overlay || document.body;
  const elements = [scope, ...scope.querySelectorAll('*')].filter(visible);
  const overflowing = elements.filter(el => {
    const r = el.getBoundingClientRect();
    return r.right > viewport.width + 1 || r.left < -1;
  }).map(geometry);
  const interactive = elements.filter(el => el.matches('button,a[href],input:not([type=hidden]),textarea,select,[role=button]'));
  const taps = interactive.map(el => ({ el, ...geometry(el) }));
  const smallTargets = taps.filter(target => target.width < 44 || target.height < 44).map(target => {
    const x = target.x + target.width / 2, y = target.y + target.height / 2;
    const nearby = taps.filter(other => other.el !== target.el && Math.abs(other.x + other.width / 2 - x) < (Math.max(44, other.width) + Math.max(44, target.width)) / 2 && Math.abs(other.y + other.height / 2 - y) < (Math.max(44, other.height) + Math.max(44, target.height)) / 2);
    const { el, ...result } = target;
    return { ...result, equivalentSpacing: nearby.length === 0, nearby: nearby.map(other => other.element) };
  });
  const text = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const el = node.parentElement;
    if (!node.textContent.trim() || !scope.contains(el) || !visible(el) || el.closest('script,style,svg,option,.sr-only')) continue;
    const range = document.createRange(); range.selectNodeContents(node);
    for (const rect of range.getClientRects()) {
      // Range geometry includes lines hidden by line-clamp/scroll containers.
      // Those invisible fragments cannot overlap visible neighbouring text.
      let painted = rect.width > 1 && rect.height > 1;
      for (let parent = el; painted && parent && parent !== document.body; parent = parent.parentElement) {
        const style = getComputedStyle(parent), bounds = parent.getBoundingClientRect();
        if (['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowY) && (rect.top >= bounds.bottom || rect.bottom <= bounds.top)) painted = false;
      }
      if (painted) text.push({ el, text: node.textContent.trim().slice(0, 100), rect });
    }
  }
  const clippedText = [];
  for (const item of text) {
    const r = item.rect;
    let clipping = r.left < -1 || r.right > viewport.width + 1 ? 'viewport' : null;
    let intentionalSummary = false;
    for (let parent = item.el; parent && parent !== document.body; parent = parent.parentElement) {
      const style = getComputedStyle(parent), bounds = parent.getBoundingClientRect();
      if (style.webkitLineClamp !== 'none' && Number(style.webkitLineClamp) > 0) intentionalSummary = true;
      if (['hidden', 'clip'].includes(style.overflowX) && (r.left < bounds.left - 1 || r.right > bounds.right + 1)) clipping = selector(parent);
    }
    if (clipping) clippedText.push({ element: selector(item.el), text: item.text, clipping, intentionalSummary });
  }
  const overlappingText = [];
  for (let i = 0; i < text.length; i++) for (let j = i + 1; j < text.length; j++) {
    const a = text[i], b = text[j];
    if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
    const intersectX = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left);
    const intersectY = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top);
    if (intersectX > 2 && intersectY > 3) overlappingText.push({ first: { element: selector(a.el), text: a.text }, second: { element: selector(b.el), text: b.text } });
  }
  const fixed = elements.filter(el => ['fixed', 'sticky'].includes(getComputedStyle(el).position)).map(el => ({ ...geometry(el), position: getComputedStyle(el).position, exceedsViewport: el.getBoundingClientRect().height > viewport.height, scrollable: ['auto', 'scroll'].includes(getComputedStyle(el).overflowY) }));
  const coveredText = text.filter(item => {
    const r = item.rect, x = (r.left + r.right) / 2, y = (r.top + r.bottom) / 2;
    if (x < 0 || x >= viewport.width || y < 0 || y >= viewport.height) return false;
    const hit = document.elementFromPoint(x, y);
    if (!hit || hit === item.el || item.el.contains(hit) || hit.contains(item.el)) return false;
    return !!hit.closest('nav') && !item.el.closest('nav');
  }).map(item => ({ element: selector(item.el), text: item.text }));
  const inputs = elements.filter(el => el.matches('input:not([type=checkbox]):not([type=radio]),textarea,select')).map(el => ({ ...geometry(el), fontSize: parseFloat(getComputedStyle(el).fontSize) }));
  return { viewport, scrollWidth: document.documentElement.scrollWidth, clientWidth: viewport.width, overflow: document.documentElement.scrollWidth > viewport.width, overflowing, clippedText, overlappingText, smallTargets, fixed, coveredText, inputs };
}

async function settle(page, route) {
  await page.getByRole('heading', { name: routes[route], exact: true }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  if (route === 'home') await page.waitForFunction(() => document.querySelector('main p')?.textContent?.includes('everyday table.'));
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = 'eager';
    await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
  });
}
async function reveal(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
      scrollTo(0, y); await new Promise(resolve => setTimeout(resolve, 30));
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(450);
  await page.waitForFunction(() => [...document.querySelectorAll('main > div, .contact-form')].every(el => {
    const style = getComputedStyle(el);
    return style.transform === 'none' && Number(style.opacity) === 1;
  }));
}
async function snapshot(page, browser, route, size, state = 'page', zoom = false) {
  const key = `${phase}-${browser}-${route}-${size.width}x${size.height}-${state}${zoom ? '-text200' : ''}`;
  const metrics = await page.evaluate(measure);
  const screenshot = path.join(output, `${key}.png`);
  await page.screenshot({ path: screenshot, fullPage: state === 'page', animations: 'disabled' });
  return { key, phase, browser, route, size, state, zoom, screenshot, ...metrics };
}

async function main() {
  const all = [], axeResults = [], failures = [];
  for (const [engine, type] of Object.entries({ chromium, webkit })) {
    if (selectedEngine && selectedEngine !== engine) continue;
    let browser;
    try { browser = await type.launch({ headless: true, ...(engine === 'chromium' ? { channel: 'chromium' } : {}) }); }
    catch (error) { failures.push({ engine, error: error.message }); continue; }
    const context = await browser.newContext({ viewport: sizes[0], deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'reduce' });
    await context.route('**/firestore.googleapis.com/**', route => route.abort());
    await context.route('**/api/products', route => route.fulfill({ status: 404, body: '{}' }));
    // External fonts/texture availability must not create false visual diffs.
    await context.route(/https:\/\/(fonts\.(googleapis|gstatic)\.com|www\.transparenttextures\.com)\//, route => route.abort());
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    try {
      for (const route of Object.keys(routes)) {
        await page.goto(`${base}/#${route}`, { waitUntil: 'domcontentloaded' });
        await page.bringToFront();
        await settle(page, route);
        for (const size of sizes) {
          await page.setViewportSize(size);
          await reveal(page);
          all.push(await snapshot(page, engine, route, size));
          if ([320, 390, 440].includes(size.width)) {
            const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
            axeResults.push({ engine, route, size, violations: axe.violations, incomplete: axe.incomplete.map(item => ({ id: item.id, nodes: item.nodes.length })), passes: axe.passes.map(item => item.id) });
          }
          if (route === 'products') {
            const card = page.locator('.card-premium').filter({ has: page.getByRole('heading', { name: 'Konkonte (Dried Cassava Flour)', exact: true }) });
            await card.getByRole('button', { name: 'Quick View', exact: true }).focus();
            await card.getByRole('button', { name: 'Quick View', exact: true }).click();
            await page.waitForFunction(() => {
              const panel = document.querySelector('div.fixed.max-w-4xl');
              return panel && Number(getComputedStyle(panel).opacity) > 0.99 && panel.getBoundingClientRect().left >= 0;
            });
            await page.waitForTimeout(450);
            all.push(await snapshot(page, engine, route, size, 'quick-view'));
            await page.locator('button').filter({ has: page.locator('svg.lucide-x') }).last().click();
            await page.locator('div.fixed.max-w-4xl').waitFor({ state: 'detached' });
            if (size.width === 320) {
              await card.getByRole('button', { name: 'Enquire about Konkonte (Dried Cassava Flour)', exact: true }).click();
              await page.waitForTimeout(3300);
            }
            await page.evaluate(() => scrollTo(0, 0));
            await page.locator('nav button').filter({ has: page.locator('svg.lucide-shopping-cart') }).click();
            await page.waitForFunction(() => {
              const panel = document.querySelector('div.fixed.inset-y-0');
              return panel && panel.getBoundingClientRect().right <= innerWidth + 0.5;
            });
            await page.waitForTimeout(450);
            all.push(await snapshot(page, engine, route, size, 'enquiry-cart'));
            await page.locator('button').filter({ has: page.locator('svg.lucide-x') }).last().click();
            await page.locator('div.fixed.inset-y-0').waitFor({ state: 'detached' });
          }
          if (route === 'home' && size.width < 1024) {
            await page.locator('nav button').filter({ has: page.locator('svg.lucide-menu') }).click();
            await page.waitForTimeout(1000);
            all.push(await snapshot(page, engine, route, size, 'menu'));
            await page.locator('nav button').filter({ has: page.locator('svg.lucide-x') }).first().click();
            await page.locator('nav > div.border-t').waitFor({ state: 'detached' });
          }
          if ([320, 390, 440].includes(size.width)) {
            await page.evaluate(() => {
              const elements = [...document.querySelectorAll('body *')];
              const values = elements.map(el => [el, getComputedStyle(el).fontSize, getComputedStyle(el).lineHeight]);
              for (const [el, value, lineHeight] of values) {
                el.dataset.auditFont = el.style.fontSize; el.dataset.auditLine = el.style.lineHeight;
                el.style.fontSize = `${parseFloat(value) * 2}px`;
                if (lineHeight !== 'normal') el.style.lineHeight = `${parseFloat(lineHeight) * 2}px`;
              }
            });
            all.push(await snapshot(page, engine, route, size, 'page', true));
            await page.evaluate(() => { for (const el of document.querySelectorAll('[data-audit-font]')) { el.style.fontSize = el.dataset.auditFont; el.style.lineHeight = el.dataset.auditLine; delete el.dataset.auditFont; delete el.dataset.auditLine; } });
          }
          fs.writeFileSync(path.join(output, `${phase}-${engine}-layout.json`), JSON.stringify(all.filter(item => item.browser === engine), null, 2));
          fs.writeFileSync(path.join(output, `${phase}-${engine}-axe.json`), JSON.stringify(axeResults.filter(item => item.engine === engine), null, 2));
          console.log(`${phase} ${engine} ${route} ${size.width}x${size.height}`);
        }
      }
    } catch (error) { failures.push({ engine, error: error.stack }); }
    finally { await context.close(); await browser.close(); }
  }
  fs.writeFileSync(path.join(output, `${phase}${selectedEngine ? '-' + selectedEngine : ''}-summary.json`), JSON.stringify({ phase, failures, layouts: all.length, axeRuns: axeResults.length, overflowCases: all.filter(item => item.overflow).map(({ key, scrollWidth, clientWidth }) => ({ key, scrollWidth, clientWidth })) }, null, 2));
  console.log(JSON.stringify({ failures, layouts: all.length, axeRuns: axeResults.length, overflowCases: all.filter(item => item.overflow).length }));
  if (failures.length || all.some(item => item.overflow)) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
