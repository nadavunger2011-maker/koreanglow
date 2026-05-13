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
} from "lucide-react";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
        <title>Koreanglow — Advanced Korean Skincare for Glass Skin</title>
        <meta name="description" content="Koreanglow offers curated K-Beauty skincare with 10% niacinamide serum and full glass-skin routines, dermatologist-tested for radiant, even-toned skin." />
        <link rel="canonical" href="https://koreanglow.lovable.app/" />
        <meta property="og:title" content="Koreanglow — Advanced Korean Skincare for Glass Skin" />
        <meta property="og:description" content="Curated K-Beauty skincare for glass-skin results — 10% niacinamide serum and full daily routines." />
        <meta property="og:url" content="https://koreanglow.lovable.app/" />
        <meta property="og:type" content="website" />
      </Helmet>
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-pink-50">
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
      <header className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-pink-50 via-white to-blue-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-xs font-bold mb-8">
              <Sparkles size={14} />
              <span>המדע הקוריאני המתקדם ביותר</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
              מוצרי <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">טיפוח קוריאני</span> <br className="hidden md:block" />
              לעור זכוכית מושלם
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              הדרך המדעית והמהירה ביותר לעור זוהר, אחיד ומוצק. שגרת טיפוח קוריאנית (Glass Skin) מותאמת אישית לתוצאות שנראות לעין.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              <a href="#packages" className="w-full sm:w-auto text-center bg-pink-500 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-bold shadow-2xl hover:bg-pink-600 hover:-translate-y-1 transition-all duration-300">
                לכל החבילות
              </a>
              <a href="#about" className="w-full sm:w-auto text-center bg-white border-2 border-slate-900 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-bold hover:bg-slate-50 transition-all duration-300">
                גלי עוד
              </a>
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
            <h2 className="text-4xl md:text-5xl font-black mb-6 italic">סרום ניאצינאמיד 10% ושגרת הזוהר שלך</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">בחרי את המסלול שמתאים בדיוק לסדר היום שלך</p>
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
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
      <footer className="bg-white pt-24 pb-12 border-t border-slate-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
          <div className="text-4xl font-black tracking-tighter text-slate-900 mb-8">KOREANGLOW</div>
          <p className="text-slate-400 text-sm mb-12">מדע קוריאני. עור זכוכית. התוצאה שלך.</p>

          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 text-sm font-bold text-slate-400 mb-16">
            <a href="#" className="hover:text-pink-500 transition-colors">מדיניות פרטיות</a>
            <a href="#" className="hover:text-pink-500 transition-colors">תנאי שימוש</a>
            <a href="#" className="hover:text-pink-500 transition-colors">צור קשר</a>
          </div>

          <div className="text-slate-300 text-xs font-medium uppercase tracking-[0.2em]">
            © 2026 Koreanglow.co.il. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
