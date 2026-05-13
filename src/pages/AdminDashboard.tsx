import { useEffect, useState, type FormEvent } from "react";
import { Lock, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

// Simple gate password. Change this value to set your own.
// For production, replace with proper auth (Lovable Cloud / Supabase).
const ADMIN_PASSWORD = "koreanglow2026";
const STORAGE_KEY = "kg_admin_authed";

const AdminDashboard = () => {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Admin Dashboard | Koreanglow";
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setAuthed(true);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setAuthed(true);
      setError("");
    } else {
      setError("סיסמה שגויה");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
    setPassword("");
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-blue-50 p-4" dir="rtl">
        <Card className="w-full max-w-md p-8 shadow-xl">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-pink-500 text-white flex items-center justify-center mb-4">
              <Lock size={28} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">כניסה לדאשבורד</h1>
            <p className="text-sm text-slate-500 mt-2">הזיני סיסמה כדי להמשיך</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                dir="ltr"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">כניסה</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-pink-500" />
            <h1 className="text-xl font-black">Admin Dashboard</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="ml-2" size={16} />
            יציאה
          </Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-2">הזמנות</h2>
            <p className="text-slate-500 text-sm">בקרוב — סקירה וניהול הזמנות.</p>
          </Card>
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-2">מוצרים</h2>
            <p className="text-slate-500 text-sm">בקרוב — עריכת מלאי וחבילות.</p>
          </Card>
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-2">לקוחות</h2>
            <p className="text-slate-500 text-sm">בקרוב — רשימת לקוחות וסטטיסטיקות.</p>
          </Card>
        </div>
        <Card className="mt-6 p-6">
          <h2 className="font-bold text-lg mb-2">תשתית מוכנה</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            זוהי שכבת בסיס מוגנת בסיסמה. כשתרצה אימות מאובטח באמת (משתמשים, תפקידים, RLS) נחבר את Lovable Cloud ונחליף את שער הסיסמה בהתחברות אמיתית.
          </p>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;