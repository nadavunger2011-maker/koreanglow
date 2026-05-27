import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Sparkles,
  Check,
  Menu,
  X,
  Beaker,
  ShieldCheck,
  Zap,
  Loader2,
  PlayCircle,
  Droplet,
  FlaskConical,
  Lock,
  Gift,
  Truck,
  Star,
  Flame,
  Crown,
  Award,
} from "lucide-react";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import SiteFooter from "@/components/SiteFooter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import review1 from "@/assets/review-1.png";
import review2 from "@/assets/review-2.png";
import review3 from "@/assets/review-3.png";
import review4 from "@/assets/review-4.png";
import review5 from "@/assets/review-5.png";
import review6 from "@/assets/review-6.png";
import review7 from "@/assets/review-7.png";
import review8 from "@/assets/review-8.png";
import review9 from "@/assets/review-9.png";

const faqs = [
  {
    q: "האם הסדרה מכילה מרכיבים טבעיים?",
    a: "המוצרים מכילים מרכיבים ממקור טבעי היכן שניתן, לצד מרכיבים פעילים הנתמכים מדעית כדי להבטיח תוצאות אופטימליות.",
  },
  {
    q: "האם המוצרים מכילים פרבנים וסולפטים?",
    a: "כל המוצרים בסדרה אינם מכילים פרבנים. ג'ל הניקוי לפנים אינו מכיל פרבנים וסולפטים.",
  },
  {
    q: "האם המוצרים נטולי בישום?",
    a: "פורמולת הסרום אינה כוללת מרכיבי בישום. שאר המוצרים מכילים ניחוחות עדינים שנבחרו בקפידה כדי לשפר את חוויית הטיפוח.",
  },
  {
    q: "לאילו סוגי עור מתאימים המוצרים?",
    a: "המוצרים מתאימים לכל סוגי העור — רגיל, יבש, שמן, מעורב ורגיש.",
  },
  {
    q: "לאילו גילים מתאימה הסדרה?",
    a: "המוצרים מיועדים בדרך כלל למבוגרים ולבני נוער מגיל 18 ומעלה.",
  },
  {
    q: "באיזו תדירות מומלץ להשתמש במוצרים?",
    a: "ג'ל ניקוי לפנים – פעמיים ביום. קרם עיניים מזין – פעמיים ביום. קרם למיצוק – פעם ביום בבוקר. סרום ניאצינאמיד 10% – פעם ביום. תחליב לידיים וגוף – לפי הצורך.",
  },
  {
    q: "האם המוצרים נוסו על בעלי חיים?",
    a: "לא. אף אחד מהמוצרים לא נוסה על בעלי חיים. כל הסדרה נבדקה דרמטולוגית.",
  },
];

