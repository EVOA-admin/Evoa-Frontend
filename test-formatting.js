const DOMAIN_SUFFIXES = new Set([
  "com", "io", "ai", "app", "co", "in", "net", "org", "tech", "dev", "xyz",
]);
const NOISY_SUFFIXES = ["official"];
const BRAND_SUFFIXES = ["hub", "labs", "tech", "works", "space", "x"];

function stripDomainBits(value = "") {
  let cleaned = String(value).trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, "");
  cleaned = cleaned.replace(/^www\./, "");
  cleaned = cleaned.split("/")[0];
  cleaned = cleaned.split("?")[0];
  cleaned = cleaned.split("#")[0];
  const parts = cleaned.split(".").filter(Boolean);
  while (parts.length > 1 && DOMAIN_SUFFIXES.has(parts[parts.length - 1])) {
    parts.pop();
  }
  return parts.join(" ");
}

function cleanToken(token = "") {
  let cleaned = token.replace(/[^a-zA-Z0-9]/g, "");
  if (!cleaned) return "";
  const lower = cleaned.toLowerCase();
  const noisySuffix = NOISY_SUFFIXES.find(
    (s) => lower.endsWith(s) && lower.length > s.length + 2
  );
  if (noisySuffix) cleaned = cleaned.slice(0, -noisySuffix.length);
  const lt = cleaned.toLowerCase();
  if (lt.length <= 3) return lt.toUpperCase();
  const brandSuffix = BRAND_SUFFIXES.find(
    (s) => lt.endsWith(s) && lt.length > s.length + 2
  );
  if (brandSuffix) {
    const prefix = lt.slice(0, -brandSuffix.length);
    return (
      prefix.charAt(0).toUpperCase() +
      prefix.slice(1) +
      brandSuffix.charAt(0).toUpperCase() +
      brandSuffix.slice(1)
    );
  }
  return lt.charAt(0).toUpperCase() + lt.slice(1);
}

function formatStartupDisplayName(startup) {
  for (const candidate of [startup?.name, startup?.username]) {
    if (!candidate || String(candidate).trim().toLowerCase() === "startup") continue;
    const withoutDomain = stripDomainBits(candidate);
    const normalized = withoutDomain.replace(/[_\-+.]+/g, " ").replace(/\s+/g, " ").trim();
    if (!normalized) continue;
    const formatted = normalized.split(" ").map(cleanToken).filter(Boolean).join(" ").trim();
    if (formatted) return formatted;
  }
  return "Startup";
}

const testStartups = [
  { name: "AeroRhythm visionaries pvt ltd" },
  { name: "Bio White Foods" },
  { name: "conpact" },
  { name: "DriveGuard Systems" },
  { name: "Evoa Technology Pvt Ltd" }
];

testStartups.forEach(s => {
  console.log(`Original: ${s.name} => Formatted: ${formatStartupDisplayName(s)}`);
});
