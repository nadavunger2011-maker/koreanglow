import { useEffect, useState } from "react";

const STORAGE_KEY = "kg_cookie_consent_v1";

type Choices = { analytics: boolean; marketing: boolean };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    openCookieSettings?: () => void;
  }
}

const applyConsent = (choices: Choices) => {
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      ad_storage: choices.marketing ? "granted" : "denied",
      ad_user_data: choices.marketing ? "granted" : "denied",
      ad_personalization: choices.marketing ? "granted" : "denied",
      analytics_storage: choices.analytics ? "granted" : "denied",
    });
  }
};

const persist = (choices: Choices) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ choices, decidedAt: Date.now() })
  );
};

export const CookieConsent = () => {
  const [open, setOpen] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setOpen(true);
    else {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.choices) {
          setAnalytics(!!parsed.choices.analytics);
          setMarketing(!!parsed.choices.marketing);
        }
      } catch {
        /* noop */
      }
    }
    window.openCookieSettings = () => {
      setShowPrefs(true);
      setOpen(true);
    };
  }, []);

  const acceptAll = () => {
    const c = { analytics: true, marketing: true };
    persist(c);
    applyConsent(c);
    setAnalytics(true);
    setMarketing(true);
    setOpen(false);
    setShowPrefs(false);
  };

  const rejectAll = () => {
    const c = { analytics: false, marketing: false };
    persist(c);
    applyConsent(c);
    setAnalytics(false);
    setMarketing(false);
    setOpen(false);
    setShowPrefs(false);
  };

  const savePrefs = () => {
    const c = { analytics, marketing };
    persist(c);
    applyConsent(c);
    setOpen(false);
    setShowPrefs(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[120] p-2 sm:p-5"
      dir="rtl"
      role="dialog"
      aria-label="הסכמת עוגיות"
    >
      <div className="mx-auto max-w-lg sm:max-w-3xl bg-white border border-pink-100 shadow-2xl rounded-lg sm:rounded-2xl p-2.5 sm:p-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm sm:text-xl font-black text-slate-900 mb-0.5 sm:mb-1">
              הגדרות עוגיות
            </h2>
            <p className="text-[11px] sm:text-sm text-slate-600 leading-snug sm:leading-relaxed">
              נשתמש בעוגיות ניתוח ושיווק רק באישור שלך. ניתן לשנות בחירה בפוטר.
            </p>

            {showPrefs && (
              <div className="mt-2 sm:mt-4 space-y-1.5 sm:space-y-3 border-t border-slate-100 pt-2 sm:pt-4">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">ניתוח שימוש</span>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 accent-pink-500 shrink-0"
                  />
                </label>
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">שיווק ופרסום</span>
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 accent-pink-500 shrink-0"
                  />
                </label>
              </div>
            )}

            <div className="mt-2 sm:mt-5 grid grid-cols-3 gap-1.5 sm:flex sm:gap-3">
              <button
                onClick={acceptAll}
                className="h-8 sm:h-11 rounded-md sm:rounded-xl bg-pink-500 text-white text-xs sm:text-base font-bold hover:bg-pink-600 transition-colors sm:flex-1"
              >
                אישור
              </button>
              <button
                onClick={rejectAll}
                className="h-8 sm:h-11 rounded-md sm:rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-base font-bold hover:bg-slate-50 transition-colors sm:flex-1"
              >
                דחייה
              </button>
              {showPrefs ? (
                <button
                  onClick={savePrefs}
                  className="h-8 sm:h-11 rounded-md sm:rounded-xl bg-slate-900 text-white text-xs sm:text-base font-bold hover:bg-slate-800 transition-colors sm:flex-1"
                >
                  שמירה
                </button>
              ) : (
                <button
                  onClick={() => setShowPrefs(true)}
                  className="h-8 sm:h-11 rounded-md sm:rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-base font-bold hover:bg-slate-50 transition-colors sm:flex-1"
                >
                  בחירה
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;