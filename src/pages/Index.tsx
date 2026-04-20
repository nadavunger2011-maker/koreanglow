import { useEffect, useState } from "react";
import {
  Sparkles,
  Check,
  Menu,
  X,
  Beaker,
  ShieldCheck,
  Zap,
  Loader2,
} from "lucide-react";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    fetchProducts(20)
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

  return (
    <div className="min-h-screen bg-background font-sans text-foreground" dir="rtl">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-black tracking-tighter text-pink-600">KOREANGLOW</span>
            </div>

            <div className="hidden md:flex space-x-reverse space-x-10 text-sm font-bold uppercase tracking-widest">
              <a href="#about" className="hover:text-pink-500 transition-colors">מה זה עור זכוכית?</a>
              <a href="#packages" className="hover:text-pink-500 transition-colors">סרום ניאצינאמיד</a>
              <a href="#science" className="hover:text-pink-500 transition-colors">מיצוק העור</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-pink-600 transition-all shadow-lg">
                אבחון עור AI
              </button>
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
            <button className="w-full bg-pink-500 text-white py-4 rounded-xl font-bold">אבחון עור AI</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-pink-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-xs font-bold mb-8">
              <Sparkles size={14} />
              <span>המדע הקוריאני המתקדם ביותר</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
              מוצרי <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">טיפוח קוריאני</span> <br className="hidden md:block" />
              לעור זכוכית מושלם
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              הדרך המדעית והמהירה ביותר לעור זוהר, אחיד ומוצק. שגרת טיפוח קוריאנית (Glass Skin) מותאמת אישית לתוצאות שנראות לעין.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button className="bg-pink-500 text-white px-12 py-5 rounded-2xl text-xl font-bold shadow-2xl hover:bg-pink-600 hover:-translate-y-1 transition-all duration-300">
                התחילי אבחון עור חינם
              </button>
              <a href="#packages" className="bg-white border-2 border-slate-900 px-12 py-5 rounded-2xl text-xl font-bold hover:bg-slate-50 transition-all duration-300">
                לכל החבילות
              </a>
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 left-0 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl translate-y-1/3 translate-x-1/3"></div>
      </header>

      {/* About */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-8 text-slate-900">
                מה זה טיפוח קוריאני <br /> לעור זכוכית?
              </h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  המראה המבוקש ביותר בעולם ה-K-Beauty הוא <strong>Glass Skin</strong> - עור שנראה חלק, שקוף ורווי בלחות, ממש כמו זכוכית.
                </p>
                <p>
                  ב-Koreanglow אנחנו משלבים פורמולות מתקדמות עם רכיבים פעילים בריכוזים גבוהים כדי להעניק לך את הזוהר הקוריאני המקורי במינימום זמן.
                </p>
              </div>
              <div className="mt-12 grid grid-cols-2 gap-8">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-pink-100 rounded-full text-pink-600"><Check size={16} strokeWidth={3} /></div>
                  <div>
                    <h4 className="font-bold">מדע מוכח</h4>
                    <p className="text-sm text-slate-500">פורמולות שנבדקו במעבדה</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-pink-100 rounded-full text-pink-600"><Check size={16} strokeWidth={3} /></div>
                  <div>
                    <h4 className="font-bold">התאמה אישית</h4>
                    <p className="text-sm text-slate-500">בעזרת טכנולוגיית AI</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <section id="science" className="py-24 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <h4 className="text-xl font-black mb-2 text-slate-900">{ing.name}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{ing.benefit}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 p-12 bg-slate-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-right">
              <h3 className="text-3xl font-bold mb-4">מוכנה להתחיל את המהפכה הקוריאנית שלך?</h3>
              <p className="text-slate-400 text-lg">אבחון ה-AI שלנו לוקח פחות מ-30 שניות וחוסך לך חודשים של ניסוי וטעייה.</p>
            </div>
            <button className="whitespace-nowrap bg-white text-slate-900 px-12 py-5 rounded-2xl text-xl font-bold hover:bg-pink-500 hover:text-white transition-all shadow-2xl">
              בואי נתחיל אבחון
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-24 pb-12 border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-4xl font-black tracking-tighter text-slate-900 mb-8">KOREANGLOW</div>
          <p className="text-slate-400 text-sm mb-12">מדע קוריאני. עור זכוכית. התוצאה שלך.</p>

          <div className="flex justify-center gap-12 text-sm font-bold text-slate-400 mb-16">
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
