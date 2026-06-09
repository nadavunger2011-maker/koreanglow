import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, Check, Copy, Loader2, Sparkles, X } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { pushEvent } from "@/lib/analytics";

const DISMISSED_KEY = "kbeauty_quiz_dismissed";
const COMPLETED_KEY = "kbeauty_quiz_completed";
const SHOW_DELAY_MS = 4000;
const COUPON = "KGLOW10";

type SkinType = "dry" | "oily" | "combo" | "sensitive";
type Concern = "dryness" | "acne" | "pigmentation" | "aging";
type Texture = "light" | "rich" | "both";

type Option<T extends string> = { value: T; label: string; desc: string };

const skinTypes: Option<SkinType>[] = [
  { value: "dry", label: "עור יבש", desc: "מרגיש מתוח, מתקלף או זקוק ללחות אינטנסיבית" },
  { value: "oily", label: "עור שומני", desc: "מבריק, נקבוביות מורחבות, נוטה לשומן יתר" },
  { value: "combo", label: "עור מעורב", desc: "אזור ה-T שומני, לחיים יבשות או רגילות" },
  { value: "sensitive", label: "עור רגיש / רגיל", desc: "אדמומיות קלה, מגורה בקלות או מאוזן היטב" },
];

const concerns: Option<Concern>[] = [
  { value: "dryness", label: "יובש וחוסר לחות", desc: "עור עמום, חסר חיוניות, חספסוס" },
  { value: "acne", label: "פצעונים וראשים שחורים", desc: "אקנה, נקבוביות סתומות, אדמומיות" },
  { value: "pigmentation", label: "כתמי עור ופיגמנטציה", desc: "גוון עור לא אחיד, סימני פוסט-אקנה, נזקי שמש" },
  { value: "aging", label: "קמטוטים וסימני גיל", desc: "איבוד אלסטיות, קמטים עדינים" },
];

const textures: Option<Texture>[] = [
  { value: "light", label: "קליל ונספג מהר", desc: "ג'לים, סרומים מימיים, תחליב קל" },
  { value: "rich", label: "עשיר ומזין עמוק", desc: "קרמים סמיכים, שמנים לפנים, באלם" },
  { value: "both", label: "אין לי העדפה / תראו לי את שניהם!", desc: "" },
];

const emailSchema = z.string().trim().email("כתובת אימייל לא תקינה").max(255);

const totalSteps = 5; // progress bar across steps 1..5 (skip welcome)

