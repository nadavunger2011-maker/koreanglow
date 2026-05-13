import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Lock,
  LogOut,
  ShieldCheck,
  Users,
  Mail,
  TrendingUp,
  Search,
  StickyNote,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MarketingAdvisor } from "@/components/admin/MarketingAdvisor";
import { BlogManager } from "@/components/admin/BlogManager";
import { BlogAnalytics } from "@/components/admin/BlogAnalytics";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

const ALLOWED_EMAIL = "nadavunger2011@gmail.com";
const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data`;

type Lead = {
  id: string;
  name: string | null;
  email: string;
  source_page: string | null;
  created_at: string;
};

type Note = {
  id: string;
  lead_id: string;
  note: string;
  created_at: string;
};

const formatDate = (s: string) =>
  new Date(s).toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const AdminDashboard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "CRM Dashboard | Koreanglow";
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setAuthChecked(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isAllowed =
    !!session?.user?.email && session.user.email.toLowerCase() === ALLOWED_EMAIL;

  const apiFetch = async (init: RequestInit = {}) => {
    const token = session?.access_token;
    return fetch(FUNCTION_URL, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch({ method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setNotes(data.notes || []);
    } catch (e) {
      toast({
        title: "שגיאה בטעינה",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAllowed) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllowed]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (email.trim().toLowerCase() !== ALLOWED_EMAIL) {
      setError("כתובת המייל אינה מורשית לגשת לדשבורד");
      return;
    }
    setAuthLoading(true);
    try {
      if (mode === "signup") {
        const { error: e1 } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin-dashboard` },
        });
        if (e1) throw e1;
        // Try immediate sign-in (auto-confirm is enabled)
        const { error: e2 } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (e2) throw e2;
      } else {
        const { error: e1 } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (e1) throw e1;
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPassword("");
  };

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.email.toLowerCase().includes(q) ||
        (l.name || "").toLowerCase().includes(q) ||
        (l.source_page || "").toLowerCase().includes(q),
    );
  }, [leads, search]);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || null;
  const selectedLeadNotes = notes.filter((n) => n.lead_id === selectedLeadId);

  const stats = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const last7 = leads.filter((l) => now - new Date(l.created_at).getTime() < 7 * day).length;
    const today = leads.filter((l) => now - new Date(l.created_at).getTime() < day).length;
    return { total: leads.length, last7, today, notes: notes.length };
  }, [leads, notes]);

  const handleAddNote = async () => {
    if (!selectedLeadId || !newNote.trim()) return;
    setSavingNote(true);
    try {
      const res = await apiFetch({
        method: "POST",
        body: JSON.stringify({ lead_id: selectedLeadId, note: newNote.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setNotes((prev) => [data.note, ...prev]);
      setNewNote("");
      toast({ title: "הערה נוספה" });
    } catch (e) {
      toast({
        title: "שגיאה בהוספת הערה",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await apiFetch({ method: "DELETE", body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      toast({
        title: "שגיאה במחיקה",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={24} />
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4"
        dir="rtl"
      >
        <Card className="w-full max-w-md p-8 shadow-xl border-slate-200">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-4">
              <Lock size={28} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              {mode === "signup" ? "הרשמה ל-CRM" : "כניסה ל-CRM"}
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              {session && !isAllowed
                ? "המשתמש המחובר אינו מורשה"
                : "גישה למשתמש מורשה בלבד"}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                dir="ltr"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                required
                minLength={6}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading && <Loader2 className="animate-spin ml-2" size={14} />}
              {mode === "signup" ? "יצירת חשבון" : "כניסה"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError("");
              }}
              className="w-full text-xs text-slate-500 hover:text-slate-900 transition"
            >
              {mode === "signin"
                ? "אין לך חשבון? הירשמי כאן"
                : "יש לך חשבון? התחברי"}
            </button>
            {session && !isAllowed && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => supabase.auth.signOut()}
              >
                התנתקות
              </Button>
            )}
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h1 className="text-lg font-black leading-tight">Koreanglow CRM</h1>
              <p className="text-xs text-slate-500">ניהול לידים ותובנות לקוחות</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
              <RefreshCw className={`ml-2 ${loading ? "animate-spin" : ""}`} size={14} />
              רענון
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="ml-2" size={14} />
              יציאה
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Users size={18} />} label="סה״כ לידים" value={stats.total} />
          <StatCard icon={<TrendingUp size={18} />} label="7 ימים אחרונים" value={stats.last7} />
          <StatCard icon={<Mail size={18} />} label="היום" value={stats.today} />
          <StatCard icon={<StickyNote size={18} />} label="הערות" value={stats.notes} />
        </div>

        <MarketingAdvisor accessToken={session!.access_token} />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Leads table */}
          <Card className="lg:col-span-2 p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-base">לידים</h2>
                <p className="text-xs text-slate-500">לחצי על ליד כדי להוסיף או לראות הערות</p>
              </div>
              <div className="relative w-56">
                <Search
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <Input
                  placeholder="חיפוש..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-9 h-9"
                />
              </div>
            </div>
            <div className="max-h-[560px] overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0">
                  <TableRow>
                    <TableHead className="text-right">שם</TableHead>
                    <TableHead className="text-right">אימייל</TableHead>
                    <TableHead className="text-right">מקור</TableHead>
                    <TableHead className="text-right">תאריך</TableHead>
                    <TableHead className="text-right">הערות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && leads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                        <Loader2 className="inline animate-spin ml-2" size={16} />
                        טוען...
                      </TableCell>
                    </TableRow>
                  ) : filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                        אין לידים להצגה
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => {
                      const noteCount = notes.filter((n) => n.lead_id === lead.id).length;
                      const isSelected = lead.id === selectedLeadId;
                      return (
                        <TableRow
                          key={lead.id}
                          onClick={() => setSelectedLeadId(lead.id)}
                          className={`cursor-pointer ${isSelected ? "bg-slate-100" : ""}`}
                        >
                          <TableCell className="font-medium">
                            {lead.name || <span className="text-slate-400">—</span>}
                          </TableCell>
                          <TableCell className="text-slate-700" dir="ltr">
                            {lead.email}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500" dir="ltr">
                            {lead.source_page || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                            {formatDate(lead.created_at)}
                          </TableCell>
                          <TableCell>
                            {noteCount > 0 ? (
                              <Badge variant="secondary">{noteCount}</Badge>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Customer Insights */}
          <Card className="p-5 h-fit lg:sticky lg:top-24">
            <div className="flex items-center gap-2 mb-1">
              <StickyNote size={16} className="text-slate-700" />
              <h2 className="font-bold text-base">Customer Insights</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">הערות פנימיות על הליד הנבחר</p>

            {!selectedLead ? (
              <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-lg">
                <p className="text-sm text-slate-500">בחרי ליד מהטבלה כדי להוסיף הערות</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <p className="font-semibold text-sm">
                    {selectedLead.name || "ללא שם"}
                  </p>
                  <p className="text-xs text-slate-500" dir="ltr">
                    {selectedLead.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder="כתבי הערה..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || savingNote}
                    className="w-full"
                    size="sm"
                  >
                    {savingNote && <Loader2 className="animate-spin ml-2" size={14} />}
                    הוספת הערה
                  </Button>
                </div>

                <div className="space-y-2 max-h-80 overflow-auto">
                  {selectedLeadNotes.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">אין הערות עדיין</p>
                  ) : (
                    selectedLeadNotes.map((n) => (
                      <div
                        key={n.id}
                        className="group bg-white border border-slate-200 rounded-lg p-3 text-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-slate-800 whitespace-pre-wrap flex-1">{n.note}</p>
                          <button
                            onClick={() => handleDeleteNote(n.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-destructive transition"
                            aria-label="מחיקה"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2">
                          {formatDate(n.created_at)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        <BlogManager accessToken={session!.access_token} />
        <BlogAnalytics accessToken={session!.access_token} />
      </main>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) => (
  <Card className="p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-slate-400">{icon}</span>
    </div>
    <p className="text-2xl font-black text-slate-900">{value}</p>
  </Card>
);

export default AdminDashboard;