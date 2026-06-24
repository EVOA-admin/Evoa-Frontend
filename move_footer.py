import re
import os

landing_path = 'src/modules/landing/landingpage.jsx'
footer_path = 'src/components/layout/footer.jsx'
index_path = 'src/index.css'

with open(landing_path, 'r') as f:
    landing_code = f.read()

# 1. Extract CSS
# We know the CSS for footer starts at /* ══════════════════════════════════════════
#    FOOTER
and ends after .ln-modal-body p{margin-bottom:10px}
pattern_css = r'(/\* ══════════════════════════════════════════\n   FOOTER.*?(?=\*/)\*/.*?\.ln-modal-body p\{margin-bottom:10px\})'
css_match = re.search(pattern_css, landing_code, re.DOTALL)

if css_match:
    extracted_css = css_match.group(1)
    # Remove from landing
    landing_code = landing_code.replace(extracted_css, '')
    
    # Append to index.css
    with open(index_path, 'r') as f:
        idx_content = f.read()
    if 'FOOTER' not in idx_content:
        with open(index_path, 'a') as f:
            f.write('\n\n' + extracted_css)

# 2. Extract Components
# PolicyModal function
pattern_policy = r'(function PolicyModal\(\{\s*title,\s*children,\s*onClose\s*\}\)\s*\{.*?(?=\n/\* ─── FOOTER ─── \*/))'
policy_match = re.search(pattern_policy, landing_code, re.DOTALL)

# Footer function
pattern_footer = r'(function Footer\(\)\s*\{.*?(?=\n\nexport default function Landing\(\)\s*\{))'
footer_match = re.search(pattern_footer, landing_code, re.DOTALL)

if policy_match and footer_match:
    extracted_policy = policy_match.group(1)
    extracted_footer = footer_match.group(1)
    
    # Remove from landing
    landing_code = landing_code.replace(extracted_policy, '')
    landing_code = landing_code.replace('/* ─── FOOTER ─── */\n' + extracted_footer, '')
    
    # In landingpage.jsx, we need to import Footer if it's not imported.
    if 'import Footer from' not in landing_code:
        # Add import at the top
        landing_code = re.sub(r'(import React.*?\n)', r'\1import Footer from "../../components/layout/footer";\n', landing_code)

    # Write to footer.jsx
    footer_code = f"""import React, {{ useState, useEffect }} from "react";
import {{ Link }} from "react-router-dom";

{extracted_policy}

{extracted_footer}

export default Footer;
"""
    with open(footer_path, 'w') as f:
        f.write(footer_code)

    with open(landing_path, 'w') as f:
        f.write(landing_code)

print("Footer extracted.")
