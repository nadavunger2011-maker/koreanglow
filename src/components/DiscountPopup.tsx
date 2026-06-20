import { useEffect, useState } from "react";
import { Sparkles, X, Copy, Check } from "lucide-react";
import { pushEvent } from "@/lib/analytics";

const SHOWN_KEY = "kbeauty_discount_popup_shown";
const SHOW_DELAY_MS = 30_000;
const COUPON = "GLOW15";

export const DiscountPopup = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SHOWN_KEY)) return;
    const t = setTimeout(() => {
      sessionStorage.setItem(SHOWN_KEY, "1");
      setOpen(true);
      pushEvent("discount_popup_view", { coupon_code: COUPON });
    }, SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const close = () => setOpen(false);

  const copyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(COUPON);
      setCopied(true);
      pushEvent("coupon_copy", { coupon_code: COUPON });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleCta = () => {
    pushEvent("discount_popup_cta", { coupon_code: COUPON });
    void copyCoupon();
    const el = document.getElementById("offer");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setTimeout(close, 400);
  };

  if (!open) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discount-popup-title"
    >
      <div className="relative w-[92vw] max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-pink-100 animate-in zoom-in-95 duration-300">
        <button
          onClick={close}
          aria-label="סגירת חלון ההנחה"
          className="absolute top-3 left-3 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 px-6 pt-8 pb-12 text-center text-white">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4">
            <Sparkles className="h-3 w-3" />
            הנחה בלעדית
          </div>
          <h2 id="discount-popup-title" className="text-3xl sm:text-4xl font-black leading-tight mb-2">
            רגע לפני שתמשיכי...
          </h2>
          <p className="text-white/90 text-base leading-relaxed">
            גילינו שאת עדיין כאן — הנה{" "}
            <span className="font-black">15% הנחה</span> על כל ההזמנה, רק לזמן מוגבל.
          </p>
        </div>

        <div className="px-6 -mt-6 pb-7">
          <div className="rounded-2xl border-2 border-dashed border-pink-400 bg-pink-50 p-4 flex items-center justify-between gap-3 shadow-sm">
            <button
              type="button"
              onClick={copyCoupon}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-bold hover:bg-slate-800 transition"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "הועתק!" : "העתקת קוד"}
            </button>
            <div className="text-right">
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">קוד קופון</div>
              <div className="text-2xl font-black tracking-[0.2em] text-pink-600">{COUPON}</div>
            </div>
          </div>

          <button
            onClick={handleCta}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-4 font-black text-base shadow-lg shadow-pink-500/30 hover:-translate-y-0.5 transition-all"
          >
            ✨ לממש את ההנחה
          </button>
          <p className="mt-3 text-center text-xs text-slate-400">
            15% הנחה על כל ההזמנה · ללא מינימום
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiscountPopup;