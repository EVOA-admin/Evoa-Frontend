const fs = require('fs');
const path = require('path');

const files = [
  'src/modules/investor/investor.jsx',
  'src/modules/startup/startup.jsx',
  'src/modules/incubator/incubator.jsx',
  'src/modules/viewer/viewer.jsx'
];

for (const relPath of files) {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Remove import
  content = content.replace(/import CreateContentModal.*?;?\n/g, '');

  // Remove state
  content = content.replace(/const \[showModal, setShowModal\] = useState\(false\);\n/g, '');

  // Remove from AppShell props
  content = content.replace(/onCreatePost=\{.*?\}\n?/g, '');

  // Remove CreateContentModal component
  content = content.replace(/<CreateContentModal[\s\S]*?\/>\n?/g, '');

  // Add event listener in useEffect for mounting (after fetchPosts)
  // Look for the initial useEffect that calls fetchPosts()
  // Wait, it's safer to just add a new useEffect.
  const useEffectImport = /import React, \{.*?useEffect.*?\}.*?;/;
  if (!useEffectImport.test(content)) {
    content = content.replace(/import React, \{/g, 'import React, { useEffect, ');
  }

  const listenerCode = `  // Global post creation listener
  useEffect(() => {
    const handlePostCreated = () => {
      fetchPosts();
      fetchRisingStartups();
    };
    window.addEventListener('evoa:contentCreated', handlePostCreated);
    return () => window.removeEventListener('evoa:contentCreated', handlePostCreated);
  }, []);\n`;

  // Insert before return statement of the component
  content = content.replace(/\s+return \(\n\s+<AppShell/g, `\n\n${listenerCode}\n  return (\n    <AppShell`);

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned up ${filePath}`);
  }
}
