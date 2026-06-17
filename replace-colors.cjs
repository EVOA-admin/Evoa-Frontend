const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Replace tailwind arbitrary bracket colors
  content = content.replace(/\[#00B8A9\]/gi, 'evoa');
  content = content.replace(/\[#00A89A\]/gi, 'evoa-hover');
  content = content.replace(/\[#008C81\]/gi, 'evoa-dark');
  content = content.replace(/\[#00E5D3\]/gi, 'evoa-light');
  content = content.replace(/\[#007a73\]/gi, 'evoa-darker');

  // 2. Replace inline hex values with CSS variables
  content = content.replace(/#00B8A9/gi, 'var(--evoa-accent-primary)');
  content = content.replace(/#00A89A/gi, 'var(--evoa-accent-hover)');
  content = content.replace(/#008C81/gi, 'var(--evoa-accent-dark)');
  content = content.replace(/#00E5D3/gi, 'var(--evoa-accent-light)');
  content = content.replace(/#007a73/gi, 'var(--evoa-accent-darker)');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
      processFile(fullPath);
    }
  }
}

walkDir(srcDir);
console.log('Done replacing colors.');