const routine = {
  morning: ["ג'ל ניקוי לפנים", "סרום ניאצינאמיד 10%", "קרם עיניים מזין", "קרם למיצוק מרקם העור"],
  evening: ["ג'ל ניקוי לפנים", "סרום ניאצינאמיד 10%", "קרם עיניים מזין"],
  asNeeded: ["תחליב מזין לידיים ולגוף"],
};

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    fetchProducts(20, "title:חבילה* OR title:החבילה* OR title:חבילת*")
      .then(setProducts)
      .catch((e) => console.error("Failed to fetch products:", e))
      .finally(() => setLoadingProducts(false));
  }, []);

  const ingredients = [
    { name: "10% ניאצינאמיד", benefit: "צמצום נקבוביות והבהרה" },
    { name: "אדנוזין", benefit: "מיצוק והחלקת קמטים" },
    { name: "סקוואלן", benefit: "לחות עמוקה ללא שומן" },
    { name: "פפטידים", benefit: "שיקום ובניית העור" },
  ];

  const tutorials = [
    { id: "YxUElSjZAys", title: "הכירו את הסדרה", desc: "סקירה מלאה של סדרת הטיפוח עם מומחית העור מיכאלה בולדר" },
    { id: "TMFOiKPxWSY", title: "ג'ל ניקוי לפנים", desc: "הצעד הראשון בשגרה — איך לנקות נכון בלי לייבש את העור" },
    { id: "gjeiPv6jA1Y", title: "סרום ניאצינאמיד 10%", desc: "הכוכב של הסדרה — איך לשלב סרום בריכוז גבוה בשגרה" },
    { id: "p8UpsUhhe40", title: "קרם עיניים מזין", desc: "טיפוח האזור העדין סביב העיניים נגד קמטוטים ועיגולים" },
    { id: "vVsTgGALmvw", title: "קרם למיצוק העור", desc: "למה העור מאבד מוצקות עם השנים — ואיך מתמודדים" },
    { id: "xtNoO8oEewQ", title: "תחליב לידיים ולגוף", desc: "טיפוח הגוף חשוב לא פחות מטיפוח הפנים" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground" dir="rtl">
      <Helmet>
        <title>טיפוח קוריאני לעור זכוכית (Glass Skin) – ערכת Koreanglow</title>
        <meta name="description" content="טיפוח קוריאני אותנטי לעור זכוכית תוך 14 יום. ערכת Glass Skin עם 3 מוצרי פרימיום + בונוסים, משלוח חינם ו-30 יום אחריות." />
        <link rel="canonical" href="https://koreanglow.lovable.app/" />
        <meta property="og:title" content="טיפוח קוריאני לעור זכוכית – ערכת Koreanglow Glass Skin" />
        <meta property="og:description" content="ערכת טיפוח קוריאני מלאה לעור Glass Skin – 3 מוצרי פרימיום, בונוסים ומשלוח חינם." />
        <meta property="og:url" content="https://koreanglow.lovable.app/" />
        <meta property="og:type" content="website" />
      </Helmet>
      {/* Top urgency strip */}
      <div className="fixed top-0 inset-x-0 z-[60] bg-slate-900 text-white text-center text-[12px] sm:text-sm py-2 px-4 font-semibold">
        <span className="inline-flex items-center gap-2">
          <Flame size={14} className="text-pink-400" />
          טכנולוגיה קוריאנית. תוצאות מוכחות.
        </span>
      </div>
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-pink-50 top-9 sm:top-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-black tracking-tighter text-pink-600">KOREANGLOW</span>
            </div>

            <div className="hidden md:flex space-x-reverse space-x-10 text-sm font-bold uppercase tracking-widest">
              <a href="#about" className="hover:text-pink-500 transition-colors">מה זה עור זכוכית?</a>
              <a href="#packages" className="hover:text-pink-500 transition-colors">סרום ניאצינאמיד</a>
              <a href="#science" className="hover:text-pink-500 transition-colors">מיצוק העור</a>
              <a href="/blog" className="hover:text-pink-500 transition-colors">בלוג</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <a
                href="#packages"
                className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-pink-600 transition-all shadow-lg"
              >
                לחבילות
              </a>
              <CartDrawer />
            </div>

            <div className="md:hidden flex items-center gap-2">
              <CartDrawer />
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="תפריט">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-background border-b border-slate-100 p-6 space-y-4 shadow-xl">
            <a href="#about" className="block text-lg font-bold">מה זה עור זכוכית?</a>
            <a href="#packages" className="block text-lg font-bold">סרום ניאצינאמיד</a>
            <a href="#science" className="block text-lg font-bold">מיצוק העור</a>
            <a href="/blog" className="block text-lg font-bold">בלוג</a>
            <a
              href="#packages"
              className="block text-center w-full bg-pink-500 text-white py-4 rounded-xl font-bold"
            >
              לחבילות
            </a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 sm:pt-44 pb-20 overflow-hidden bg-gradient-to-br from-pink-50 via-white to-blue-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-xs font-bold mb-8">
              <Sparkles size={14} />
              <span>טיפוח קוריאני • מהדורה מוגבלת</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
              סוד ה<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">טיפוח הקוריאני</span> לעור חלק כמו זכוכית (Glass Skin) – תוך 14 יום!
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              בלי שגרה מתישה של 10 שלבים ובלי לבזבז אלפי שקלים בקליניקות. רק 3 מוצרים מנצחים, 2 דקות ביום, ותוצאות שתראי כבר במריחה הראשונה.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              <a
                href="#offer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("offer")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto text-center bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-black shadow-2xl shadow-pink-500/40 hover:-translate-y-1 transition-all duration-300 ring-4 ring-pink-200/60"
              >
                ✨ אני רוצה עור קורן – לפרטי הערכה
              </a>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1"><Check size={16} className="text-pink-500" /> משלוח אקספרס חינם</span>
              <span className="inline-flex items-center gap-1"><Check size={16} className="text-pink-500" /> 30 יום החזר כספי</span>
              <span className="inline-flex items-center gap-1"><Check size={16} className="text-pink-500" /> נבדק דרמטולוגית</span>
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 left-0 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl translate-y-1/3 translate-x-1/3"></div>
      </header>

      {/* Intro Video */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black mb-4 italic">הכירו את הסדרה</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              סדרת טיפוח חדשנית המשלבת טכנולוגיה קוריאנית מתקדמת עם מרכיבים מוכחים קלינית
            </p>
          </div>
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-pink-100">
            <iframe
              src="https://www.youtube.com/embed/-qvdeG5_33M"
              title="הכירו את סדרת הטיפוח"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="results" className="py-24 bg-gradient-to-b from-white to-pink-50/40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1 text-pink-500 mb-3">
              {[0,1,2,3,4].map((i) => <Star key={i} size={18} fill="currentColor" />)}
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-3">
              לקוחות מספרות על שגרת ה-Glass Skin שלהן
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              בלי תמונות לפני/אחרי מבוימות — רק חוויות שימוש אמיתיות, ברורות וממוקדות תוצאה
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "מיכל ל., 34",
                quote: "ניסיתי הכל לעור יבש, ורק השילוב הזה החזיר לי את הגלואו!",
                result: "העור מרגיש רך יותר, פחות עייף ועם ברק טבעי כבר מהימים הראשונים.",
              },
              {
                name: "שירה ע., 41",
                quote: "תוך שבוע וחצי המרקם של העור השתנה לחלוטין. מומלץ ברמות.",
                result: "השגרה קצרה, נעימה, ולא מרגישה כמו עוד מטלה בסוף היום.",
              },
              {
                name: "נועה ק., 29",
                quote: "סוף סוף עור חלק בלי פילטרים. הבייסליין החדש שלי לטיפוח קוריאני.",
                result: "הסרום נספג מהר, הקרם יושב יפה, והאיפור נראה הרבה יותר אחיד.",
              },
            ].map((card, idx) => (
              <article key={idx} className="bg-white rounded-3xl border border-pink-100 shadow-sm hover:shadow-2xl transition-shadow p-7 text-right h-full flex flex-col">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-1 text-pink-500">
                    {[0,1,2,3,4].map((i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <span className="text-xs font-black text-pink-600 bg-pink-50 px-3 py-1 rounded-full">חוות דעת מאומתת</span>
                </div>
                <p className="text-slate-800 text-lg font-bold leading-relaxed mb-5">"{card.quote}"</p>
                <div className="mt-auto border-t border-pink-50 pt-5">
                  <p className="text-sm font-bold text-slate-900 mb-2">מה היא אהבה בשגרה:</p>
                  <p className="text-slate-600 leading-relaxed text-sm">{card.result}</p>
                  <p className="text-sm text-slate-400 font-bold mt-4">— {card.name}</p>
                </div>
              </article>
            ))}
          </div>

          {/* Real WhatsApp reviews gallery */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                הודעות אמיתיות מלקוחות מרוצות
              </h3>
              <p className="text-slate-500">צילומי מסך מקוריים מהוואטסאפ — דירוג 5.0</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {[review1, review2, review3, review4, review5, review6, review7, review8, review9].map((src, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-pink-100 shadow-sm hover:shadow-xl transition-shadow bg-white">
                  <img
                    src={src}
                    alt={`חוות דעת מלקוחה ${i + 1}`}
                    loading="lazy"
                    className="w-full h-auto block"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — Minimal Effort */}
      <section id="how" className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
              איך זה עובד? <span className="text-slate-400 font-extrabold">(בלי להסתבך)</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              שגרת טיפוח קוריאני אמיתית של 2 דקות בלבד — בוקר וערב
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
            {[
              { icon: Droplet, num: "1", title: "ניקוי והכנה", sub: "טונר עמוק", desc: "פותח את הנקבוביות ומכין את העור לספיגה מלאה של הפעילים." },
              { icon: FlaskConical, num: "2", title: "הזנה מרוכזת", sub: "סרום גלואו עוצמתי", desc: "ניאצינאמיד 10% + פפטידים – מאחד גוון, מבהיר ומחזיר זוהר." },
              { icon: Lock, num: "3", title: "נעילת לחות והגנה", sub: "קרם זכוכית פעיל", desc: "נועל את הפעילים, מחליק את המרקם וחושף את אפקט ה-Glass Skin." },
            ].map(({ icon: Icon, num, title, sub, desc }) => (
              <div key={num} className="relative bg-gradient-to-b from-pink-50/50 to-white p-8 rounded-3xl border border-pink-100 text-center">
                <div className="absolute -top-5 right-1/2 translate-x-1/2 bg-gradient-to-br from-pink-500 to-rose-500 text-white text-2xl font-black w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30">
                  {num}
                </div>
                <div className="mt-4 mb-5 w-16 h-16 mx-auto rounded-2xl bg-white border border-pink-100 flex items-center justify-center text-pink-500">
                  <Icon size={30} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">שלב {num}: {title}</h3>
                <p className="text-sm font-bold text-pink-600 mb-3">({sub})</p>
                <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3-Tier Pricing */}
      <section id="offer" className="py-24 bg-gradient-to-b from-white via-pink-50/30 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
              בחרי את החבילה המושלמת לעור שלך
            </h2>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
              שלוש אפשרויות, תוצאה אחת — עור זכוכית קוריאני
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {/* Tier 1 - Essential */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 mx-auto mb-4">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">ערכת ה-Essential</h3>
                <p className="text-sm text-slate-500">לזוהר יומיומי</p>
              </div>

              <div className="text-center mb-2">
                <span className="text-5xl sm:text-6xl font-black text-slate-900">599</span>
                <span className="text-2xl font-bold text-slate-600 mr-2">₪</span>
              </div>

              <p className="text-sm text-slate-500 text-center mb-6 italic">"התחלה מושלמת לשגרת טיפוח קוריאנית"</p>

              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-3 text-slate-700">
                  <Check size={18} className="text-pink-500 flex-shrink-0 mt-0.5" />
                  <span>שגרת הליבה המלאה (3 מוצרים פרימיום)</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <Check size={18} className="text-pink-500 flex-shrink-0 mt-0.5" />
                  <span>מושלמת למי שמתחילה את המסע</span>
                </li>
              </ul>

              <a
                href="#packages"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="block w-full text-center bg-slate-100 text-slate-900 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                בחרי ערכה זו
              </a>
            </div>

            {/* Tier 2 - Pro Glow (Popular) */}
            <div className="bg-white rounded-3xl border-2 border-pink-500 p-6 sm:p-8 flex flex-col shadow-xl shadow-pink-500/10 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-pink-500/20">
                הבחירה הפופולרית
              </div>

              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 mx-auto mb-4">
                  <Award size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">ערכת ה-Pro Glow המלאה</h3>
                <p className="text-sm text-pink-600 font-bold">(המומלצת)</p>
              </div>

              <div className="text-center mb-2">
                <span className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">799</span>
                <span className="text-2xl font-bold text-pink-600 mr-2">₪</span>
              </div>

              <p className="text-sm text-slate-500 text-center mb-6 italic">"כל מה שצריך לעור Glass Skin מושלם + ליווי אישי"</p>

              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-3 text-slate-700">
                  <Check size={18} className="text-pink-500 flex-shrink-0 mt-0.5" />
                  <span>שגרת ליבה + רולר ג'ייד טבעי</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <Check size={18} className="text-pink-500 flex-shrink-0 mt-0.5" />
                  <span>5 מסכות Snail Mucin</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <Check size={18} className="text-pink-500 flex-shrink-0 mt-0.5" />
                  <span>ניתוח עור חכם AI</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <Check size={18} className="text-pink-500 flex-shrink-0 mt-0.5" />
                  <span>מדריך וידאו אישי — Masterclass</span>
                </li>
                <li className="flex items-start gap-3 text-pink-600 font-bold bg-pink-50 p-2 rounded-lg">
                  <Sparkles size={18} className="text-pink-500 flex-shrink-0 mt-0.5" />
                  <span>הכי משתלמת — הערך הטוב ביותר לכסף!</span>
                </li>
              </ul>

              <a
                href="#packages"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="block w-full text-center bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-pink-500/30 hover:-translate-y-0.5 transition-all"
              >
                בחרי ערכה זו
              </a>
            </div>

            {/* Tier 3 - VIP */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4">
                  <Crown size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">מארז ה-VIP האולטימטיבי</h3>
                <p className="text-sm text-slate-500">לעור קורן</p>
              </div>

              <div className="text-center mb-2">
                <span className="text-5xl sm:text-6xl font-black text-slate-900">950</span>
                <span className="text-2xl font-bold text-slate-600 mr-2">₪</span>
              </div>

              <p className="text-sm text-slate-500 text-center mb-6 italic">"החוויה המלאה לתוצאות לטווח ארוך"</p>

              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-3 text-slate-700">
                  <Check size={18} className="text-pink-500 flex-shrink-0 mt-0.5" />
                  <span>כל מה שכלול ב-Pro Glow</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <Check size={18} className="text-pink-500 flex-shrink-0 mt-0.5" />
                  <span>מלאי ל-3 חודשים</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <Check size={18} className="text-pink-500 flex-shrink-0 mt-0.5" />
                  <span>אבן גואה שא (Gua Sha)</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <Check size={18} className="text-pink-500 flex-shrink-0 mt-0.5" />
                  <span>סט 15 מסכות בד פרימיום</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <Check size={18} className="text-pink-500 flex-shrink-0 mt-0.5" />
                  <span>שיחת ייעוץ עור אישית 1 על 1 עם Hene</span>
                </li>
              </ul>

              <a
                href="#packages"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="block w-full text-center bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
              >
                בחרי ערכה זו
              </a>
            </div>
          </div>

          {/* Guarantee */}
          <div className="mt-14 text-center">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-full text-sm font-bold border border-green-200">
              <ShieldCheck size={18} />
              תוצאות מוכחות תוך 7 ימים או כסף בחזרה
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="aspect-[4/5] bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl" />
              <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-3xl shadow-xl border border-pink-50 hidden md:block">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <span className="font-bold text-2xl">10%</span>
                </div>
                <span className="text-sm text-slate-500 font-medium">ריכוז ניאצינאמיד טהור</span>
              </div>
            </div>
            <div className="lg:w-1/2 text-center lg:text-right">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-8 text-slate-900">
                מה זה טיפוח קוריאני <br /> לעור זכוכית?
              </h2>
              <div className="space-y-6 text-base sm:text-lg text-slate-600 leading-relaxed">
                <p>
                  המראה המבוקש ביותר בעולם ה-K-Beauty הוא <strong>Glass Skin</strong> - עור שנראה חלק, שקוף ורווי בלחות, ממש כמו זכוכית.
                </p>
                <p>
                  ב-Koreanglow אנחנו משלבים פורמולות מתקדמות עם רכיבים פעילים בריכוזים גבוהים כדי להעניק לך את הזוהר הקוריאני המקורי במינימום זמן.
                </p>
              </div>
              <div className="mt-12 grid grid-cols-2 gap-6 sm:gap-8 text-right">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-pink-100 rounded-full text-pink-600"><Check size={16} strokeWidth={3} /></div>
                  <div>
                    <h3 className="font-bold">מדע מוכח</h3>
                    <p className="text-sm text-slate-500">פורמולות שנבדקו במעבדה</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-pink-100 rounded-full text-pink-600"><Check size={16} strokeWidth={3} /></div>
                  <div>
                    <h3 className="font-bold">תוצאות מהירות</h3>
                    <p className="text-sm text-slate-500">שינוי נראה לעין תוך שבועות</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-24 bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 italic">החבילות שלנו לטיפוח קוריאני</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">העדפת לבחור בנפרד? כל החבילות שלנו לעור Glass Skin במקום אחד</p>
          </div>

          {loadingProducts ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-pink-500" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-slate-500">לא נמצאו מוצרים</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 items-stretch mx-3 sm:mx-0">
              {products.map((product) => (
                <ProductCard key={product.node.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Science */}
      <section id="science" className="py-24 bg-gradient-to-b from-white to-pink-50/30 overflow-hidden relative">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 italic">המדע מאחורי הסדרה</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              דרום קוריאה היא מובילה עולמית בחדשנות בתחום טיפוח העור — שילוב של מדע פורץ דרך, תוצאות מהירות ומרקמים המדמים את מרקם העור הטבעי. כל המוצרים נבדקו דרמטולוגית.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white p-10 rounded-3xl border border-pink-100 text-center shadow-sm">
              <div className="text-5xl font-black text-pink-500 mb-3">14</div>
              <p className="text-slate-600 font-medium">ניסויים קליניים</p>
            </div>
            <div className="bg-white p-10 rounded-3xl border border-pink-100 text-center shadow-sm">
              <div className="text-5xl font-black text-pink-500 mb-3">+600</div>
              <p className="text-slate-600 font-medium">נשים בעלות סוגי עור שונים</p>
            </div>
            <div className="bg-white p-10 rounded-3xl border border-pink-100 text-center shadow-sm">
              <div className="text-5xl font-black text-pink-500 mb-3">4,000</div>
              <p className="text-slate-600 font-medium">תמונות תקריב נותחו</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "הארה וזוהר", desc: "מוצרים שמשיבים לעור אחידות, חיוניות ומראה קורן ובריא לאורך זמן, מול אתגרי הסביבה והשמש." },
              { title: "הזדקנות בריאה", desc: "שמירה על מראה עור בריא, גמיש וזוהר בכל גיל — מרקם חלק יותר ומראה מטופח ורענן." },
              { title: "לחות והזנה", desc: "לחות מתמשכת ורכות קטיפתית עם תחליב הגוף והידיים, עשיר בסקוואלן." },
            ].map((c) => (
              <div key={c.title} className="bg-white p-8 rounded-3xl border border-pink-100 shadow-sm">
                <h3 className="text-2xl font-black mb-3 text-slate-900">{c.title}</h3>
                <p className="text-slate-600 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Routine */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 italic">שגרת הטיפוח שלך</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              שלוש שלבים פשוטים: ניקוי, טיפול, לחות — בוקר וערב
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "בוקר", icon: "☀️", steps: routine.morning },
              { title: "ערב", icon: "🌙", steps: routine.evening },
              { title: "לפי הצורך", icon: "✨", steps: routine.asNeeded },
            ].map((block) => (
              <div key={block.title} className="bg-gradient-to-b from-pink-50 to-white p-8 rounded-3xl border border-pink-100">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{block.icon}</span>
                  <h3 className="text-2xl font-black text-slate-900">{block.title}</h3>
                </div>
                <ol className="space-y-3">
                  {block.steps.map((step, i) => (
                    <li key={step} className="flex items-start gap-3 text-slate-700">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-pink-500 text-white text-sm font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-medium pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tutorials */}
      <section id="tutorials" className="py-24 bg-gradient-to-b from-white via-pink-50/30 to-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
              <PlayCircle size={14} />
              <span>סרטוני הדרכה</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 italic">למדי איך להשיג את התוצאות הכי טובות</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              מומחית הטיפוח מיכאלה בולדר מסבירה כל מוצר וכל שלב בשגרה הקוריאנית
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {tutorials.map((tut) => (
              <article key={tut.id} className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-pink-50">
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <iframe
                    src={`https://www.youtube.com/embed/${tut.id}`}
                    title={tut.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-pink-600 transition-colors">
                    {tut.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{tut.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Science (continued) */}
      <section className="py-24 bg-white overflow-hidden relative">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-8 italic">הפתרון המתקדם למיצוק העור</h2>
            <p className="text-lg text-slate-600">
              אנחנו משלבים רכיבי על קוריאניים בריכוזים הגבוהים ביותר המותרים, כדי להבטיח תוצאות של מיצוק, שיקום והצערת העור כבר מהשבועות הראשונים.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="group bg-white p-10 rounded-[2rem] border border-slate-100 text-center hover:border-pink-200 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 mx-auto mb-6 group-hover:scale-110 transition-transform">
                  {idx === 0 && <Beaker size={32} />}
                  {idx === 1 && <Zap size={32} />}
                  {idx === 2 && <ShieldCheck size={32} />}
                  {idx === 3 && <Sparkles size={32} />}
                </div>
                <h3 className="text-xl font-black mb-2 text-slate-900">{ing.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{ing.benefit}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 p-8 sm:p-12 bg-slate-900 rounded-[2rem] sm:rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
            <div className="text-center md:text-right">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">מוכנה להתחיל את המהפכה הקוריאנית שלך?</h3>
              <p className="text-slate-400 text-base sm:text-lg">בחרי את החבילה שמתאימה לך והתחילי שגרת זוהר כבר היום.</p>
            </div>
            <a
              href="#packages"
              className="whitespace-nowrap bg-white text-slate-900 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-bold hover:bg-pink-500 hover:text-white transition-all shadow-2xl"
            >
              לחבילות שלנו
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4 italic">שאלות נפוצות</h2>
            <p className="text-lg text-slate-500">כל מה שרצית לדעת על הסדרה</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-pink-100">
                <AccordionTrigger className="text-right text-lg font-bold text-slate-900 hover:text-pink-600 hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-base leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
};

export default Index;
