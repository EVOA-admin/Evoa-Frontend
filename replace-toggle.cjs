const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/components/layout/navbar.jsx',
  'src/components/layout/DesktopSidebar.jsx',
  'src/components/layout/AppHeader.jsx',
  'src/modules/startup/startup-profile.jsx',
  'src/modules/investor/investor-profile.jsx',
  'src/modules/incubator/incubator-profile.jsx',
  'src/modules/viewer/viewer-profile.jsx'
];

for (const relPath of filesToUpdate) {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace hook destructuring
  content = content.replace(/const \{ theme, toggleTheme \} = useTheme\(\);/g, 'const { theme, toggleTheme, openThemeModal } = useTheme();');

  // Replace onClick={toggleTheme}
  content = content.replace(/onClick=\{toggleTheme\}/g, 'onClick={openThemeModal}');

  // Replace setTimeout(toggleTheme, 150)
  content = content.replace(/setTimeout\(toggleTheme,\s*150\)/g, 'setTimeout(openThemeModal, 150)');

  // Change "Dark Mode" text to "Theme" (for sidebar and navbar)
  content = content.replace(/isDark \? "Light Mode" : "Dark Mode"/g, '"Theme"');
  content = content.replace(/isDark \? 'Switch to light mode' : 'Switch to dark mode'/g, '"Theme"');
  content = content.replace(/title=\{isDark \? "Light mode" : "Dark mode"\}/g, 'title="Theme"');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}
console.log('Done replacing toggleTheme with openThemeModal');
