const fs = require('fs');
const path = require('path');

const files = ['index.html', 'about.html', 'services.html', 'packages.html', 'portfolio.html', 'team.html', 'contact.html', '404.html'];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  console.log('=== ' + f + ' ===');
  const t = content.match(/<title>(.*?)<\/title>/is);
  const d = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/is);
  const c = content.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/is);
  const ou = content.match(/<meta\s+property=["']og:url["']\s+content=["'](.*?)["']/is);
  const ot = content.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/is);
  const od = content.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/is);
  
  console.log('Title:       ' + (t ? t[1].trim() : 'NONE'));
  console.log('Description: ' + (d ? d[1].trim() : 'NONE'));
  console.log('Canonical:   ' + (c ? c[1].trim() : 'NONE'));
  console.log('og:url:      ' + (ou ? ou[1].trim() : 'NONE'));
  console.log('og:title:    ' + (ot ? ot[1].trim() : 'NONE'));
  console.log('og:desc:     ' + (od ? od[1].trim() : 'NONE'));
  console.log('');
});
