import { useState, useEffect, useRef } from "react";
import Footer from "../../components/layout/footer";
import LandingNav from "../../components/layout/LandingNav";
import { supabase } from "../../config/supabase";

/* ─── SCOPED CSS — matches About & Contact design system ─── */
const BLOG_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

/* ── ANIMATIONS ── */
@keyframes blg-fadeUp   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
@keyframes blg-cardIn   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes blg-fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes blg-shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes blg-pulse    { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }

/* ── REVEAL SYSTEM ── */
.blg-reveal {
  opacity:0;
  transform:translateY(28px);
  transition:opacity .75s ease, transform .75s ease;
}
.blg-reveal.vis { opacity:1; transform:translateY(0); }
.blg-reveal.d1 { transition-delay:.1s }
.blg-reveal.d2 { transition-delay:.2s }
.blg-reveal.d3 { transition-delay:.3s }
.blg-reveal.d4 { transition-delay:.4s }
.blg-reveal.d5 { transition-delay:.5s }
.blg-reveal.d6 { transition-delay:.6s }

/* ── ROOT ── */
.blg-root {
  background:#060607;
  color:#F4F0E8;
  font-family:'Cormorant Garamond',Georgia,serif;
  min-height:100vh;
  position:relative;
  overflow-x:hidden;
}

/* ── HERO ── */
.blg-hero {
  position:relative;
  padding:140px 80px 100px;
  text-align:center;
  overflow:hidden;
}
.blg-hero-ghost {
  position:absolute;
  font-family:'Bebas Neue',sans-serif;
  font-size:clamp(140px,22vw,340px);
  color:rgba(244,240,232,.018);
  left:50%;transform:translateX(-50%);
  top:-20px;line-height:1;pointer-events:none;user-select:none;
  white-space:nowrap;
}
.blg-pill {
  display:inline-flex;align-items:center;gap:8px;
  font-family:'DM Mono',monospace;font-size:9px;
  letter-spacing:.22em;text-transform:uppercase;color:#E8341A;
  border:1px solid rgba(232,52,26,.3);padding:6px 18px;border-radius:40px;
  margin-bottom:28px;
}
.blg-pill::before {
  content:'';width:6px;height:6px;border-radius:50%;background:#E8341A;
  display:inline-block;animation:blg-pulse 2s ease-in-out infinite;
}
.blg-hero h1 {
  font-family:'Bebas Neue',sans-serif;
  font-size:clamp(56px,8vw,120px);
  letter-spacing:.04em;line-height:.9;
  margin-bottom:24px;
}
.blg-hero h1 em {
  font-family:'Cormorant Garamond',serif;
  font-style:italic;font-weight:300;
  color:#C9A84C;font-size:.65em;
  display:block;line-height:1.3;letter-spacing:.02em;
}
.blg-hero-sub {
  font-size:clamp(16px,2vw,20px);font-weight:300;
  color:rgba(244,240,232,.55);line-height:1.75;
  max-width:560px;margin:0 auto 48px;
}

/* ── DIVIDER ── */
.blg-divider {
  width:80px;height:1px;
  background:linear-gradient(90deg,transparent,rgba(232,52,26,.5),rgba(201,168,76,.4),transparent);
  margin:0 auto 60px;
}

