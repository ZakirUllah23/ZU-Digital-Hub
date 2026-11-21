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

console.log('=== TECHNICAL SEO & METADATA VALIDATION REPORT ===\n');

let totalErrors = 0;
let totalWarnings = 0;
const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();

htmlFiles.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    console.error('CRITICAL: File missing: ' + file);
    totalErrors++;
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');

  console.log('--- Checking ' + file + ' ---');

  // Title
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) {
    console.error('  [ERROR] Missing or empty <title>');
    totalErrors++;
  } else {
    const title = titleMatch[1].trim();
    console.log('  [OK] Title (' + title.length + ' chars): ' + title);
    if (titles.has(title)) {
      console.error('  [ERROR] Duplicate title with ' + titles.get(title));
      totalErrors++;
    } else {
      titles.set(title, file);
    }
  }

  // Meta Description
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  if (!descMatch || !descMatch[1].trim()) {
    console.error('  [ERROR] Missing or empty meta description');
    totalErrors++;
  } else {
    const desc = descMatch[1].trim();
    console.log('  [OK] Meta Description (' + desc.length + ' chars)');
    if (descriptions.has(desc)) {
      console.error('  [ERROR] Duplicate meta description with ' + descriptions.get(desc));
      totalErrors++;
    } else {
      descriptions.set(desc, file);
    }
  }

  // Canonical
  const canonMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (!canonMatch) {
    if (file === '404.html') {
      console.log('  [OK] 404 page correctly has no canonical tag (marked noindex, nofollow)');
    } else {
      console.error('  [ERROR] Missing canonical link');
      totalErrors++;
    }
  } else {
    const canon = canonMatch[1].trim();
    console.log('  [OK] Canonical URL: ' + canon);
    if (file !== '404.html') {
      if (canonicals.has(canon)) {
        console.error('  [ERROR] Duplicate canonical with ' + canonicals.get(canon));
        totalErrors++;
      } else {
        canonicals.set(canon, file);
      }
    }
  }

  // Robots
  const robotsMatch = content.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  if (!robotsMatch) {
    console.error('  [ERROR] Missing robots meta tag');
    totalErrors++;
  } else {
    console.log('  [OK] Robots: ' + robotsMatch[1].trim());
  }

  // Open Graph
  const ogTitle = content.match(/<meta\s+property=["']og:title["']/i);
  const ogDesc = content.match(/<meta\s+property=["']og:description["']/i);
  const ogImage = content.match(/<meta\s+property=["']og:image["']/i);
  const ogUrl = content.match(/<meta\s+property=["']og:url["']/i);
  if (!ogTitle || !ogDesc || !ogImage || !ogUrl) {
    if (file !== '404.html') {
      console.warn('  [WARN] Incomplete Open Graph tags');
      totalWarnings++;
    }
  } else {
    console.log('  [OK] Open Graph tags (og:title, og:desc, og:image, og:url) present');
  }

  // Twitter
  const twCard = content.match(/<meta\s+name=["']twitter:card["']/i);
  if (!twCard) {
    if (file !== '404.html') {
      console.warn('  [WARN] Missing twitter:card');
      totalWarnings++;
    }
  } else {
    console.log('  [OK] Twitter Card present');
  }

  // JSON-LD validation
  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
  let match;
  let jsonCount = 0;
  while ((match = jsonLdRegex.exec(content)) !== null) {
    jsonCount++;
    try {
      const parsed = JSON.parse(match[1]);
      const typeStr = parsed['@type'] || (parsed['@graph'] ? 'Graph (' + parsed['@graph'].length + ' entities)' : 'Object');
      console.log('  [OK] JSON-LD Schema #' + jsonCount + ' is valid (' + typeStr + ')');
    } catch (err) {
      console.error('  [ERROR] Invalid JSON-LD in ' + file + ': ' + err.message);
      totalErrors++;
    }
  }
  if (jsonCount === 0 && file !== '404.html') {
    console.error('  [ERROR] Missing JSON-LD structured data');
    totalErrors++;
  }

  // Check Images
  const imgRegex = /<img\s+([^>]+)>/gi;
  let imgMatch;
  let totalImgs = 0;
  let missingAlt = 0;
  let missingSrc = 0;
  while ((imgMatch = imgRegex.exec(content)) !== null) {
    totalImgs++;
    const attrs = imgMatch[1];
    const srcM = attrs.match(/src=["']([^"']+)["']/i);
    const altM = attrs.match(/alt=["']([^"']*)["']/i);
    if (!altM) {
      missingAlt++;
    }
    if (srcM) {
      const src = srcM[1];
      if (!src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
        const localImgPath = path.join(dir, src.split('?')[0].split('#')[0]);
        if (!fs.existsSync(localImgPath)) {
          console.warn('  [WARN] Image src target not found on disk: ' + src);
          missingSrc++;
        }
      }
    }
  }
  console.log('  [INFO] Images audited: ' + totalImgs + ' total | Missing alt: ' + missingAlt + ' | Missing files: ' + missingSrc);
  if (missingAlt > 0) totalWarnings += missingAlt;
  if (missingSrc > 0) totalErrors += missingSrc;

  // Check Internal Links
  const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let linkMatch;
  let brokenLinks = 0;
  while ((linkMatch = linkRegex.exec(content)) !== null) {
    const href = linkMatch[1];
    if (href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      continue;
    }
    const cleanHref = href.split('#')[0].split('?')[0];
    if (cleanHref) {
      const targetPath = path.join(dir, cleanHref);
      if (!fs.existsSync(targetPath)) {
        console.error('  [ERROR] Broken internal link in ' + file + ' -> ' + href);
        brokenLinks++;
      }
    }
  }
  if (brokenLinks > 0) totalErrors += brokenLinks;

  console.log('');
});

// Check sitemap.xml
console.log('--- Checking sitemap.xml ---');
if (fs.existsSync(path.join(dir, 'sitemap.xml'))) {
  const sitemap = fs.readFileSync(path.join(dir, 'sitemap.xml'), 'utf8');
  const locs = sitemap.match(/<loc>([^<]+)<\/loc>/g);
  console.log('  [OK] sitemap.xml exists with ' + (locs ? locs.length : 0) + ' URLs');
} else {
  console.error('  [ERROR] sitemap.xml missing');
  totalErrors++;
}

// Check robots.txt
console.log('--- Checking robots.txt ---');
if (fs.existsSync(path.join(dir, 'robots.txt'))) {
  const robots = fs.readFileSync(path.join(dir, 'robots.txt'), 'utf8');
  console.log('  [OK] robots.txt exists');
  if (!robots.includes('Sitemap:')) {
    console.warn('  [WARN] robots.txt does not mention Sitemap:');
    totalWarnings++;
  }
} else {
  console.error('  [ERROR] robots.txt missing');
  totalErrors++;
}

console.log('====================================');
console.log('Total Errors: ' + totalErrors + ' | Total Warnings: ' + totalWarnings);
process.exit(totalErrors > 0 ? 1 : 0);
