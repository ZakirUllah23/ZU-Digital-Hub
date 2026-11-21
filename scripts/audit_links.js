const fs = require('fs');
const path = require('path');

const dir = process.cwd();
const htmlFiles = [
  'index.html',
  'about.html',
  'services.html',
  'packages.html',
  'portfolio.html',
  'team.html',
  'contact.html',
  '404.html'
];

console.log('=== SYSTEMATIC ASSET & LINK AUDIT ===\n');

let totalErrors = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');

  console.log(`Checking ${file}:`);

  // CSS Stylesheets
  const cssRegex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = cssRegex.exec(content)) !== null) {
    const href = m[1];
    if (!href.startsWith('http') && !href.startsWith('//')) {
      const cleanPath = path.join(dir, href.split('?')[0].split('#')[0]);
      if (!fs.existsSync(cleanPath)) {
        console.error(`  [ERROR] Broken stylesheet link: ${href}`);
        totalErrors++;
      } else {
        console.log(`  [OK] Stylesheet: ${href}`);
      }
    }
  }

  // Scripts
  const jsRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
  while ((m = jsRegex.exec(content)) !== null) {
    const src = m[1];
    if (!src.startsWith('http') && !src.startsWith('//')) {
      const cleanPath = path.join(dir, src.split('?')[0].split('#')[0]);
      if (!fs.existsSync(cleanPath)) {
        console.error(`  [ERROR] Broken script src: ${src}`);
        totalErrors++;
      } else {
        console.log(`  [OK] Script: ${src}`);
      }
    }
  }

  // Video sources
  const vidRegex = /<source\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
  while ((m = vidRegex.exec(content)) !== null) {
    const src = m[1];
    if (!src.startsWith('http') && !src.startsWith('//')) {
      const cleanPath = path.join(dir, src.split('?')[0].split('#')[0]);
      if (!fs.existsSync(cleanPath)) {
        console.error(`  [ERROR] Broken video source: ${src}`);
        totalErrors++;
      } else {
        console.log(`  [OK] Video source: ${src}`);
      }
    }
  }

  // Anchor links
  const aRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let brokenAnchors = 0;
  while ((m = aRegex.exec(content)) !== null) {
    const href = m[1];
    if (href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      continue;
    }
    const cleanPath = path.join(dir, href.split('?')[0].split('#')[0]);
    if (!fs.existsSync(cleanPath)) {
      console.error(`  [ERROR] Broken anchor target: ${href}`);
      totalErrors++;
      brokenAnchors++;
    }
  }
  if (brokenAnchors === 0) {
    console.log(`  [OK] All internal navigation links resolve to existing files.`);
  }

  console.log('');
});

console.log('----------------------------------------------------');
console.log(`Asset & Link Audit Result: ${totalErrors} errors found.`);
process.exit(totalErrors > 0 ? 1 : 0);

