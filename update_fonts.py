import re
import os

files_to_update = [
    'src/modules/pages/blog.jsx',
    'src/modules/pages/blog-article.jsx',
    'src/modules/pages/pricing.jsx',
    'src/modules/pages/about.jsx',
    'src/modules/pages/contact.jsx'
]

for filepath in files_to_update:
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace Cormorant Garamond
    content = re.sub(r"'Cormorant Garamond',\s*Georgia,\s*serif", r"'Inter', sans-serif", content)
    content = re.sub(r"'Cormorant Garamond',\s*serif", r"'Inter', sans-serif", content)
    
    # Replace Bebas Neue
    # We add font-weight: 800 because Bebas is naturally bold and might not have explicit font-weight
    # But if there's already a font-weight right after or before, it might duplicate. 
    # It's CSS, so duplicate properties in same block just override, the last one wins. 
    # However, to be safe, let's just do a simple replacement and add font-weight.
    content = re.sub(r"'Bebas Neue',\s*sans-serif", r"'Inter', sans-serif; font-weight: 800", content)

    with open(filepath, 'w') as f:
        f.write(content)

print("Font styles updated successfully")
