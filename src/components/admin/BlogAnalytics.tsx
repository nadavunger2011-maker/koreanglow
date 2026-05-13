import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart3, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data?resource=analytics`;

type Stat = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  views_total: number;
  views_7d: number;
  views_30d: number;
};

type Range = "7d" | "30d" | "all";

export const BlogAnalytics = ({ accessToken }: { accessToken: string }) => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("30d");
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    fetch(FUNCTION_URL, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => r.json())
      .then((d) => setStats(d.stats || []))
      .catch((e) => toast({ title: "שגיאה", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [accessToken, toast]);

  const key: keyof Stat = range === "7d" ? "views_7d" : range === "30d" ? "views_30d" : "views_total";
  const sorted = [...stats].sort((a, b) => (b[key] as number) - (a[key] as number));
  const max = Math.max(1, ...sorted.map((s) => s[key] as number));
  const top5 = sorted.slice(0, 5);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} />
          <h2 className="font-bold text-base">ביצועי מאמרים</h2>
        </div>
        <div className="flex gap-1">
          {(["7d", "30d", "all"] as Range[]).map((r) => (
            <Button key={r} size="sm" variant={range === r ? "default" : "outline"} onClick={() => setRange(r)}>
              {r === "7d" ? "7 ימים" : r === "30d" ? "30 ימים" : "הכל"}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="inline animate-spin" size={20} /></div>
      ) : stats.length === 0 ? (
        <p className="text-center py-12 text-slate-400 text-sm">אין נתונים עדיין</p>
      ) : (
        <>
          <div className="space-y-2 mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">חמשת המובילים</p>
            {top5.map((s) => (
              <div key={s.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium truncate">{s.title}</span>
                  <span className="text-muted-foreground tabular-nums">{s[key] as number}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${((s[key] as number) / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">כותרת</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">7 ימים</TableHead>
                <TableHead className="text-right">30 ימים</TableHead>
                <TableHead className="text-right"><Eye size={12} className="inline" /> סה״כ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell><Badge variant={s.published ? "default" : "secondary"}>{s.published ? "פורסם" : "טיוטה"}</Badge></TableCell>
                  <TableCell className="tabular-nums">{s.views_7d}</TableCell>
                  <TableCell className="tabular-nums">{s.views_30d}</TableCell>
                  <TableCell className="tabular-nums font-bold">{s.views_total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </Card>
  );
};