import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Footer from "../../components/layout/footer";
import LandingNav from "../../components/layout/LandingNav";
import { supabase } from "../../config/supabase";

/* ─── SEO helpers ─── */
function setMeta(name, content, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) { el = document.createElement("link"); el.rel = "canonical"; document.head.appendChild(el); }
  el.href = url;
}
function injectJsonLd(data) {
  const id = "blog-article-jsonld";
  let el = document.getElementById(id);
  if (!el) { el = document.createElement("script"); el.id = id; el.type = "application/ld+json"; document.head.appendChild(el); }
  el.textContent = JSON.stringify(data);
}
function stripHtml(html) {
  return html ? html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim() : "";
}

/**
 * sanitizeHtmlForDark — fixes invisible text on dark backgrounds.
 *
 * Content from Word / Google Docs / pasted web pages often contains
 * inline `color: black` / `color: #000` / `color: rgb(0,0,0)` which
 * becomes invisible on the platform's #060607 background. This
 * function replaces those dark colour declarations with the EVOA
 * light cream (#F4F0E8) and strips white/light background-color boxes.
 *
 * Other intentional colours (gold, red, custom brand tints) are kept.
 */
function sanitizeHtmlForDark(html) {
  if (!html) return html;
  const LIGHT = '#F4F0E8';
  const DARK_NAMED = ['black', 'windowtext', 'buttontext', 'captiontext',
                      'infotext', 'menutext', 'highlighttext', 'graytext'];
  const LIGHT_BG   = ['white', '#fff', '#ffffff', 'rgb(255,255,255)',
                      'rgba(255,255,255,1)', '#fafafa', '#f8f8f8', '#f5f5f5'];

  return html
    /* ── text colour: named dark values ── */
    .replace(
      /\bcolor\s*:\s*([^;'"{}]+)/gi,
      (full, val) => {
        const v = val.trim().toLowerCase().replace(/\s/g, '');

        // Named dark keywords
        if (DARK_NAMED.some(k => v === k)) return `color:${LIGHT}`;

        // Short hex #RGB
        const h3 = v.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
        if (h3) {
          const avg = (parseInt(h3[1],16)*17 + parseInt(h3[2],16)*17 + parseInt(h3[3],16)*17) / 3;
          if (avg < 90) return `color:${LIGHT}`;
        }

        // Long hex #RRGGBB / #RRGGBBAA
        const h6 = v.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/);
        if (h6) {
          const avg = (parseInt(h6[1],16) + parseInt(h6[2],16) + parseInt(h6[3],16)) / 3;
          if (avg < 90) return `color:${LIGHT}`;
        }

        // rgb(r,g,b)
        const rgb = v.match(/^rgb\((\d+),(\d+),(\d+)\)$/);
        if (rgb) {
          const avg = (parseInt(rgb[1]) + parseInt(rgb[2]) + parseInt(rgb[3])) / 3;
          if (avg < 90) return `color:${LIGHT}`;
        }

        // rgba(r,g,b,a)
        const rgba = v.match(/^rgba\((\d+),(\d+),(\d+),([\d.]+)\)$/);
        if (rgba) {
          const avg = (parseInt(rgba[1]) + parseInt(rgba[2]) + parseInt(rgba[3])) / 3;
          if (avg < 90) return `color:${LIGHT}`;
        }

        return full;
      }
    )
    /* ── background-color: light/white → transparent ── */
    .replace(
      /\bbackground-color\s*:\s*([^;'"{}]+)/gi,
      (full, val) => {
        const v = val.trim().toLowerCase().replace(/\s/g, '');
        if (LIGHT_BG.some(k => v.startsWith(k))) return 'background-color:transparent';
        // Any very-light rgb bg
        const rgb = v.match(/^rgb\((\d+),(\d+),(\d+)\)$/);
        if (rgb) {
          const avg = (parseInt(rgb[1]) + parseInt(rgb[2]) + parseInt(rgb[3])) / 3;
          if (avg > 220) return 'background-color:transparent';
        }
        return full;
      }
    );
}

/* ─── Scoped styles ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

@keyframes ba-fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes ba-shimmer{ 0%{background-position:-200% 0}100%{background-position:200% 0} }

.ba-root {
  background:#060607;color:#F4F0E8;
  font-family:'Cormorant Garamond',Georgia,serif;
  min-height:100vh;overflow-x:hidden;
}

/* ── Breadcrumb ── */
.ba-breadcrumb {
  padding:24px 80px 0;
  font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.16em;
  text-transform:uppercase;color:rgba(244,240,232,.35);
  display:flex;align-items:center;gap:10px;
  animation:ba-fadeUp .5s ease both;
}
.ba-breadcrumb a { color:rgba(244,240,232,.35);text-decoration:none;transition:color .2s; }
.ba-breadcrumb a:hover { color:#E8341A; }
.ba-breadcrumb svg { width:12px;height:12px;opacity:.4; }

/* ── Back button ── */
.ba-back {
  display:inline-flex;align-items:center;gap:8px;
  padding:28px 80px 0;
  font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.16em;
  text-transform:uppercase;color:#E8341A;
  background:none;border:none;cursor:pointer;
  transition:gap .2s,color .2s;
  animation:ba-fadeUp .5s .1s ease both;opacity:0;animation-fill-mode:forwards;
}
.ba-back:hover { gap:14px;color:#C9A84C; }
.ba-back svg { width:14px;height:14px;transition:transform .2s; }
.ba-back:hover svg { transform:translateX(-4px); }

/* ── Hero image ── */
.ba-hero-img {
  position:relative;width:100%;height:clamp(300px,45vw,560px);overflow:hidden;
  margin-top:32px;
  animation:ba-fadeUp .6s .15s ease both;opacity:0;animation-fill-mode:forwards;
}
.ba-hero-img img {
  width:100%;height:100%;object-fit:cover;display:block;
}
.ba-hero-img-overlay {
  position:absolute;inset:0;
  background:linear-gradient(to bottom,rgba(6,6,7,.2) 0%,rgba(6,6,7,.7) 100%);
}

/* ── Article meta header ── */
.ba-meta {
  max-width:860px;margin:0 auto;padding:52px 80px 0;
  animation:ba-fadeUp .6s .2s ease both;opacity:0;animation-fill-mode:forwards;
}
.ba-cat-row {
  display:flex;align-items:center;gap:16px;margin-bottom:24px;flex-wrap:wrap;
}
.ba-cat-badge {
  font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.18em;
  text-transform:uppercase;padding:5px 14px;
  border:1px solid rgba(232,52,26,.4);color:#E8341A;
}
.ba-read-time {
  font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.14em;
  text-transform:uppercase;color:rgba(244,240,232,.4);
}
.ba-title {
  font-family:'Bebas Neue',sans-serif;
  font-size:clamp(40px,6vw,84px);
  letter-spacing:.03em;line-height:.95;
  margin-bottom:28px;
}
.ba-byline {
  display:flex;align-items:center;gap:20px;
  font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.12em;
  text-transform:uppercase;color:rgba(244,240,232,.4);
  padding-bottom:36px;
  border-bottom:1px solid rgba(244,240,232,.08);
}
.ba-byline-dot { width:4px;height:4px;border-radius:50%;background:rgba(244,240,232,.2); }

/* ── Divider ── */
.ba-divider {
  width:60px;height:1px;margin:0 auto 0;
  background:linear-gradient(90deg,transparent,rgba(232,52,26,.5),rgba(201,168,76,.4),transparent);
}

/* ── ARTICLE PROSE ── */
.ba-prose-wrap {
  max-width:860px;margin:0 auto;padding:48px 80px 96px;
  animation:ba-fadeUp .7s .35s ease both;opacity:0;animation-fill-mode:forwards;
}

/* Typography */
.ba-prose { font-size:clamp(16px,1.5vw,19px);line-height:1.85;font-weight:300;color:rgba(244,240,232,.88); }
.ba-prose p  { margin:0 0 1.4em; }
.ba-prose h1 { font-family:'Bebas Neue',sans-serif;font-size:2.4em;letter-spacing:.04em;line-height:.95;margin:1.6em 0 .6em;color:#F4F0E8; }
.ba-prose h2 { font-family:'Bebas Neue',sans-serif;font-size:1.85em;letter-spacing:.04em;line-height:.95;margin:1.5em 0 .55em;color:#F4F0E8; }
.ba-prose h3 { font-family:'Cormorant Garamond',serif;font-size:1.45em;font-weight:600;font-style:italic;margin:1.3em 0 .5em;color:#C9A84C; }
.ba-prose h4 { font-family:'DM Mono',monospace;font-size:.85em;letter-spacing:.14em;text-transform:uppercase;margin:1.2em 0 .4em;color:rgba(244,240,232,.7); }

/* Bold / Italic */
.ba-prose strong { font-weight:600;color:#F4F0E8; }
.ba-prose em { font-style:italic;color:#C9A84C; }
.ba-prose u { text-underline-offset:4px; }
.ba-prose s { opacity:.6; }
.ba-prose mark { background:#3a2c00;border-radius:3px;padding:0 4px;color:#F4F0E8; }

/* Links */
.ba-prose a { color:#E8341A;text-decoration:underline;text-underline-offset:4px;transition:color .2s; }
.ba-prose a:hover { color:#C9A84C; }

/* Lists */
.ba-prose ul,.ba-prose ol { padding-left:1.6em;margin:0 0 1.4em; }
.ba-prose li { margin:.4em 0; }
.ba-prose ul li::marker { color:#E8341A; }
.ba-prose ol li::marker { color:#C9A84C;font-family:'DM Mono',monospace;font-size:.85em; }

/* Task list */
.ba-prose ul[data-type="taskList"] { list-style:none;padding-left:.4em; }
.ba-prose ul[data-type="taskList"] li { display:flex;align-items:flex-start;gap:.6em; }
.ba-prose ul[data-type="taskList"] li input[type="checkbox"] { margin-top:5px;accent-color:#E8341A; }

/* Blockquote */
.ba-prose blockquote {
  border-left:3px solid #E8341A;
  padding:16px 24px;margin:1.6em 0;
  background:rgba(232,52,26,.05);
  border-radius:0 4px 4px 0;
  font-style:italic;font-size:1.1em;color:rgba(244,240,232,.75);
}

/* Code */
.ba-prose code {
  background:#1a1a1b;border-radius:4px;padding:2px 7px;
  font-family:'DM Mono',monospace;font-size:.85em;color:#C9A84C;
  border:1px solid rgba(244,240,232,.1);
}
.ba-prose pre {
  background:#0d0d0e;border:1px solid rgba(244,240,232,.1);
  border-radius:8px;padding:20px 24px;overflow-x:auto;margin:1.6em 0;
}
.ba-prose pre code { background:none;border:none;padding:0;color:#cdd6f4;font-size:.9em; }

/* HR */
.ba-prose hr { border:none;border-top:1px solid rgba(244,240,232,.1);margin:2.4em 0; }

/* Images */
.ba-prose img { max-width:100%;border-radius:8px;margin:1.6em 0;display:block; }

/* Subscript / Superscript */
.ba-prose sub,.ba-prose sup { font-size:.75em; }

/* Tables */
.ba-prose table { width:100%;border-collapse:collapse;margin:1.8em 0;font-size:.9em; }
.ba-prose th,.ba-prose td { border:1px solid rgba(244,240,232,.12);padding:10px 14px;vertical-align:top; }
.ba-prose th {
  background:rgba(244,240,232,.05);font-family:'DM Mono',monospace;
  font-size:.78em;letter-spacing:.1em;text-transform:uppercase;
  color:rgba(244,240,232,.6);font-weight:400;
}
.ba-prose tr:nth-child(even) td { background:rgba(244,240,232,.02); }

/* ── Force contrast: CSS fallback for any inline dark colors the sanitizer may miss ──
   CSS !important overrides inline styles for the most common black/dark patterns. */
.ba-prose [style*="color: black"],.ba-prose [style*="color:black"],
.ba-prose [style*="color: #000"],.ba-prose [style*="color:#000"],
.ba-prose [style*="color: rgb(0"],.ba-prose [style*="color: windowtext"],
.ba-prose [style*="color: windowText"],.ba-prose [style*="color: ButtonText"],
.ba-prose [style*="color: CanvasText"] { color:#F4F0E8 !important; }
/* Strip any light/white background boxes pasted from external sources */
.ba-prose [style*="background-color: white"],
.ba-prose [style*="background-color: #fff"],
.ba-prose [style*="background-color: rgb(255"],
.ba-prose [style*="background:white"],
.ba-prose [style*="background: white"] { background-color:transparent !important; }
/* Ensure list items and paragraphs with inline colour always inherit if light enough */
.ba-prose p,.ba-prose li,.ba-prose td,.ba-prose th { color:inherit; }

/* ── Share bar ── */
.ba-share {
  max-width:860px;margin:0 auto;padding:0 80px 80px;
  display:flex;align-items:center;gap:16px;
  font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.14em;
  text-transform:uppercase;color:rgba(244,240,232,.35);
  border-top:1px solid rgba(244,240,232,.08);padding-top:32px;
}
.ba-share-btn {
  display:inline-flex;align-items:center;gap:8px;
  padding:8px 18px;border:1px solid rgba(244,240,232,.15);
  background:transparent;color:rgba(244,240,232,.5);
  font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.14em;
  text-transform:uppercase;cursor:pointer;transition:all .25s;
}
.ba-share-btn:hover { border-color:#E8341A;color:#E8341A; }

/* ── Skeleton / Error ── */
.ba-skel {
  max-width:860px;margin:40px auto;padding:0 80px;
}
.ba-skel-line {
  height:16px;border-radius:4px;margin-bottom:16px;
  background:linear-gradient(90deg,#1a1a1b 25%,#222 50%,#1a1a1b 75%);
  background-size:200% 100%;animation:ba-shimmer 1.4s infinite;
}
.ba-error {
  text-align:center;padding:120px 24px;
  font-family:'DM Mono',monospace;font-size:13px;letter-spacing:.1em;
  color:rgba(244,240,232,.4);
}

/* ── Responsive ── */
@media(max-width:1024px){
  .ba-breadcrumb,.ba-back,.ba-meta,.ba-prose-wrap,.ba-share { padding-left:40px;padding-right:40px; }
}
@media(max-width:640px){
  .ba-breadcrumb,.ba-back { padding-left:20px;padding-right:20px; }
  .ba-meta { padding-left:20px;padding-right:20px; }
  .ba-prose-wrap,.ba-share { padding-left:20px;padding-right:20px; }
  .ba-title { font-size:clamp(36px,10vw,56px); }
}
`;

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function BlogArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* Fetch post */
  useEffect(() => {
    async function fetch() {
      try {
        const { data, error: err } = await supabase
          .from("blogs")
          .select("*")
          .eq("id", id)
          .single();
        if (err) throw err;
        setPost(data);
      } catch (e) {
        setError(e.message || "Post not found.");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  /* SEO — update once post is loaded */
  useEffect(() => {
    if (!post) return;
    const plain = stripHtml(post.content);
    const desc = plain.slice(0, 160);
    const siteUrl = window.location.href;

    document.title = `${post.title} — EVOA Blog`;
    setMeta("description", desc);
    setMeta("keywords", [post.category, "startup", "EVOA", "entrepreneurship", post.author].filter(Boolean).join(", "));
    setMeta("og:type", "article", true);
    setMeta("og:title", post.title, true);
    setMeta("og:description", desc, true);
    setMeta("og:url", siteUrl, true);
    if (post.cover_image) setMeta("og:image", post.cover_image, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", post.title);
    setMeta("twitter:description", desc);
    if (post.cover_image) setMeta("twitter:image", post.cover_image);
    setCanonical(siteUrl);

    /* JSON-LD BlogPosting */
    injectJsonLd({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": desc,
      "articleSection": post.category,
      "author": { "@type": "Person", "name": post.author },
      "datePublished": post.created_at,
      "dateModified": post.updated_at || post.created_at,
      "image": post.cover_image || "",
      "url": siteUrl,
      "publisher": {
        "@type": "Organization",
        "name": "EVOA",
        "url": window.location.origin,
      },
    });

    return () => {
      document.title = "EVOA — Ecosystem for Visionary Opportunity Accelerators";
    };
  }, [post]);

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(post?.title || "");

  return (
    <div className="ba-root">
      <style>{CSS}</style>
      <LandingNav />

      {/* Breadcrumb */}
      <nav className="ba-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        <Link to="/blog">Blog</Link>
        {post && (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            <span style={{ color: "rgba(244,240,232,.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{post.title}</span>
          </>
        )}
      </nav>

      {/* Back */}
      <button className="ba-back" onClick={() => navigate("/blog")} type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Blog
      </button>

      {/* Loading skeleton */}
      {loading && (
        <div className="ba-skel">
          <div className="ba-skel-line" style={{ width: "30%", marginTop: 48 }} />
          <div className="ba-skel-line" style={{ width: "70%", height: 60, marginTop: 12 }} />
          <div className="ba-skel-line" style={{ width: "50%" }} />
          <div style={{ height: 360, marginTop: 32, background: "linear-gradient(90deg,#1a1a1b 25%,#222 50%,#1a1a1b 75%)", backgroundSize: "200% 100%", animation: "ba-shimmer 1.4s infinite" }} />
          {[90, 85, 95, 70, 88, 60].map((w, i) => (
            <div key={i} className="ba-skel-line" style={{ width: `${w}%`, marginTop: i === 0 ? 40 : 12 }} />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="ba-error">
          <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
          <div>{error}</div>
          <button
            onClick={() => navigate("/blog")}
            style={{ marginTop: 24, background: "none", border: "1px solid rgba(244,240,232,.2)", color: "rgba(244,240,232,.5)", padding: "10px 28px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" }}
          >
            ← Back to Blog
          </button>
        </div>
      )}

      {/* Article */}
      {!loading && post && (
        <>
          {/* Cover image */}
          {post.cover_image && (
            <div className="ba-hero-img">
              <img src={post.cover_image} alt={post.title} />
              <div className="ba-hero-img-overlay" />
            </div>
          )}

          {/* Meta header */}
          <header className="ba-meta">
            <div className="ba-cat-row">
              <span className="ba-cat-badge">{post.category}</span>
              {post.read_time && <span className="ba-read-time">{post.read_time} read</span>}
            </div>
            <h1 className="ba-title">{post.title}</h1>
            <div className="ba-byline">
              <span>✦ {post.author}</span>
              <span className="ba-byline-dot" />
              <span>{formatDate(post.created_at)}</span>
            </div>
          </header>

          {/* Prose content */}
          <main className="ba-prose-wrap">
            <article
              className="ba-prose"
              dangerouslySetInnerHTML={{ __html: sanitizeHtmlForDark(post.content) }}
            />
          </main>

          {/* Share bar */}
          <div className="ba-share">
            <span>Share</span>
            <button
              className="ba-share-btn"
              onClick={() => window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`, "_blank", "noopener")}
            >
              𝕏 Twitter
            </button>
            <button
              className="ba-share-btn"
              onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`, "_blank", "noopener")}
            >
              in LinkedIn
            </button>
            <button
              className="ba-share-btn"
              onClick={() => { navigator.clipboard?.writeText(window.location.href); }}
              title="Copy link"
            >
              ⌗ Copy Link
            </button>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
