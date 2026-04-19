import { useEffect, useMemo, useState } from "react";
import { FaFire, FaRocket, FaUserTie, FaPlay, FaCheckCircle } from "react-icons/fa";
import AppShell from "../../components/layout/AppShell";
import AppHeader from "../../components/layout/AppHeader";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import battlegroundService from "../../services/battlegroundService";
import { openRazorpayCheckout } from "../../utils/razorpay";

export default function BattlefieldPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user, userRole, refreshUserProfile } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadOverview = async () => {
    try {
      setError("");
      const response = await battlegroundService.getOverview();
      const data = response?.data?.data || response?.data || {};
      setOverview(data);
    } catch (err) {
      setError(err?.message || "Unable to load Battlefield right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const alreadyParticipating = !!overview?.alreadyParticipating;
  const canParticipate = useMemo(() => {
    return userRole === "startup" && overview?.canParticipate;
  }, [overview?.canParticipate, userRole]);

  const handleParticipation = async () => {
    try {
      setPaymentLoading(true);
      setError("");
      setSuccessMessage("");

      await openRazorpayCheckout({
        user,
        description: "Battleground Participation",
        notes: { purpose: "battleground_participation" },
        createOrder: () => battlegroundService.createOrder(),
        verifyPayment: (payload) => battlegroundService.verifyPayment(payload),
        onDismiss: ({ razorpayOrderId }) =>
          battlegroundService.markPaymentFailed({
            razorpayOrderId,
            reason: "Payment cancelled by user.",
          }),
        cancelMessage: "Payment cancelled. You can retry participation anytime.",
        onSuccess: async () => {
          await refreshUserProfile();
          await loadOverview();
          setSuccessMessage("You are successfully registered for Battleground");
        },
      });
    } catch (err) {
      setError(err?.message || "Unable to complete battleground payment.");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <AppShell>
      <AppHeader title="Battlefield" />
      <div className="px-3 py-4 space-y-6">
        <section className={`rounded-3xl border p-5 sm:p-6 ${isDark ? "border-[#E8341A]/25 bg-gradient-to-br from-[#1b0d0a] via-[#0f0d0d] to-[#120807]" : "border-orange-200 bg-gradient-to-br from-orange-50 via-white to-red-50 shadow-sm"}`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${isDark ? "bg-[#E8341A]/15 text-[#ff8b7e]" : "bg-[#E8341A]/10 text-[#E8341A]"}`}>
                <FaFire size={10} />
                Battlefield
              </div>
              <h1 className={`mt-3 text-2xl sm:text-3xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                Participate in Battleground - ₹99
              </h1>
              <p className={`mt-3 max-w-2xl text-sm sm:text-base leading-7 ${isDark ? "text-white/70" : "text-gray-600"}`}>
                Join the competition and get a chance to win ₹10,000 grant from Evoa.
              </p>
            </div>

            <div className={`rounded-2xl border px-4 py-3 min-w-[220px] ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white/80"}`}>
              <p className={`text-xs font-bold uppercase tracking-[0.18em] ${isDark ? "text-white/40" : "text-gray-400"}`}>
                Participation Fee
              </p>
              <div className={`mt-2 text-3xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                {overview?.participationFeeDisplay || "₹99"}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleParticipation}
              disabled={paymentLoading || alreadyParticipating || !canParticipate || loading}
              className={`min-h-[48px] rounded-2xl px-5 text-sm font-bold transition-all ${paymentLoading || alreadyParticipating || !canParticipate || loading
                ? isDark
                  ? "bg-white/10 text-white/40 cursor-not-allowed border border-white/10"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-200"
                : "bg-[#E8341A] text-white hover:bg-[#c92a13] shadow-lg shadow-[#E8341A]/20"}`}
            >
              {alreadyParticipating
                ? "Already Participating"
                : paymentLoading
                  ? "Processing..."
                  : "Participate - ₹99"}
            </button>

            {!canParticipate && !loading ? (
              <div className={`min-h-[48px] rounded-2xl px-4 flex items-center text-sm ${isDark ? "border border-white/10 bg-white/5 text-white/65" : "border border-gray-200 bg-white text-gray-600"}`}>
                Only startup accounts can register for Battleground.
              </div>
            ) : null}
          </div>

          {successMessage ? (
            <div className={`mt-4 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${isDark ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
              <FaCheckCircle />
              {successMessage}
            </div>
          ) : null}

          {error ? (
            <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${isDark ? "border-[#E8341A]/20 bg-[#E8341A]/10 text-[#ffb4aa]" : "border-[#E8341A]/20 bg-[#fff2ef] text-[#c43a24]"}`}>
              {error}
            </div>
          ) : null}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <FaRocket className={isDark ? "text-[#E8341A]" : "text-[#E8341A]"} />
            <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Registered Startups
            </h2>
          </div>

          {loading ? (
            <div className={`rounded-2xl border p-5 text-sm ${isDark ? "border-white/10 bg-white/5 text-white/60" : "border-gray-200 bg-white text-gray-500"}`}>
              Loading registered startups...
            </div>
          ) : overview?.registeredStartups?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {overview.registeredStartups.map((startup) => (
                <article
                  key={startup.id}
                  className={`rounded-2xl overflow-hidden border transition-all ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-sm"}`}
                >
                  <div className={`relative h-40 ${isDark ? "bg-[#120807]" : "bg-gray-100"}`}>
                    {startup.pitchThumbnailUrl ? (
                      <img src={startup.pitchThumbnailUrl} alt={startup.startupName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#E8341A]/80 to-[#4b1510] flex items-center justify-center">
                        <FaPlay className="text-white/80" size={30} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className={`text-base font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                      {startup.startupName}
                    </h3>
                    <div className={`mt-2 flex items-center gap-2 text-sm ${isDark ? "text-white/65" : "text-gray-600"}`}>
                      <FaUserTie className={isDark ? "text-white/35" : "text-gray-400"} />
                      {startup.founderName}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={`rounded-2xl border p-5 text-sm ${isDark ? "border-white/10 bg-white/5 text-white/60" : "border-gray-200 bg-white text-gray-500"}`}>
              No startups have completed battleground registration yet.
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
