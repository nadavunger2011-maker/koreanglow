import { ShieldCheck, RefreshCw, Wallet, PackageOpen } from "lucide-react";
import PolicyLayout from "@/components/PolicyLayout";

const Returns = () => (
  <PolicyLayout
    title="מדיניות החזרים וביטולים | Korean Glow IL"
    description="התחייבות לשביעות רצון: 30 יום להחזרה גם אם המוצר נפתח. ללא דמי טיפול. החזר כספי מלא תוך 14–30 ימי עסקים."
    canonical="https://www.korean-glow-il.shop/returns"
  >
    <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-900">מדיניות החזרים וביטולים</h1>
    <p className="text-lg text-slate-600 leading-relaxed mb-10">
      ב-Korean Glow IL אנו עומדים מאחורי כל מוצר שלנו ופועלים בהתאם לחוק הגנת הצרכן, התשמ"א-1981, ולסטנדרט הזהב של Herbalife.
      שביעות הרצון שלך היא המחויבות הראשונה שלנו.
    </p>

    <div className="bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-3xl p-8 mb-10 shadow-xl">
      <div className="flex items-center gap-3 mb-3">
        <ShieldCheck size={32} />
        <h2 className="text-2xl md:text-3xl font-black">התחייבות שביעות רצון — 30 יום</h2>
      </div>
      <p className="text-pink-50 text-lg leading-relaxed">
        לא מרוצה? נחזיר לך את כספך. את יכולה להחזיר את המוצר <strong>גם אם נפתח ונעשה בו שימוש חלקי</strong>, כל עוד נשארה האריזה המקורית עם יתרת התוכן.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-4 mb-12">
      <div className="border border-pink-100 rounded-2xl p-5 flex items-start gap-3">
        <PackageOpen className="text-pink-600 flex-shrink-0 mt-1" size={20} />
        <div>
          <div className="font-bold text-slate-900 mb-1">גם מוצר שנפתח</div>
          <div className="text-slate-600 text-sm">החזרה אפשרית גם לאחר שימוש חלקי</div>
        </div>
      </div>
      <div className="border border-pink-100 rounded-2xl p-5 flex items-start gap-3">
        <Wallet className="text-pink-600 flex-shrink-0 mt-1" size={20} />
        <div>
          <div className="font-bold text-slate-900 mb-1">0% דמי טיפול</div>
          <div className="text-slate-600 text-sm">ללא דמי ביטול, ללא דמי החזרה</div>
        </div>
      </div>
      <div className="border border-pink-100 rounded-2xl p-5 flex items-start gap-3">
        <RefreshCw className="text-pink-600 flex-shrink-0 mt-1" size={20} />
        <div>
          <div className="font-bold text-slate-900 mb-1">החזר כספי מלא</div>
          <div className="text-slate-600 text-sm">לאמצעי התשלום המקורי, תוך 14–30 ימי עסקים</div>
        </div>
      </div>
      <div className="border border-pink-100 rounded-2xl p-5 flex items-start gap-3">
        <ShieldCheck className="text-pink-600 flex-shrink-0 mt-1" size={20} />
        <div>
          <div className="font-bold text-slate-900 mb-1">מוצר פגום? אנחנו מחליפים</div>
          <div className="text-slate-600 text-sm">מוצר שהגיע פגום יוחלף על חשבוננו</div>
        </div>
      </div>
    </div>

    <section className="text-right" dir="rtl">
      <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">תנאי ההחזרה</h2>
      <ul className="list-disc pr-6 space-y-2 text-slate-700 leading-relaxed">
        <li><strong>חלון ההחזרה:</strong> 30 יום מיום קבלת המוצר, בהתאם להתחייבות שביעות הרצון שלנו ולסטנדרט הזהב של Herbalife.</li>
        <li><strong>מצב המוצר:</strong> ניתן להחזיר מוצר גם אם נפתח ונעשה בו שימוש חלקי, ובלבד שהאריזה המקורית מוחזרת יחד עם יתרת התוכן.</li>
        <li><strong>ללא דמי טיפול:</strong> איננו גובים דמי ביטול, דמי טיפול או דמי החזרה (0% restocking fee).</li>
        <li><strong>אופן ההחזר:</strong> ההחזר הכספי יבוצע לאמצעי התשלום שבו בוצעה הרכישה המקורית.</li>
        <li><strong>מועד ההחזר הכספי:</strong> תוך 14 עד 30 ימי עסקים מרגע קבלת המוצר במחסנינו.</li>
      </ul>

      <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">איך מבצעים החזרה?</h2>
      <ol className="list-decimal pr-6 space-y-2 text-slate-700 leading-relaxed">
        <li>פנייה בכתב למייל <a href="mailto:nadav@nadavunger.com" className="text-pink-600 font-bold">nadav@nadavunger.com</a> או טלפונית למספר <a href="tel:+972543965339" className="text-pink-600 font-bold">054-3965339</a> עם פרטי ההזמנה.</li>
        <li>אריזת המוצר באריזתו המקורית יחד עם יתרת התוכן.</li>
        <li>שליחת המוצר על אחריות הלקוח/ה לכתובת: <strong>רחוב זרחין 1, רעננה, ישראל</strong>.</li>
        <li>לאחר קבלת המוצר ובדיקתו, יבוצע החזר כספי מלא לאמצעי התשלום המקורי תוך 14–30 ימי עסקים.</li>
      </ol>

      <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">דמי משלוח להחזרה</h2>
      <p className="text-slate-700 leading-relaxed">
        החזרת המוצר מתבצעת באחריות הלקוח/ה ועל חשבונו/ה אל המחסן שלנו ברחוב זרחין 1, רעננה.
        <strong className="block mt-2">במקרה שהמוצר הגיע פגום, שבור או פגום מהיצרן — אנו מחליפים אותו ללא עלות כלל, לרבות עלות המשלוח החוזר.</strong>
      </p>

      <h2 className="text-2xl font-black text-slate-900 mt-10 mb-4">ביטול עסקה לפי חוק הגנת הצרכן</h2>
      <p className="text-slate-700 leading-relaxed">
        בהתאם לחוק הגנת הצרכן, התשמ"א-1981 ולתקנות הגנת הצרכן (ביטול עסקה), התשע"א-2010, ניתן לבטל עסקת מכר מרחוק בתוך 14 יום מיום
        קבלת המוצר. מדיניות זו מעניקה ללקוחותינו זכויות נרחבות יותר מהקבוע בחוק — חלון של 30 יום, גם למוצרים שנפתחו.
      </p>
      <p className="text-slate-700 leading-relaxed mt-3">
        עבור צרכן המוגדר כ"אדם עם מוגבלות", "אזרח ותיק" או "עולה חדש", זכות הביטול עומדת על 4 חודשים מיום העסקה, בכפוף להצגת תעודה.
      </p>
    </section>
  </PolicyLayout>
);

export default Returns;