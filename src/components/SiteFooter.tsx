import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, BadgeCheck } from "lucide-react";

export const BUSINESS = {
  name: "Korean Glow IL",
  address: "רחוב זרחין 1, רעננה, ישראל",
  phone: "054-3965339",
  phoneTel: "+972543965339",
  email: "nadav@nadavunger.com",
  hours: "ימים א'–ה', 09:00–17:00",
  businessId: "200353720",
};

const SiteFooter = () => {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-slate-100" dir="rtl">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-10 text-right mb-12">
          <div>
            <div className="text-2xl font-black tracking-tighter text-pink-600 mb-3">KOREANGLOW</div>
            <p className="text-slate-500 text-sm leading-relaxed">
              סדרת טיפוח קוריאנית מתקדמת לעור זכוכית — מדע, זוהר ותוצאות מוכחות.
            </p>
          </div>

          <div>
            <h3 className="font-black text-slate-900 mb-4">מידע משפטי</h3>
            <ul className="space-y-2 text-sm font-medium">
              <li><Link to="/contact" className="text-slate-600 hover:text-pink-600">צור קשר</Link></li>
              <li><Link to="/shipping" className="text-slate-600 hover:text-pink-600">מדיניות משלוחים</Link></li>
              <li><Link to="/returns" className="text-slate-600 hover:text-pink-600">החזרים וביטולים</Link></li>
              <li><Link to="/blog" className="text-slate-600 hover:text-pink-600">בלוג</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-black text-slate-900 mb-4">פרטי העסק</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2 justify-end">
                <span>{BUSINESS.name}</span>
              </li>
              <li className="flex items-start gap-2 justify-end">
                <span>{BUSINESS.address}</span>
                <MapPin size={16} className="text-pink-500 flex-shrink-0 mt-0.5" />
              </li>
              <li className="flex items-start gap-2 justify-end">
                <a href={`tel:${BUSINESS.phoneTel}`} className="hover:text-pink-600">{BUSINESS.phone}</a>
                <Phone size={16} className="text-pink-500 flex-shrink-0 mt-0.5" />
              </li>
              <li className="flex items-start gap-2 justify-end">
                <a href={`mailto:${BUSINESS.email}`} className="hover:text-pink-600 break-all">{BUSINESS.email}</a>
                <Mail size={16} className="text-pink-500 flex-shrink-0 mt-0.5" />
              </li>
              <li className="flex items-start gap-2 justify-end">
                <span>{BUSINESS.hours}</span>
                <Clock size={16} className="text-pink-500 flex-shrink-0 mt-0.5" />
              </li>
              <li className="flex items-start gap-2 justify-end">
                <span>ח.פ / עוסק מורשה: {BUSINESS.businessId}</span>
                <BadgeCheck size={16} className="text-pink-500 flex-shrink-0 mt-0.5" />
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 text-center text-slate-400 text-xs uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} {BUSINESS.name}. כל הזכויות שמורות.
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;