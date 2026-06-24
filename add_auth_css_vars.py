import re

# CSS variable block to prepend
CSS_VARS = """
/* ─── Auth Page Design Tokens ─── */
[data-theme="light"] {
  --bg:          #FFFFFF;
  --bg-alt:      #F8FAFC;
  --bg-card:     #FFFFFF;
  --bg-deep:     #F1F5F9;
  --text:        #0F172A;
  --text-sub:    #334155;
  --text-mute:   #64748B;
  --blue:        #1565C0;
  --blue-mid:    #1976D2;
  --blue-bright: #2196F3;
  --blue-pale:   #EEF5FF;
  --blue-brd:    rgba(21,101,192,0.22);
  --blue-hover:  #1976D2;
  --border:      #E2E8F0;
  --border-soft: #F1F5F9;
  --shadow-sm:   0 1px 3px rgba(15,23,42,.06),0 2px 8px rgba(15,23,42,.04);
  --shadow-md:   0 4px 20px rgba(15,23,42,.08),0 1px 4px rgba(15,23,42,.05);
  --shadow-lg:   0 12px 48px rgba(15,23,42,.10),0 4px 12px rgba(15,23,42,.06);
  --shadow-blue: 0 8px 32px rgba(21,101,192,.22);
}
[data-theme="dark"] {
  --bg:          #0D1B2A;
  --bg-alt:      #1E2D3D;
  --bg-card:     #162032;
  --bg-deep:     #243447;
  --text:        #E2E8F0;
  --text-sub:    #94A3B8;
  --text-mute:   #64748B;
  --blue:        #3B82F6;
  --blue-mid:    #60A5FA;
  --blue-bright: #93C5FD;
  --blue-pale:   rgba(59,130,246,0.12);
  --blue-brd:    rgba(59,130,246,0.25);
  --blue-hover:  #60A5FA;
  --border:      rgba(255,255,255,0.08);
  --border-soft: rgba(255,255,255,0.04);
  --shadow-sm:   0 1px 4px rgba(0,0,0,.3);
  --shadow-md:   0 4px 20px rgba(0,0,0,.4);
  --shadow-lg:   0 12px 48px rgba(0,0,0,.5);
  --shadow-blue: 0 8px 32px rgba(59,130,246,.22);
}
"""

for filepath in ['src/modules/auth/login.jsx', 'src/modules/auth/register.jsx']:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Insert CSS vars right after the opening backtick of AUTH_CSS
    old = 'const AUTH_CSS = `\n@keyframes auth-fadeUp'
    new = f'const AUTH_CSS = `\n{CSS_VARS.strip()}\n\n@keyframes auth-fadeUp'
    
    if old in content:
        content = content.replace(old, new, 1)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")
    else:
        print(f"Pattern not found in {filepath} - checking...")
        # Try to find the exact line
        import re
        match = re.search(r'const AUTH_CSS = `\n', content)
        if match:
            pos = match.end()
            content = content[:pos] + CSS_VARS.strip() + '\n\n' + content[pos:]
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"  -> Updated {filepath} via fallback")
        else:
            print(f"  -> Could not update {filepath}")

print("Done!")
