import re
import os

pages = [
    'src/modules/pages/about.jsx',
    'src/modules/pages/pricing.jsx',
    'src/modules/pages/blog.jsx',
    'src/modules/pages/blog-article.jsx',
    'src/modules/pages/contact.jsx'
]

# 1. Extract CSS from landingpage.jsx
with open('src/modules/landing/landingpage.jsx', 'r') as f:
    landing_content = f.read()

# Match the global css block in landingpage
pattern_global_css = r'\[data-theme="light"\].*?\.evoa-root \{[^}]*\}\n'
global_css_match = re.search(pattern_global_css, landing_content, re.DOTALL)

if global_css_match:
    global_css = global_css_match.group(0)
    # Remove from landingpage
    landing_content = landing_content.replace(global_css, '')
    with open('src/modules/landing/landingpage.jsx', 'w') as f:
        f.write(landing_content)
    
    # Prepend to index.css
    with open('src/index.css', 'r') as f:
        index_content = f.read()
    if '[data-theme="light"]' not in index_content:
        with open('src/index.css', 'w') as f:
            f.write(global_css + '\n' + index_content)

# 2. Update Pages
for page in pages:
    if not os.path.exists(page):
        continue
    with open(page, 'r') as f:
        content = f.read()
    
    # We need to wrap the return with <div className="evoa-root">
    # Let's find the main return statement of the export default function.
    # It usually starts with: return (\n    <div style={{ background: '#060607'...
    # Or return (\n    <div className="pr-root">
    
    # We will do color replacements globally first:
    
    # Backgrounds
    content = re.sub(r'(?i)#060607', 'var(--bg)', content)
    content = re.sub(r'(?i)#1A1A1C', 'var(--bg-alt)', content)
    content = re.sub(r'(?i)#0f0f10', 'var(--bg-card)', content)
    
    # Texts
    content = re.sub(r'(?i)#F4F0E8', 'var(--text)', content)
    content = re.sub(r'(?i)rgba\(244,\s*240,\s*232,\s*0\.55\)', 'var(--text-sub)', content)
    content = re.sub(r'(?i)rgba\(244,\s*240,\s*232,\s*0\.35\)', 'var(--text-mute)', content)
    content = re.sub(r'(?i)rgba\(244,\s*240,\s*232,\s*\.5\)', 'var(--text-mute)', content)
    content = re.sub(r'(?i)rgba\(244,\s*240,\s*232,\s*\.9\)', 'var(--text)', content)
    content = re.sub(r'(?i)rgba\(244,\s*240,\s*232,\s*\.018\)', 'var(--border-soft)', content)
    content = re.sub(r'(?i)rgba\(244,\s*240,\s*232,\s*\.015\)', 'var(--border-soft)', content)
    
    # Accents
    content = re.sub(r'(?i)#E8341A', 'var(--blue)', content)
    content = re.sub(r'(?i)#00BFA5', 'var(--blue-mid)', content)
    content = re.sub(r'(?i)#C9A84C', 'var(--blue-bright)', content)
    
    # Borders
    content = re.sub(r'(?i)rgba\(255,\s*255,\s*255,\s*0\.07\)', 'var(--border)', content)
    content = re.sub(r'(?i)rgba\(255,\s*255,\s*255,\s*0\.1\)', 'var(--border)', content)
    
    # Make sure we replace any wrapper classes or styles with evoa-root if it's the main container.
    # For Pricing, the container has `className="pr-root"`. We can just change `.pr-root` background to var(--bg) in its CSS, and wrap it.
    
    # To easily wrap the page content, let's just add `className="evoa-root"` to the outermost div of the export default function.
    # A bit risky to regex replace the outermost return, so we can just look for the `export default function` block,
    # find `return (` and inject `<div className="evoa-root">`
    
    # Let's write the file.
    with open(page, 'w') as f:
        f.write(content)

print("Global CSS updated. Colors replaced.")