export const SkinQuizPopup = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [skinType, setSkinType] = useState<SkinType | null>(null);
  const [concern, setConcern] = useState<Concern | null>(null);
  const [texture, setTexture] = useState<Texture | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY) || localStorage.getItem(COMPLETED_KEY)) return;
    const t = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setOpen(false);
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  };

  const closeAfterCompleted = () => {
    setOpen(false);
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "כתובת אימייל לא תקינה");
      return;
    }
    setLoading(true);
    const { error: dbError } = await supabase.from("leads").insert({
      email: parsed.data,
      source_page: `${location.pathname}${location.search}`,
    });
    if (dbError) {
      setLoading(false);
      setError("אופס, משהו השתבש. נסי שוב.");
      return;
    }
    supabase.functions
      .invoke("sync-shopify-customer", { body: { email: parsed.data } })
      .catch(() => {});
    localStorage.setItem(COMPLETED_KEY, String(Date.now()));
    pushEvent("generate_lead", {
      currency: "ILS",
      value: 0,
      lead_source: "kbeauty_quiz",
      skin_type: skinType,
      concern,
      texture,
    });
    pushEvent("quiz_complete", { skin_type: skinType, concern, texture });
    setLoading(false);
    setStep(5);
  };

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

  const routine = useMemo(() => {
    if (skinType === "dry") {
      return [
        "שלב 1: סבון פנים לחותי עדין",
        "שלב 2: תמצית גלואו עשירה (עם ריר חלזונות)",
        "שלב 3: קרם הגנה משקם ומזין",
      ];
    }
    if (skinType === "oily") {
      return [
        "שלב 1: ג'ל ניקוי מאזן",
        "שלב 2: טונר סנטלה מרגיע וקליל",
        "שלב 3: קרם לחות נטול שומן",
      ];
    }
    return [
      "שלב 1: ניקוי עדין ומאוזן",
      "שלב 2: טונר/אסנס מרענן להחזרת הלחות",
      "שלב 3: קרם לחות קליל עם הגנה",
    ];
  }, [skinType]);

  const concernBadge = useMemo(() => {
    if (concern === "pigmentation")
      return "רכיב מומלץ עבורך: ניאצינמיד או ויטמין C להבהרה";
    if (concern === "acne")
      return "רכיב מומלץ עבורך: סנטלה אסיאטיקה או עץ התה להרגעת העור";
    return null;
  }, [concern]);

  if (!open) return null;

  const progress = step === 0 ? 0 : Math.min((step / totalSteps) * 100, 100);

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-[92vw] max-w-md sm:max-w-lg bg-background text-foreground rounded-3xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-300">
        {/* Progress bar (RTL: fills from right) */}
        <div className="h-1.5 w-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          aria-label="סגירה"
          className="absolute top-3 left-3 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div key={step} className="p-6 sm:p-8 text-right animate-in fade-in slide-in-from-bottom-2 duration-300">
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex justify-start">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                  <Sparkles className="h-3.5 w-3.5" />
                  K-Beauty Quiz
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                גלי את סוד ה-K-Glow שלך ✨
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                עני על שאלון קצר של 30 שניות להתאמת שגרת טיפוח קוריאנית מדויקת עבורך + קבלי 10% הנחה לרכישה הראשונה!
              </p>
              <button
                onClick={() => {
                  pushEvent("quiz_start", { quiz_name: "kbeauty_skin_quiz" });
                  setStep(1);
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 font-semibold shadow-lg hover:opacity-90 transition"
              >
                להתחלת השאלון
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 1 && (
            <QuizStep
              title="מהו סוג העור שלך?"
              options={skinTypes}
              value={skinType}
              onSelect={(v) => {
                setSkinType(v);
                pushEvent("quiz_step", { quiz_step_number: 1, quiz_step_name: "skin_type", quiz_answer: v });
                setTimeout(() => setStep(2), 200);
              }}
            />
          )}
          {step === 2 && (
            <QuizStep
              title="מהי דאגת העור העיקרית שלך?"
              options={concerns}
              value={concern}
              onSelect={(v) => {
                setConcern(v);
                pushEvent("quiz_step", { quiz_step_number: 2, quiz_step_name: "concern", quiz_answer: v });
                setTimeout(() => setStep(3), 200);
              }}
            />
          )}
          {step === 3 && (
            <QuizStep
              title="איזה מרקם את מעדיפה במוצרי הטיפוח שלך?"
              options={textures}
              value={texture}
              onSelect={(v) => {
                setTexture(v);
                pushEvent("quiz_step", { quiz_step_number: 3, quiz_step_name: "texture", quiz_answer: v });
                setTimeout(() => setStep(4), 200);
              }}
            />
          )}

          {step === 4 && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                שגרת ה-K-Glow שלך מוכנה!
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                הזיני את המייל שלך כדי לחשוף את השגרה המותאמת לך ולקבל קוד קופון של 10% הנחה.
              </p>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="האימייל שלך..."
                className="rounded-full h-12 text-right px-5"
                dir="rtl"
                required
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                חשפו לי את השגרה וקבלו 10% הנחה
              </button>
            </form>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                שגרת הטיפוח המותאמת לך
              </h2>
              <ul className="space-y-2">
                {routine.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-2xl border border-border bg-accent/40 px-4 py-3 text-sm sm:text-base"
                  >
                    {s}
                  </li>
                ))}
              </ul>
              {concernBadge && (
                <div className="rounded-2xl bg-primary/10 text-primary px-4 py-3 text-sm font-medium">
                  {concernBadge}
                </div>
              )}
              <div className="rounded-2xl border-2 border-dashed border-primary/50 p-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={copyCoupon}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "הועתק!" : "העתקת קוד"}
                </button>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">השתמשי בקוד בקופה:</div>
                  <div className="text-lg font-bold tracking-wider text-primary">{COUPON}</div>
                </div>
              </div>
              <button
                onClick={closeAfterCompleted}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 font-semibold shadow-lg hover:opacity-90 transition"
              >
                לרכישת השגרה שלי
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function QuizStep<T extends string>({
  title,
  options,
  value,
  onSelect,
}: {
  title: string;
  options: Option<T>[];
  value: T | null;
  onSelect: (v: T) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold leading-tight">{title}</h2>
      <div className="space-y-2.5">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={[
                "w-full text-right rounded-2xl border px-4 py-3 transition-all",
                selected
                  ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-accent/40",
              ].join(" ")}
            >
              <div className="font-semibold">{opt.label}</div>
              {opt.desc && (
                <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">{opt.desc}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SkinQuizPopup;