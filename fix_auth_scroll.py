import re
import os

files = [
    'src/modules/auth/login.jsx',
    'src/modules/auth/register.jsx'
]

css_old = r'''\.auth-root \{
  min-height:100vh;display:flex;
  background:var\(--bg\);color:var\(--text\);
  font-family:'Inter',sans-serif;
  position:relative;overflow:hidden;
\}

/\* ── LEFT BRAND PANEL ── \*/
\.auth-left \{
  display:none;
\}
@media\(min-width:1024px\)\{
  \.auth-left \{
    display:flex;flex-direction:column;justify-content:center;
    width:50%;position:relative;overflow:hidden;
    background:var\(--bg\);
    border-right:1px solid var\(--border\);
  \}
\}

/\* ── RIGHT FORM PANEL ── \*/
\.auth-right \{
  flex:1;display:flex;align-items:center;justify-content:center;
  padding:32px 24px;position:relative;z-index:2;
\}
@media\(min-width:1024px\)\{
  \.auth-right \{ width:50%;flex:none; \}
\}

\.auth-panel \{
  width:100%;max-width:400px;
\}'''

css_new = '''.auth-root {
  height:100vh; height:100dvh; display:flex;
  background:var(--bg);color:var(--text);
  font-family:'Inter',sans-serif;
  position:relative;overflow:hidden;
}

/* ── LEFT BRAND PANEL ── */
.auth-left {
  display:none;
}
@media(min-width:1024px){
  .auth-left {
    display:flex;flex-direction:column;justify-content:center;
    width:50%;height:100%;position:relative;overflow:hidden;
    background:var(--bg);
    border-right:1px solid var(--border);
  }
}

/* ── RIGHT FORM PANEL ── */
.auth-right {
  flex:1;
  height:100%;
  overflow-y:auto;
  overflow-x:hidden;
  padding:60px 24px;
  position:relative;z-index:2;
  display:flex;
  flex-direction:column;
}
@media(min-width:1024px){
  .auth-right { width:50%;flex:none; padding:80px 40px; }
}

.auth-panel {
  width:100%;max-width:400px;
  margin:auto;
}'''

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    # We will use re.sub or just str.replace. Since there are regex chars, let's use re.search to find it.
    # It's easier to just use re.sub with the exact old pattern.
    new_content = re.sub(css_old, css_new, content)
    
    if new_content == content:
        print(f"Failed to update {file_path}")
    else:
        with open(file_path, 'w') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

