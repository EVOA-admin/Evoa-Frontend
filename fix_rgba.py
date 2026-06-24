import re
import os

pages = [
    'src/modules/pages/about.jsx',
    'src/modules/pages/pricing.jsx',
    'src/modules/pages/blog.jsx',
    'src/modules/pages/blog-article.jsx',
    'src/modules/pages/contact.jsx'
]

for page in pages:
    if not os.path.exists(page):
        continue
    with open(page, 'r') as f:
        content = f.read()

    # Red, Teal, Gold RGBA borders/backgrounds -> var(--blue-brd)
    content = re.sub(r'rgba\(232,\s*52,\s*26,\s*[0-9.]+\)', 'var(--blue-brd)', content)
    content = re.sub(r'rgba\(0,\s*191,\s*165,\s*[0-9.]+\)', 'var(--blue-brd)', content)
    content = re.sub(r'rgba\(201,\s*168,\s*76,\s*[0-9.]+\)', 'var(--blue-brd)', content)
    
    # Very dark backgrounds -> var(--bg-alt)
    content = re.sub(r'rgba\(6,\s*6,\s*7,\s*[0-9.]+\)', 'var(--bg-alt)', content)
    content = re.sub(r'rgba\(10,\s*10,\s*12,\s*[0-9.]+\)', 'var(--bg-alt)', content)
    
    # White-ish texts with alpha
    content = re.sub(r'rgba\(244,\s*240,\s*232,\s*0?\.[5-9][0-9]*\)', 'var(--text-sub)', content)
    content = re.sub(r'rgba\(244,\s*240,\s*232,\s*0?\.[2-4][0-9]*\)', 'var(--text-mute)', content)
    content = re.sub(r'rgba\(244,\s*240,\s*232,\s*0?\.[0-1][0-9]*\)', 'var(--border)', content)

    # Pure white with alpha for borders
    content = re.sub(r'rgba\(255,\s*255,\s*255,\s*0?\.[0-1][0-9]*\)', 'var(--border)', content)

    # Some missed hexes
    content = re.sub(r'(?i)#F4F0E8', 'var(--text)', content)
    content = re.sub(r'(?i)#E8341A', 'var(--blue)', content)
    content = re.sub(r'(?i)#00BFA5', 'var(--blue-mid)', content)
    content = re.sub(r'(?i)#C9A84C', 'var(--blue-bright)', content)
    
    with open(page, 'w') as f:
        f.write(content)

print("RGBA fixed.")
