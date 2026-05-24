import { Truck, Clock, MapPin, PackageCheck } from "lucide-react";
import PolicyLayout from "@/components/PolicyLayout";

const Shipping = () => (
  <PolicyLayout
    title="מדיניות משלוחים | Korean Glow IL"
    description="משלוח חינם 100% לכל הארץ, ללא מינימום הזמנה. זמן אספקה: 1 עד 5 ימי עסקים באמצעות שליח עד הבית."
    canonical="https://www.korean-glow-il.shop/shipping"
  >
    <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-900">מדיניות משלוחים</h1>
    <p className="text-lg text-slate-600 leading-relaxed mb-10">
      ב-Korean Glow IL אנחנו דואגים שתקבלי את ההזמנה שלך מהר, בנוחות וללא הפתעות.
    </p>

    <div className="bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-3xl p-8 mb-10 shadow-xl">
      <div className="flex items-center gap-3 mb-3">
        <Truck size={32} />
        <h2 className="text-2xl md:text-3xl font-black">משלוח חינם 100%</h2>
      </div>
      <p className="text-pink-50 text-lg leading-relaxed">
        כל המוצרים באתר נשלחים <strong>בחינם לכל הארץ</strong> — ללא מינימום הזמנה, ללא דמי טיפול, ללא כוכביות.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-4 mb-12">
      <div className="border border-pink-100 rounded-2xl p-5 flex items-start gap-3">
        <Clock className="text-pink-600 flex-shrink-0 mt-1" size={20} />
        <div>
          <div className="font-bold text-slate-900 mb-1">זמן אספקה</div>
          <div className="text-slate-600 text-sm">1 עד 5 ימי עסקים בכל רחבי הארץ</div>
        </div>
      </div>
      <div className="border border-pink-100 rounded-2xl p-5 flex items-start gap-3">
        <PackageCheck className="text-pink-600 flex-shrink-0 mt-1" size={20} />
        <div>
          <div className="font-bold text-slate-900 mb-1">זמן טיפול בהזמנה</div>
          <div className="text-slate-600 text-sm">0–1 ימי עסקים מרגע ביצוע ההזמנה</div>
        </div>
      </div>
      <div className="border border-pink-100 rounded-2xl p-5 flex items-start gap-3">
        <Truck className="text-pink-600 flex-shrink-0 mt-1" size={20} />
        <div>
          <div className="font-bold text-slate-900 mb-1">זמן הובלה</div>
          <div className="text-slate-600 text-sm">1–4 ימי עסקים נוספים</div>
        </div>
      </div>
      <div className="border border-pink-100 rounded-2xl p-5 flex items-start gap-3">
        <MapPin className="text-pink-600 flex-shrink-0 mt-1" size={20} />
        <div>
          <div className="font-bold text-slate-900 mb-1">שיטת המשלוח</div>
          <div className="text-slate-600 text-sm">שליח עד הבית</div>
        </div>
      </div>
    </div>

    <section className="prose prose-slate max-w-none text-right" dir="rtl">
      <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">פרטי מדיניות המשלוחים</h2>
      <ul className="list-disc pr-6 space-y-2 text-slate-700 leading-relaxed">
        <li><strong>עלות משלוח:</strong> 0 ש"ח. משלוח חינם על כל הזמנה, ללא מינימום קנייה.</li>
        <li><strong>אזורי משלוח:</strong> שירות המשלוחים פעיל בכל רחבי מדינת ישראל.</li>
        <li><strong>ימי משלוח:</strong> משלוחים מתבצעים בימים א'–ה', למעט ימי שישי, שבת וחגי ישראל.</li>
        <li><strong>זמן טיפול:</strong> ההזמנה נארזת ונשלחת בתוך 0–1 ימי עסקים מרגע אישור התשלום.</li>
        <li><strong>זמן הובלה:</strong> חברת השליחויות מבצעת את האספקה בתוך 1–4 ימי עסקים נוספים.</li>
        <li><strong>סה"כ זמן אספקה ממוצע:</strong> 1 עד 5 ימי עסקים מרגע ביצוע ההזמנה.</li>
        <li><strong>תיאום משלוח:</strong> השליח יצור איתך קשר טלפוני לפני ההגעה לתיאום מועד נוח.</li>
        <li><strong>עיכובים:</strong> בתקופות עומס, חגים או נסיבות שאינן בשליטתנו (לרבות כוח עליון), ייתכנו עיכובים קלים. במקרה כזה ניידע אותך בהקדם.</li>
      </ul>

      <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">מעקב אחר ההזמנה</h2>
      <p className="text-slate-700 leading-relaxed">
        מיד עם שליחת ההזמנה תקבלי הודעת אישור במייל הכוללת את פרטי המשלוח. לכל שאלה בנוגע לסטטוס ההזמנה ניתן לפנות אלינו במייל
        {" "}<a href="mailto:nadav@nadavunger.com" className="text-pink-600 font-bold">nadav@nadavunger.com</a>{" "}
        או בטלפון <a href="tel:+972543965339" className="text-pink-600 font-bold">054-3965339</a> בשעות הפעילות (א'–ה', 09:00–17:00).
      </p>
    </section>
  </PolicyLayout>
);

export default Shipping;