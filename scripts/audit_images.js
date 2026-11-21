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

console.log('=== SYSTEMATIC IMAGE AUDIT ===\n');

let totalImages = 0;
let missingAlts = 0;
let missingFiles = 0;
let unstatedDims = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');

  console.log(`Checking ${file}:`);
  const imgRegex = /<img\s+([^>]+)>/gi;
  let match;
  let pageImgCount = 0;

  while ((match = imgRegex.exec(content)) !== null) {
    pageImgCount++;
    totalImages++;
    const attrs = match[1];

    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    const altMatch = attrs.match(/alt=["']([^"']*)["']/i);
    const widthMatch = attrs.match(/width=["']([^"']+)["']/i);
    const heightMatch = attrs.match(/height=["']([^"']+)["']/i);
    const loadingMatch = attrs.match(/loading=["']([^"']+)["']/i);

    const src = srcMatch ? srcMatch[1] : 'MISSING_SRC';
    const alt = altMatch ? altMatch[1] : null;
    const hasWidth = !!widthMatch;
    const hasHeight = !!heightMatch;
    const loading = loadingMatch ? loadingMatch[1] : 'none';

    let fileExists = true;
    if (!src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
      const cleanPath = path.join(dir, src.split('?')[0].split('#')[0]);
      if (!fs.existsSync(cleanPath)) {
        fileExists = false;
        missingFiles++;
      }
    }

    if (alt === null) {
      missingAlts++;
    }

    if (!hasWidth || !hasHeight) {
      unstatedDims++;
    }

    const status = (!fileExists ? '[MISSING FILE] ' : '') +
                   (alt === null ? '[NO ALT] ' : '') +
                   (!hasWidth || !hasHeight ? '[NO DIMS] ' : 'OK');

    console.log(`  #${pageImgCount} src: "${src}" | alt: "${alt !== null ? alt : 'NONE'}" | dims: ${hasWidth && hasHeight ? widthMatch[1] + 'x' + heightMatch[1] : 'MISSING'} | loading: ${loading} -> ${status}`);
  }

  if (pageImgCount === 0) {
    console.log('  No <img> tags found.');
  }
  console.log('');
});

console.log('----------------------------------------------------');
console.log(`Summary: Total Images: ${totalImages} | Missing Files: ${missingFiles} | Missing Alts: ${missingAlts} | Missing Dims: ${unstatedDims}`);

