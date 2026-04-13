import React, { useState, useEffect, useCallback } from 'react';
import { getAmbassadorDashboard } from '../../services/ambassadorService';
import { useTheme } from '../../contexts/ThemeContext';
import { IoArrowBack, IoCopyOutline, IoShareSocialOutline, IoCheckmark } from 'react-icons/io5';

export default function AmbassadorDashboard({ onBack }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [copied, setCopied]   = useState(false);

  // ── Fetch ──
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getAmbassadorDashboard();
        // apiClient returns { error, status, data } where data = full NestJS body
        // NestJS wraps payload as { data: {...}, statusCode, timestamp }
        const payload = res?.data?.data ?? res?.data ?? null;
        if (alive) setData(payload);
      } catch (e) {
        if (alive) setError(e?.message || 'Failed to load ambassador data');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // ── Copy ──
  const handleCopy = useCallback(async () => {
    if (!data?.code) return;
    try {
      await navigator.clipboard.writeText(data.code);
    } catch {
      const el = document.createElement('textarea');
      el.value = data.code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, [data]);

  // ── Share ──
  const handleShare = useCallback(async () => {
    if (!data?.code) return;
    const text = `Join Evoa — India's top startup ecosystem — using my referral code ${data.code}! Sign up at https://evoa.co.in/register`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Join Evoa', text, url: 'https://evoa.co.in/register' });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch { /* user cancelled */ }
  }, [data]);

  const fmtDate = (iso) => {
    try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return '—'; }
  };

  const totalReferrals = data?.totalReferrals ?? 0;
  const rewarded       = data?.referrals?.filter(r => r.status === 'rewarded').length ?? 0;
  const pending        = data?.referrals?.filter(r => r.status === 'pending').length ?? 0;

  return (
    <div className={`px-3 py-4 pb-24`}>

      {/* ── Back button ── */}
      <button
        onClick={onBack}
        className={`flex items-center gap-1.5 text-sm font-medium mb-5 transition-colors ${
          isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        <IoArrowBack size={16} />
        Back to Profile
      </button>

      {/* ── Section title ── */}
      <h2 className={`text-base font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Ambassador Program
      </h2>
      <p className={`text-xs mb-5 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
        Share your referral code and earn rewards for every successful sign-up.
      </p>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="space-y-3">
          <div className={`rounded-2xl h-36 animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3].map(i => (
              <div key={i} className={`rounded-xl h-16 animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
            ))}
          </div>
          <div className={`rounded-xl h-10 animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
          {[1,2,3].map(i => (
            <div key={i} className={`rounded-xl h-14 animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className={`rounded-xl p-4 text-sm border ${
          isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {error}
        </div>
      )}

      {/* ── No data fallback ── */}
      {!loading && !error && !data && (
        <div className={`rounded-xl p-4 text-sm border ${
          isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          Unable to load ambassador data. Please try logging out and back in.
        </div>
      )}

      {/* ── Loaded ── */}
      {!loading && data && (
        <div className="space-y-4">

          {/* Referral Code Card */}
          <div className={`rounded-2xl p-4 border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
              Your Referral Code
            </p>
            <div className={`font-mono text-xl font-semibold tracking-widest mb-4 ${
              isDark ? 'text-[#00B8A9]' : 'text-[#00B8A9]'
            }`}>
              {data.code}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                id="amb-copy-btn"
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  copied
                    ? isDark ? 'bg-[#00B8A9]/20 text-[#00B8A9] border border-[#00B8A9]/30' : 'bg-[#00B8A9]/10 text-[#00B8A9] border border-[#00B8A9]/30'
                    : isDark ? 'bg-[#00B8A9] text-white hover:bg-[#00A89A]' : 'bg-[#00B8A9] text-white hover:bg-[#00A89A]'
                }`}
              >
                {copied ? <IoCheckmark size={15} /> : <IoCopyOutline size={15} />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              <button
                onClick={handleShare}
                id="amb-share-btn"
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  isDark
                    ? 'border-white/20 text-white/80 hover:bg-white/10'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <IoShareSocialOutline size={15} />
                Share
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total',   value: totalReferrals, color: isDark ? 'text-white' : 'text-gray-900' },
              { label: 'Rewarded', value: rewarded,      color: 'text-[#00B8A9]' },
              { label: 'Pending',  value: pending,       color: isDark ? 'text-yellow-400' : 'text-yellow-600' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className={`rounded-xl p-3 text-center border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${
                  isDark ? 'text-white/40' : 'text-gray-400'
                }`}>{label}</p>
              </div>
            ))}
          </div>

          {/* How it Works note */}
          <div className={`rounded-xl p-3.5 border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'
          }`}>
            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
              How Rewards Work
            </p>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
              Rewards are credited when your referred user purchases a premium plan. Pending referrals are awaiting premium activation.
            </p>
          </div>

          {/* Referred Users */}
          <div>
            <h2 className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Referred Users
            </h2>

            {!data.referrals?.length ? (
              <div className={`rounded-2xl p-8 text-center border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="text-3xl mb-3">🤝</div>
                <p className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  No Referrals Yet
                </p>
                <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                  Share your code to start earning rewards.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.referrals.map((ref) => (
                  <div
                    key={ref.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                      {ref.avatarUrl ? (
                        <img src={ref.avatarUrl} alt={ref.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#00B8A9] to-[#00A89A] flex items-center justify-center text-white font-bold text-sm">
                          {(ref.fullName || '?')[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {ref.fullName || 'Evoa User'}
                      </p>
                      <p className={`text-xs truncate ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                        <span className="capitalize">{ref.role || 'User'}</span>
                        {ref.joinedAt ? ` · Joined ${fmtDate(ref.joinedAt)}` : ''}
                      </p>
                    </div>

                    {/* Badge */}
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 ${
                      ref.status === 'rewarded'
                        ? isDark ? 'bg-[#00B8A9]/15 text-[#00B8A9] border border-[#00B8A9]/25' : 'bg-[#00B8A9]/10 text-[#00B8A9] border border-[#00B8A9]/20'
                        : isDark ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25' : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                    }`}>
                      {ref.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Copy toast */}
      {copied && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#00B8A9] text-white shadow-lg pointer-events-none">
          ✓ Copied to clipboard
        </div>
      )}
    </div>
  );
}
