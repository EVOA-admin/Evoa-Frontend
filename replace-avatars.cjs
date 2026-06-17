const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace background=00B8A9 in ui-avatars.com API calls with background=${(accentColor || '#00B8A9').replace('#','')}
  // To do this, we need to make sure the file has access to accentColor, or we just leave it as the raw CSS variable? No, ui-avatars URL needs a hex string without the #.
  // Actually, wait, doing this cleanly requires accessing the context. 
  // For now, replacing `background=00B8A9` with `background=00B8A9` is fine, or we can just leave the avatar backgrounds teal since it's an external API.
  // Let's just see how many there are.
}

function findAvatars(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findAvatars(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('background=00B8A9')) {
        console.log(fullPath);
      }
    }
  }
}

findAvatars(path.join(__dirname, 'src'));
