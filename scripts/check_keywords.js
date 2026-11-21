const fs = require('fs');
const files = ['index.html', 'about.html', 'services.html', 'packages.html', 'portfolio.html', 'team.html', 'contact.html'];
const targetKeywords = [
  'Digital Marketing Agency',
  'Social Media Marketing',
  'Website Development',
  'Google Ads Management',
  'Social Media Management',
  'Video Editing',
  'digital'
];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  console.log('=== ' + f + ' ===');
  const h1 = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) console.log('H1:', h1[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
  
  targetKeywords.forEach(kw => {
    const reg = new RegExp(kw, 'gi');
    const matches = content.match(reg);
    console.log('  "' + kw + '": ' + (matches ? matches.length : 0));
  });
  console.log('');
});
