import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { X, Sparkles, Loader2, Check } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "kg_newsletter_popup_v1";
const SHOW_DELAY_MS = 12000; // non-intrusive: appear after 12s

const schema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email("כתובת אימייל לא תקינה").max(255),
});

export const NewsletterPopup = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissedAt: Date.now() }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const parsed = schema.safeParse({ name: name || undefined, email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "נתון לא תקין");
      return;
    }
    setLoading(true);
    const { error: dbError } = await supabase.from("leads").insert({
      name: parsed.data.name ?? null,
      email: parsed.data.email,
      source_page: `${location.pathname}${location.search}`,
    });
    setLoading(false);
    if (dbError) {
      setError("אופס, משהו השתבש. נסי שוב.");
      return;
    }
    setSuccess(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ subscribedAt: Date.now() }));
    setTimeout(() => setOpen(false), 2200);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-title"
      dir="rtl"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          aria-label="סגירה"
          className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-8 sm:p-10 text-center">
          {success ? (
            <div className="py-6">
              <div className="mx-auto w-14 h-14 rounded-full bg-pink-500 text-white flex items-center justify-center mb-5">
                <Check size={28} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">נרשמת בהצלחה</h3>
              <p className="text-slate-500">קוד ההנחה נשלח אליך לאימייל ✨</p>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase mb-5">
                <Sparkles size={12} />
                מבצע בלעדי
              </div>
              <h3 id="newsletter-title" className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-3">
                10% הנחה <br className="sm:hidden" /> על ההזמנה הראשונה
              </h3>
              <p className="text-slate-500 text-sm sm:text-base mb-7 leading-relaxed">
                הצטרפי לרשימת הטיפוח שלנו וקבלי טיפים, מבצעים בלעדיים והנחה מיידית של 10%.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3 text-right">
                <Input
                  type="text"
                  placeholder="שם (אופציונלי)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl border-slate-200 focus-visible:ring-pink-500"
                  autoComplete="given-name"
                />
                <Input
                  type="email"
                  placeholder="האימייל שלך"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-slate-200 focus-visible:ring-pink-500"
                  autoComplete="email"
                  dir="ltr"
                />
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold tracking-wide hover:bg-pink-500 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "קבלי 10% הנחה"}
                </button>
              </form>

              <button
                onClick={dismiss}
                className="mt-5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                לא תודה, אמשיך לגלוש
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsletterPopup;