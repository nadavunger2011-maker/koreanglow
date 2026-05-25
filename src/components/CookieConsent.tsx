import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";

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
      <div className="mx-auto max-w-3xl bg-white border border-pink-100 shadow-2xl rounded-xl sm:rounded-2xl p-3 sm:p-6 relative">
        <button
          onClick={() => setOpen(false)}
          aria-label="סגירה"
          className="absolute top-2 left-2 sm:top-3 sm:left-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center"
        >
          <X size={14} className="sm:w-4 sm:h-4" />
        </button>
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="hidden sm:flex w-10 h-10 rounded-full bg-pink-100 text-pink-600 items-center justify-center shrink-1">
            <Cookie size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-xl font-black text-slate-900 mb-0.5 sm:mb-1">
              אנחנו מכבדים את הפרטיות שלך
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              אנו משתמשים בעוגיות לשיפור החוויה, ניתוח שימוש (Google Analytics 4)
              ופרסום מותאם (Meta Pixel ו-Google Ads). תוכלי לבחור אילו עוגיות לאשר —
              ולשנות זאת בכל עת מהקישור "הגדרות עוגיות" בפוטר.
            </p>

            {showPrefs && (
              <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 border-t border-slate-100 pt-3 sm:pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">
                      עוגיות הכרחיות
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      נדרשות לפעולת האתר. תמיד פעילות.
                    </p>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 shrink-0">תמיד פעיל</span>
                </div>
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">
                      ניתוח שימוש (Analytics)
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      Google Analytics 4 — סטטיסטיקות אנונימיות.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 accent-pink-500 shrink-0"
                  />
                </label>
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">
                      שיווק ופרסום (Marketing)
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      Meta Pixel, Google Ads — התאמת מודעות וקמפיינים.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 accent-pink-500 shrink-0"
                  />
                </label>
              </div>
            )}

            <div className="mt-3 sm:mt-5 flex flex-col sm:flex-row gap-1.5 sm:gap-3">
              <button
                onClick={acceptAll}
                className="flex-1 h-9 sm:h-11 rounded-lg sm:rounded-xl bg-pink-500 text-white text-sm sm:text-base font-bold hover:bg-pink-600 transition-colors"
              >
                אישור הכל
              </button>
              <button
                onClick={rejectAll}
                className="flex-1 h-9 sm:h-11 rounded-lg sm:rounded-xl bg-white border border-slate-300 text-slate-900 text-sm sm:text-base font-bold hover:bg-slate-50 transition-colors"
              >
                דחיית הכל
              </button>
              {showPrefs ? (
                <button
                  onClick={savePrefs}
                  className="flex-1 h-9 sm:h-11 rounded-lg sm:rounded-xl bg-slate-900 text-white text-sm sm:text-base font-bold hover:bg-slate-800 transition-colors"
                >
                  שמירת בחירה
                </button>
              ) : (
                <button
                  onClick={() => setShowPrefs(true)}
                  className="flex-1 h-9 sm:h-11 rounded-lg sm:rounded-xl bg-white border border-slate-300 text-slate-900 text-sm sm:text-base font-bold hover:bg-slate-50 transition-colors"
                >
                  התאמה אישית
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