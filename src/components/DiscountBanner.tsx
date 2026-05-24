import { useEffect, useState } from "react";
import { Check, Copy, Sparkles, X } from "lucide-react";

const DISCOUNT_KEY = "kg_discount_active";
const DISMISS_KEY = "kg_discount_banner_dismissed";

export const DiscountBanner = () => {
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const read = () => {
      if (sessionStorage.getItem(DISMISS_KEY)) {
        setCode(null);
        return;
      }
      const raw = localStorage.getItem(DISCOUNT_KEY);
      if (!raw) return setCode(null);
      try {
        const parsed = JSON.parse(raw) as { code?: string };
        if (parsed?.code) setCode(parsed.code);
      } catch {
        setCode(null);
      }
    };
    read();
    const onActivate = () => read();
    window.addEventListener("kg-discount-activated", onActivate);
    window.addEventListener("storage", onActivate);
    return () => {
      window.removeEventListener("kg-discount-activated", onActivate);
      window.removeEventListener("storage", onActivate);
    };
  }, []);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setCode(null);
  };

  if (!code) return null;

  return (
    <div
      dir="rtl"
      className="sticky top-0 z-[90] w-full bg-gradient-to-l from-pink-500 via-pink-500 to-rose-500 text-white shadow-md"
      role="status"
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-sm sm:text-base font-medium relative">
        <Sparkles size={16} className="hidden sm:inline shrink-0" />
        <span className="font-bold">10% הנחה פעילה</span>
        <span className="opacity-90 hidden sm:inline">• הזיני את הקוד בקופה:</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 font-black tracking-widest transition-colors"
          dir="ltr"
          aria-label="העתיקי קוד"
        >
          {code}
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <button
          onClick={dismiss}
          aria-label="סגירה"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default DiscountBanner;