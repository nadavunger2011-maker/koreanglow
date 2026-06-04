import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Filter,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const FN_SALES = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sales-analytics`;
const FN_GSC = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gsc-analytics`;
const FN_CHAT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dashboard-chat`;

type RangeKey = "7d" | "30d" | "90d";
const RANGE_DAYS: Record<RangeKey, number> = { "7d": 7, "30d": 30, "90d": 90 };

type SalesData = {
  currency: string;
  current: { revenue: number; orders: number; customers: number; aov: number };
  previous: { revenue: number; orders: number; customers: number; aov: number };
  series: Array<{ date: string; revenue: number; orders: number }>;
  topProducts: Array<{
    id: string;
    title: string;
    units: number;
    revenue: number;
    orders: number;
  }>;
  heatmap: number[][];
};

type GscRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type GscData = {
  site: string | null;
  totals: { clicks: number; impressions: number; ctr: number; position: number } | null;
  queries: GscRow[];
  pages: GscRow[];
  error?: string;
};

type GscSite = { siteUrl: string; permissionLevel: string };

type ChatMsg = { role: "user" | "assistant"; content: string };

const fmt = (n: number, currency = "ILS") =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n || 0);

const fmtNum = (n: number) =>
  new Intl.NumberFormat("he-IL", { maximumFractionDigits: 1 }).format(n || 0);

const delta = (cur: number, prev: number) => {
  if (!prev) return cur ? 100 : 0;
  return ((cur - prev) / prev) * 100;
};

export const SalesDashboard = ({ accessToken }: { accessToken: string }) => {
  const [range, setRange] = useState<RangeKey>("30d");
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; title: string } | null>(
    null,
  );
  const [productSearch, setProductSearch] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const { toast } = useToast();
  const [gscSite, setGscSite] = useState<string>(
    () => localStorage.getItem("kg_gsc_site") || "https://korean-glow-il.shop/",
  );

  useEffect(() => {
    localStorage.setItem("kg_gsc_site", gscSite);
  }, [gscSite]);

  const { since, until } = useMemo(() => {
    const u = new Date();
    const s = new Date(u.getTime() - RANGE_DAYS[range] * 86400000);
    return { since: s.toISOString(), until: u.toISOString() };
  }, [range]);

  const sales = useQuery<SalesData>({
    queryKey: ["sales", since, until, selectedProduct?.id || "all"],
    queryFn: async () => {
      const r = await fetch(FN_SALES, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ since, until, productId: selectedProduct?.id }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      return j;
    },
    staleTime: 5 * 60 * 1000,
  });

  const gscSites = useQuery<{ sites: GscSite[] }>({
    queryKey: ["gsc-sites"],
    queryFn: async () => {
      const r = await fetch(FN_GSC, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ action: "list-sites" }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      return j;
    },
    staleTime: 60 * 60 * 1000,
  });

  const gsc = useQuery<GscData>({
    queryKey: ["gsc", since, until, gscSite],
    queryFn: async () => {
      const r = await fetch(FN_GSC, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ since, until, siteUrl: gscSite }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      return j;
    },
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (sales.error)
      toast({
        title: "שגיאה בטעינת מכירות",
        description: (sales.error as Error).message,
        variant: "destructive",
      });
  }, [sales.error, toast]);

  const refetchAll = () => {
    sales.refetch();
    gsc.refetch();
  };

  const cur = sales.data?.current;
  const prev = sales.data?.previous;
  const currency = sales.data?.currency || "ILS";

  const filteredProducts = useMemo(() => {
    const list = sales.data?.topProducts || [];
    const q = productSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => p.title.toLowerCase().includes(q));
  }, [sales.data, productSearch]);

  return (
    <div className="space-y-5">
      <Card className="p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter size={14} />
          טווח
        </div>
        <div className="flex gap-1">
          {(["7d", "30d", "90d"] as RangeKey[]).map((r) => (
            <Button
              key={r}
              size="sm"
              variant={range === r ? "default" : "outline"}
              onClick={() => setRange(r)}
            >
              {r === "7d" ? "7 ימים" : r === "30d" ? "30 יום" : "90 יום"}
            </Button>
          ))}
        </div>

        {selectedProduct && (
          <Badge variant="secondary" className="gap-1.5 py-1.5 pl-1 pr-2.5">
            <Package size={12} />
            <span className="text-xs">{selectedProduct.title}</span>
            <button
              onClick={() => setSelectedProduct(null)}
              className="ml-1 hover:bg-slate-300 rounded p-0.5"
              aria-label="נקה סינון"
            >
              <X size={12} />
            </button>
          </Badge>
        )}

        <div className="flex-1" />

        <Button size="sm" variant="outline" onClick={refetchAll} disabled={sales.isFetching}>
          <RefreshCw className={cn("ml-2", sales.isFetching && "animate-spin")} size={14} />
          רענון
        </Button>
        <Button size="sm" onClick={() => setChatOpen(true)} className="gap-2">
          <Sparkles size={14} />
          שאל את ה-AI
        </Button>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI
          icon={<DollarSign size={16} />}
          label="הכנסות"
          value={fmt(cur?.revenue || 0, currency)}
          delta={delta(cur?.revenue || 0, prev?.revenue || 0)}
          loading={sales.isLoading}
        />
        <KPI
          icon={<ShoppingBag size={16} />}
          label="הזמנות"
          value={fmtNum(cur?.orders || 0)}
          delta={delta(cur?.orders || 0, prev?.orders || 0)}
          loading={sales.isLoading}
        />
        <KPI
          icon={<TrendingUp size={16} />}
          label="AOV"
          value={fmt(cur?.aov || 0, currency)}
          delta={delta(cur?.aov || 0, prev?.aov || 0)}
          loading={sales.isLoading}
        />
        <KPI
          icon={<Users size={16} />}
          label="לקוחות"
          value={fmtNum(cur?.customers || 0)}
          delta={delta(cur?.customers || 0, prev?.customers || 0)}
          loading={sales.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ConnectorPrompt
          icon={<Target size={14} />}
          label="עלות פרסום / ROAS / CAC"
          desc="חבר Google Ads ו-Meta Ads כדי לראות"
        />
        <ConnectorPrompt
          icon={<TrendingUp size={14} />}
          label="זמן שהייה ו-Bounce Rate"
          desc="חבר Google Analytics 4"
        />
        <ConnectorPrompt
          icon={<Users size={14} />}
          label="מקורות תנועה (Funnel)"
          desc="חבר Google Analytics 4"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base">מכירות לאורך זמן</h3>
              <p className="text-xs text-slate-500">
                {selectedProduct ? `מסונן לפי: ${selectedProduct.title}` : "כל המוצרים"}
              </p>
            </div>
          </div>
          <div className="h-72">
            {sales.isLoading ? (
              <Loading />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sales.data?.series || []}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#rev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-base mb-1">הזמנות לפי יום</h3>
          <p className="text-xs text-slate-500 mb-4">כמות הזמנות יומית</p>
          <div className="h-72">
            {sales.isLoading ? (
              <Loading />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sales.data?.series || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base">מוצרים מובילים</h3>
              <p className="text-xs text-slate-500">לחץ על שורה לסנן את כל הדשבורד</p>
            </div>
            <div className="relative w-56">
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <Input
                placeholder="חיפוש מוצר..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pr-9 h-9"
              />
            </div>
          </div>
          <div className="max-h-[420px] overflow-auto">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0">
                <TableRow>
                  <TableHead className="text-right">מוצר</TableHead>
                  <TableHead className="text-right">יחידות</TableHead>
                  <TableHead className="text-right">הזמנות</TableHead>
                  <TableHead className="text-right">הכנסה</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                      <Loader2 className="inline animate-spin ml-2" size={16} />
                      טוען...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-slate-400">
                      אין נתוני מוצרים בטווח זה
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((p) => {
                    const active = selectedProduct?.id === p.id;
                    return (
                      <TableRow
                        key={p.id}
                        onClick={() =>
                          setSelectedProduct(active ? null : { id: p.id, title: p.title })
                        }
                        className={cn("cursor-pointer", active && "bg-primary/10")}
                      >
                        <TableCell className="font-medium">{p.title}</TableCell>
                        <TableCell className="tabular-nums">{p.units}</TableCell>
                        <TableCell className="tabular-nums">{p.orders}</TableCell>
                        <TableCell className="tabular-nums font-semibold">
                          {fmt(p.revenue, currency)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-base mb-1">שעות מובילות</h3>
          <p className="text-xs text-slate-500 mb-4">מתי הלקוחות קונים</p>
          {sales.isLoading ? <Loading /> : <Heatmap data={sales.data?.heatmap || []} />}
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base">SEO – Search Console</h3>
            <p className="text-xs text-slate-500">{gsc.data?.site || "לא נמצא אתר מאומת"}</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={gscSite} onValueChange={setGscSite}>
              <SelectTrigger className="h-9 w-[260px] text-xs">
                <SelectValue placeholder="בחר נכס Search Console" />
              </SelectTrigger>
              <SelectContent>
                {(gscSites.data?.sites || []).map((s) => (
                  <SelectItem key={s.siteUrl} value={s.siteUrl} className="text-xs">
                    {s.siteUrl}
                  </SelectItem>
                ))}
                {!gscSites.data?.sites?.some((s) => s.siteUrl === gscSite) && (
                  <SelectItem value={gscSite} className="text-xs">
                    {gscSite}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {gsc.data?.totals && (
            <div className="hidden sm:flex gap-4 text-xs">
              <span>
                <span className="text-slate-500">קליקים: </span>
                <span className="font-bold tabular-nums">{fmtNum(gsc.data.totals.clicks)}</span>
              </span>
              <span>
                <span className="text-slate-500">חשיפות: </span>
                <span className="font-bold tabular-nums">
                  {fmtNum(gsc.data.totals.impressions)}
                </span>
              </span>
              <span>
                <span className="text-slate-500">CTR: </span>
                <span className="font-bold tabular-nums">
                  {(gsc.data.totals.ctr * 100).toFixed(1)}%
                </span>
              </span>
              <span>
                <span className="text-slate-500">מיקום: </span>
                <span className="font-bold tabular-nums">
                  {gsc.data.totals.position.toFixed(1)}
                </span>
              </span>
            </div>
            )}
          </div>
        </div>

        {gsc.isLoading ? (
          <Loading />
        ) : gsc.error ? (
          <p className="text-xs text-destructive">שגיאת SEO: {(gsc.error as Error).message}</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <SeoTable title="מילות חיפוש מובילות" rows={gsc.data?.queries || []} />
            <SeoTable title="עמודי נחיתה מובילים" rows={gsc.data?.pages || []} />
          </div>
        )}
      </Card>

      <AIChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        accessToken={accessToken}
        context={{
          range,
          selectedProduct,
          sales: sales.data,
          gsc: gsc.data,
        }}
      />
    </div>
  );
};

const Loading = () => (
  <div className="h-full flex items-center justify-center text-slate-400">
    <Loader2 className="animate-spin" size={20} />
  </div>
);

const KPI = ({
  icon,
  label,
  value,
  delta: d,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: number;
  loading?: boolean;
}) => {
  const up = d >= 0;
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span className="text-slate-400">{icon}</span>
      </div>
      {loading ? (
        <div className="h-8 flex items-center">
          <Loader2 className="animate-spin text-slate-300" size={18} />
        </div>
      ) : (
        <>
          <p className="text-2xl font-black text-slate-900 tabular-nums">{value}</p>
          <p
            className={cn(
              "text-xs font-semibold mt-1 flex items-center gap-1",
              up ? "text-emerald-600" : "text-rose-600",
            )}
          >
            {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(d).toFixed(1)}% מהתקופה הקודמת
          </p>
        </>
      )}
    </Card>
  );
};

const ConnectorPrompt = ({
  icon,
  label,
  desc,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
}) => (
  <Card className="p-4 border-dashed bg-slate-50/50">
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
      <span className="text-slate-400">{icon}</span>
      {label}
    </div>
    <p className="text-[11px] text-slate-500">{desc}</p>
  </Card>
);

const Heatmap = ({ data }: { data: number[][] }) => {
  const days = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const max = Math.max(1, ...data.flat());
  return (
    <div className="space-y-1" dir="ltr">
      {data.map((row, di) => (
        <div key={di} className="flex items-center gap-1">
          <span className="text-[10px] text-slate-400 w-3">{days[di]}</span>
          {row.map((v, hi) => {
            const op = v / max;
            return (
              <div
                key={hi}
                title={`יום ${days[di]} שעה ${hi}: ${v}`}
                className="flex-1 h-4 rounded-sm"
                style={{
                  backgroundColor:
                    v === 0 ? "hsl(var(--muted))" : `hsl(var(--primary) / ${0.15 + op * 0.85})`,
                }}
              />
            );
          })}
        </div>
      ))}
      <div className="flex justify-between text-[9px] text-slate-400 pt-1 pl-4">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>23</span>
      </div>
    </div>
  );
};

const SeoTable = ({ title, rows }: { title: string; rows: GscRow[] }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{title}</p>
    <div className="max-h-64 overflow-auto border rounded-lg">
      <Table>
        <TableHeader className="bg-slate-50 sticky top-0">
          <TableRow>
            <TableHead className="text-right text-xs">ביטוי</TableHead>
            <TableHead className="text-right text-xs">קליקים</TableHead>
            <TableHead className="text-right text-xs">חשיפות</TableHead>
            <TableHead className="text-right text-xs">CTR</TableHead>
            <TableHead className="text-right text-xs">#</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                אין נתונים
              </TableCell>
            </TableRow>
          ) : (
            rows.slice(0, 15).map((r, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs max-w-[200px] truncate" dir="ltr">
                  {r.keys[0]}
                </TableCell>
                <TableCell className="text-xs tabular-nums">{r.clicks}</TableCell>
                <TableCell className="text-xs tabular-nums">{r.impressions}</TableCell>
                <TableCell className="text-xs tabular-nums">
                  {(r.ctr * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="text-xs tabular-nums">{r.position.toFixed(1)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  </div>
);

const SUGGESTED = [
  "מה התובנה הכי חשובה מהשבוע האחרון?",
  "איזה מוצר הכי רווחי ולמה?",
  "מה לשפר בעמודי הנחיתה לפי ה-SEO?",
  "תן לי 3 פעולות לשיפור ההכנסות מחר",
];

const AIChatDrawer = ({
  open,
  onClose,
  accessToken,
  context,
}: {
  open: boolean;
  onClose: () => void;
  accessToken: string;
  context: unknown;
}) => {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMsg = { role: "user", content: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    let acc = "";
    const upsert = (chunk: string) => {
      acc += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: acc } : m,
          );
        }
        return [...prev, { role: "assistant", content: acc }];
      });
    };

    try {
      const resp = await fetch(FN_CHAT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context,
        }),
      });

      if (!resp.ok || !resp.body) {
        const j = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }));
        throw new Error(j.error || `HTTP ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || !line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      toast({
        title: "שגיאה ב-AI",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" dir="rtl">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <h3 className="font-bold">יועץ AI</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                שאל אותי על הנתונים שמוצגים בדשבורד:
              </p>
              <div className="grid gap-2">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-right text-xs bg-slate-50 hover:bg-slate-100 border rounded-lg px-3 py-2 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                m.role === "user"
                  ? "bg-primary text-primary-foreground ml-8"
                  : "bg-slate-100 mr-8",
              )}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-headings:my-2">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
          ))}

          {loading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="bg-slate-100 rounded-lg px-3 py-2 text-sm mr-8 inline-flex items-center gap-2">
              <Loader2 className="animate-spin" size={14} />
              חושב...
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="p-3 border-t flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="שאל שאלה..."
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            שלח
          </Button>
        </form>
      </div>
    </div>
  );
};
