import { useState } from "react";
import { Sparkles, Loader2, TrendingUp, ShoppingBag, Users, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/marketing-advisor`;

type Tip = {
  title: string;
  rationale: string;
  action: string;
  priority: "high" | "medium" | "low";
};

type AdvisorResponse = {
  data: {
    sales_30d: {
      orders: number;
      revenue_ils: number;
      top_products: { title: string; units: number; revenue: number }[];
    };
    leads: { total: number; last30: number; last7: number };
    lead_to_order_conversion_pct: string;
  };
  analysis: { headline: string; tips: Tip[] };
  generated_at: string;
};

const priorityColor: Record<Tip["priority"], string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const priorityLabel: Record<Tip["priority"], string> = {
  high: "עדיפות גבוהה",
  medium: "עדיפות בינונית",
  low: "עדיפות נמוכה",
};

export const MarketingAdvisor = ({ adminPassword }: { adminPassword: string }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdvisorResponse | null>(null);
  const { toast } = useToast();

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setResult(json);
    } catch (e) {
      toast({
        title: "ניתוח נכשל",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-0 overflow-hidden border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-l from-slate-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              Marketing Advisor
              <Badge variant="secondary" className="text-[10px] font-medium">AI</Badge>
            </h2>
            <p className="text-xs text-slate-500">
              ניתוח 30 ימים אחרונים: מכירות מול לידים, ו-3 המלצות פעולה
            </p>
          </div>
        </div>
        <Button size="sm" onClick={run} disabled={loading}>
          {loading ? (
            <Loader2 className="animate-spin ml-2" size={14} />
          ) : result ? (
            <RefreshCw className="ml-2" size={14} />
          ) : (
            <Sparkles className="ml-2" size={14} />
          )}
          {loading ? "מנתח..." : result ? "ניתוח מחדש" : "הפעלת ניתוח"}
        </Button>
      </div>

      {!result && !loading && (
        <div className="px-5 py-10 text-center text-sm text-slate-500">
          לחצי על "הפעלת ניתוח" כדי לקבל תובנות שיווק מבוססות נתונים מ-Shopify ולידים.
        </div>
      )}

      {loading && !result && (
        <div className="px-5 py-10 text-center text-sm text-slate-500">
          <Loader2 className="inline animate-spin ml-2" size={16} />
          שולף נתוני מכירות ומריץ ניתוח AI...
        </div>
      )}

      {result && (
        <div className="p-5 space-y-5">
          {/* Metrics row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric
              icon={<ShoppingBag size={14} />}
              label="הזמנות (30 ימים)"
              value={result.data.sales_30d.orders.toString()}
            />
            <Metric
              icon={<TrendingUp size={14} />}
              label="הכנסות (₪)"
              value={result.data.sales_30d.revenue_ils.toLocaleString("he-IL")}
            />
            <Metric
              icon={<Users size={14} />}
              label="לידים חדשים"
              value={result.data.leads.last30.toString()}
            />
            <Metric
              icon={<TrendingUp size={14} />}
              label="המרה ליד→הזמנה"
              value={
                result.data.lead_to_order_conversion_pct === "n/a"
                  ? "—"
                  : `${result.data.lead_to_order_conversion_pct}%`
              }
            />
          </div>

          {/* Top products */}
          {result.data.sales_30d.top_products.length > 0 && (
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-xs font-semibold text-slate-600 mb-2">המוצרים הנמכרים ביותר</p>
              <ul className="space-y-1.5 text-sm">
                {result.data.sales_30d.top_products.map((p, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span className="text-slate-800 truncate">
                      <span className="text-slate-400 font-mono ml-2">{i + 1}.</span>
                      {p.title}
                    </span>
                    <span className="text-slate-500 whitespace-nowrap text-xs">
                      {p.units} יח׳ · ₪{p.revenue.toLocaleString("he-IL")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI analysis */}
          {result.analysis.headline && (
            <div className="rounded-lg bg-slate-900 text-white p-4">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                AI Headline
              </p>
              <p className="text-sm font-medium leading-relaxed">{result.analysis.headline}</p>
            </div>
          )}

          <div className="space-y-3">
            {result.analysis.tips.map((tip, i) => (
              <div
                key={i}
                className="border border-slate-200 rounded-lg p-4 bg-white hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold">
                      {i + 1}
                    </span>
                    {tip.title}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border ${priorityColor[tip.priority]}`}
                  >
                    {priorityLabel[tip.priority]}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  <span className="font-semibold text-slate-700">ניתוח: </span>
                  {tip.rationale}
                </p>
                <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 rounded p-2 border border-slate-100">
                  <span className="font-semibold">פעולה: </span>
                  {tip.action}
                </p>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-400 text-left" dir="ltr">
            Generated {new Date(result.generated_at).toLocaleString("he-IL")}
          </p>
        </div>
      )}
    </Card>
  );
};

const Metric = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="rounded-lg border border-slate-100 p-3 bg-white">
    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
      {icon}
      <span className="text-[11px] font-medium">{label}</span>
    </div>
    <p className="text-lg font-black text-slate-900">{value}</p>
  </div>
);