/* ── CATEGORIES ── */
.blg-cats {
  display:flex;flex-wrap:wrap;gap:10px;justify-content:center;
  margin-bottom:72px;
}
.blg-cat-btn {
  font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.16em;
  text-transform:uppercase;padding:9px 22px;border-radius:40px;cursor:pointer;
  border:1px solid rgba(244,240,232,.12);
  color:rgba(244,240,232,.5);background:transparent;
  transition:all .25s;
}
.blg-cat-btn:hover { border-color:rgba(244,240,232,.3);color:#F4F0E8; }
.blg-cat-btn.active {
  background:#E8341A;border-color:#E8341A;color:#060607;
}

/* ── GRID ── */
.blg-section {
  padding:0 80px 120px;
  position:relative;
}
.blg-grid {
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:32px;
  max-width:1400px;
  margin:0 auto;
}

/* ── CARD ── */
.blg-card {
  background:#0f0f10;
  border:1px solid rgba(244,240,232,.07);
  transition:border-color .3s,transform .35s;
  display:flex;flex-direction:column;
  position:relative;overflow:hidden;
}
.blg-card:hover {
  border-color:rgba(232,52,26,.25);
  transform:translateY(-6px);
}
.blg-card-img {
  position:relative;width:100%;height:220px;overflow:hidden;
}
.blg-card-img img {
  width:100%;height:100%;object-fit:cover;
  transition:transform .55s ease;
}
.blg-card:hover .blg-card-img img { transform:scale(1.06); }
.blg-card-img-overlay {
  position:absolute;inset:0;
  background:linear-gradient(to bottom,transparent 40%,rgba(6,6,7,.85));
}
.blg-cat-badge {
  position:absolute;top:16px;left:16px;
  font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.16em;
  text-transform:uppercase;padding:5px 12px;
  background:rgba(6,6,7,.7);backdrop-filter:blur(8px);
  border:1px solid rgba(232,52,26,.3);color:#E8341A;
}
.blg-card-body {
  padding:28px 28px 24px;
  flex:1;display:flex;flex-direction:column;
}
.blg-card-title {
  font-family:'Bebas Neue',sans-serif;
  font-size:clamp(20px,2.2vw,28px);
  letter-spacing:.04em;line-height:1.1;
  color:#F4F0E8;margin-bottom:14px;
  transition:color .25s;
}
.blg-card:hover .blg-card-title { color:#E8341A; }
.blg-card-excerpt {
  font-size:15px;font-weight:300;line-height:1.75;
  color:rgba(244,240,232,.55);margin-bottom:24px;flex:1;
}
.blg-card-meta {
  display:flex;align-items:center;justify-content:space-between;
  font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;
  text-transform:uppercase;color:rgba(244,240,232,.35);
  margin-bottom:20px;
}
.blg-card-meta-left { display:flex;gap:16px; }
.blg-read-btn {
  display:inline-flex;align-items:center;gap:8px;
  font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.16em;
  text-transform:uppercase;color:#E8341A;
  background:none;border:none;cursor:pointer;padding:0;
  transition:gap .25s,color .25s;
}
.blg-read-btn:hover { gap:14px;color:#C9A84C; }
.blg-read-btn svg { width:14px;height:14px;transition:transform .25s; }
.blg-read-btn:hover svg { transform:translateX(4px); }

/* ── CARD ENTER ANIMATION ── */
.blg-card-anim { animation: blg-cardIn .45s ease both; }

/* ── LOADING SKELETON ── */
.blg-skel-grid {
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:32px;
  max-width:1400px;
  margin:0 auto;
}
.blg-skel-card {
  background:#0f0f10;
  border:1px solid rgba(244,240,232,.07);
}
.blg-skel-img {
  height:220px;
  background:linear-gradient(90deg,#1a1a1b 25%,#222 50%,#1a1a1b 75%);
  background-size:200% 100%;
  animation:blg-shimmer 1.4s infinite;
}
.blg-skel-body { padding:28px; }
.blg-skel-line {
  height:14px;border-radius:4px;margin-bottom:12px;
  background:linear-gradient(90deg,#1a1a1b 25%,#222 50%,#1a1a1b 75%);
  background-size:200% 100%;
  animation:blg-shimmer 1.4s infinite;
}
.blg-skel-line.w80 { width:80%; }
.blg-skel-line.w60 { width:60%; }
.blg-skel-line.w90 { width:90%; }

/* ── EMPTY / ERROR ── */
.blg-empty {
  text-align:center;
  padding:80px 24px;
  color:rgba(244,240,232,.4);
  font-family:'DM Mono',monospace;
  font-size:13px;
  letter-spacing:.1em;
}

/* ── BAR / LOAD MORE ── */
.blg-load-wrap { text-align:center;margin-top:64px; }
.blg-load-btn {
  font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.18em;
  text-transform:uppercase;padding:16px 44px;
  background:transparent;border:1px solid #E8341A;
  color:#E8341A;cursor:pointer;
  clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));
  transition:background .3s,color .3s;
}
.blg-load-btn:hover { background:#E8341A;color:#060607; }

/* ── RESPONSIVE ── */
@media(max-width:1024px){
  .blg-grid,.blg-skel-grid { grid-template-columns:repeat(2,1fr); }
  .blg-section { padding:0 40px 100px; }
  .blg-hero { padding:120px 40px 80px; }
}
@media(max-width:640px){
  .blg-grid,.blg-skel-grid { grid-template-columns:1fr; }
  .blg-section { padding:0 20px 80px; }
  .blg-hero { padding:100px 20px 60px; }
  .blg-cats { gap:8px; }
}
`;

const CATEGORIES = ["All", "Funding", "Pitching", "Networking", "Technology", "Growth", "Sustainability"];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
}

function excerpt(text, max = 200) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

export default function Blog() {
  const [activeCat, setActiveCat] = useState("All");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const revealRefs = useRef([]);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const { data, error: fetchError } = await supabase
          .from("blogs")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;
        setBlogs(data || []);
      } catch (err) {
        setError(err.message || "Failed to load blogs.");
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("vis"); }),
      { threshold: 0.08 }
    );
    revealRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const addRef = i => el => { revealRefs.current[i] = el; };

  const filtered = activeCat === "All" ? blogs : blogs.filter(p => p.category === activeCat);

  return (
    <div className="blg-root">
      <style>{BLOG_CSS}</style>
      <LandingNav />

      {/* ── HERO ── */}
      <section className="blg-hero">
        <div className="blg-hero-ghost">BLOG</div>
        <div className="blg-pill blg-reveal" ref={addRef(0)}>Insights &amp; Stories</div>
        <h1 className="blg-reveal" ref={addRef(1)}>
          EVO‑A <span style={{ color: "#E8341A" }}>BLOG</span>
          <em>intelligence for founders</em>
        </h1>
        <p className="blg-hero-sub blg-reveal" ref={addRef(2)}>
          Insights, stories, and expert advice on startups, investing, and the entrepreneurial ecosystem.
        </p>
        <div className="blg-divider" />
      </section>

      {/* ── CATEGORIES ── */}
      <div className="blg-cats blg-reveal" ref={addRef(3)}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`blg-cat-btn${activeCat === cat ? " active" : ""}`}
            onClick={() => setActiveCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── GRID ── */}
      <section className="blg-section">
        {loading ? (
          <div className="blg-skel-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="blg-skel-card">
                <div className="blg-skel-img" />
                <div className="blg-skel-body">
                  <div className="blg-skel-line w80" />
                  <div className="blg-skel-line w90" />
                  <div className="blg-skel-line w60" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="blg-empty">⚠ {error}</div>
        ) : filtered.length === 0 ? (
          <div className="blg-empty">
            {activeCat === "All"
              ? "No blog posts published yet."
              : `No posts in the "${activeCat}" category.`}
          </div>
        ) : (
          <div className="blg-grid" key={activeCat}>
            {filtered.map((post, i) => (
              <article
                key={post.id}
                className="blg-card blg-card-anim"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Image */}
                <div className="blg-card-img">
                  <img
                    src={post.cover_image || "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"}
                    alt={post.title}
                    loading="lazy"
                  />
                  <div className="blg-card-img-overlay" />
                  <span className="blg-cat-badge">{post.category}</span>
                </div>

                {/* Body */}
                <div className="blg-card-body">
                  <h2 className="blg-card-title">{post.title}</h2>
                  <p className="blg-card-excerpt">{excerpt(post.content)}</p>
                  <div className="blg-card-meta">
                    <div className="blg-card-meta-left">
                      <span>✦ {post.author}</span>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    <span>{post.read_time}</span>
                  </div>
                  <button className="blg-read-btn" type="button" aria-label={`Read: ${post.title}`}>
                    Read Article
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
