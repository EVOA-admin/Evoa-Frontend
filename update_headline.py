import re

with open('src/modules/landing/landingpage.jsx', 'r') as f:
    content = f.read()

# Update CSS for .hero-h1
css_old = r'''\.hero-h1 \{
  font-size:clamp\(34px,5\.5vw,74px\);font-weight:800;
  line-height:1\.06;letter-spacing:-\.028em;
  color:var\(--text\);max-width:680px;margin-bottom:20px;
\}'''

css_new = '''.hero-h1 {
  font-size:clamp(34px,5vw,64px);font-weight:800;
  line-height:1.1;letter-spacing:-.028em;
  color:var(--text);max-width:680px;margin-bottom:20px;
}'''

content = re.sub(css_old, css_new, content)


# Update JSX
jsx_old = r'''          <h1 className="hero-h1 fu2">
            India's First <em>Video-Based</em><br />
            Startup &amp; Investor Discovery Platform
          </h1>'''

jsx_new = '''          <h1 className="hero-h1 fu2">
            India's First <em>Video-Based</em><br />
            Startup &amp; Investor<br />
            Discovery Platform
          </h1>'''

content = re.sub(jsx_old, jsx_new, content)

with open('src/modules/landing/landingpage.jsx', 'w') as f:
    f.write(content)

print("Headline updated successfully")
