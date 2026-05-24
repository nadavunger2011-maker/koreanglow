import { useState } from "react";
import { z } from "zod";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { toast } from "sonner";
import PolicyLayout from "@/components/PolicyLayout";
import { BUSINESS } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().trim().min(2, "נא להזין שם מלא").max(100),
  email: z.string().trim().email("כתובת אימייל לא תקינה").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(5, "נא לכתוב הודעה").max(2000),
});

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const subject = encodeURIComponent(`פנייה מאתר Koreanglow — ${parsed.data.name}`);
    const body = encodeURIComponent(
      `שם: ${parsed.data.name}\nאימייל: ${parsed.data.email}\nטלפון: ${parsed.data.phone || "-"}\n\n${parsed.data.message}`
    );
    window.location.href = `mailto:${BUSINESS.email}?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setSubmitting(false);
      toast.success("תודה! נחזור אליך בתוך 24 שעות עבודה.");
      setForm({ name: "", email: "", phone: "", message: "" });
    }, 500);
  };

  return (
    <PolicyLayout
      title="צור קשר | Korean Glow IL"
      description="צרי קשר עם Korean Glow IL — כתובת, טלפון, אימייל ושעות פעילות. אנו מתחייבים להגיב לכל פנייה תוך 24 שעות עבודה."
      canonical="https://www.korean-glow-il.shop/contact"
    >
      <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-900">צור קשר</h1>
      <p className="text-lg text-slate-600 leading-relaxed mb-10">
        אנחנו כאן בשבילך. לכל שאלה על המוצרים, ההזמנה או המשלוח — נשמח לעמוד לרשותך.
        <strong className="block mt-2 text-slate-900">אנו מתחייבים להגיב לכל פנייה בתוך 24 שעות עבודה.</strong>
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <div className="bg-pink-50/60 border border-pink-100 rounded-2xl p-5 flex items-start gap-3">
          <MapPin className="text-pink-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <div className="font-bold text-slate-900 mb-1">כתובת</div>
            <div className="text-slate-600 text-sm">{BUSINESS.address}</div>
          </div>
        </div>
        <div className="bg-pink-50/60 border border-pink-100 rounded-2xl p-5 flex items-start gap-3">
          <Phone className="text-pink-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <div className="font-bold text-slate-900 mb-1">טלפון</div>
            <a href={`tel:${BUSINESS.phoneTel}`} className="text-slate-600 text-sm hover:text-pink-600">{BUSINESS.phone}</a>
          </div>
        </div>
        <div className="bg-pink-50/60 border border-pink-100 rounded-2xl p-5 flex items-start gap-3">
          <Mail className="text-pink-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <div className="font-bold text-slate-900 mb-1">אימייל לתמיכה</div>
            <a href={`mailto:${BUSINESS.email}`} className="text-slate-600 text-sm hover:text-pink-600 break-all">{BUSINESS.email}</a>
          </div>
        </div>
        <div className="bg-pink-50/60 border border-pink-100 rounded-2xl p-5 flex items-start gap-3">
          <Clock className="text-pink-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <div className="font-bold text-slate-900 mb-1">שעות פעילות</div>
            <div className="text-slate-600 text-sm">{BUSINESS.hours}</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-sm">
        <h2 className="text-2xl font-black mb-6 text-slate-900">שלחי לנו הודעה</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name" className="mb-2 block">שם מלא *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} required />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="mb-2 block">אימייל *</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} required />
            </div>
            <div>
              <Label htmlFor="phone" className="mb-2 block">טלפון</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} />
            </div>
          </div>
          <div>
            <Label htmlFor="message" className="mb-2 block">הודעה *</Label>
            <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} rows={6} required />
          </div>
          <Button type="submit" disabled={submitting} className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-8 py-6 text-base font-bold">
            {submitting ? "שולח..." : "שלחי הודעה"}
          </Button>
        </form>
      </div>
    </PolicyLayout>
  );
};

export default Contact;