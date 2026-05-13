import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Trash2,
  Loader2,
  Pencil,
  ArrowUp,
  ArrowDown,
  Type,
  Image as ImageIcon,
  Quote,
  ShoppingBag,
  Heading2,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data?resource=posts`;

type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "image"; url: string; alt?: string; caption?: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "product"; handle: string };

type Post = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content_blocks: Block[];
  cover_image_url: string;
  cover_image_alt: string;
  category: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  keywords: string[];
  author_name: string;
  read_minutes: number | null;
  published: boolean;
};

const empty: Post = {
  slug: "",
  title: "",
  excerpt: "",
  content_blocks: [],
  cover_image_url: "",
  cover_image_alt: "",
  category: "",
  tags: [],
  meta_title: "",
  meta_description: "",
  keywords: [],
  author_name: "Koreanglow",
  read_minutes: null,
  published: false,
};

export const BlogManager = ({ accessToken }: { accessToken: string }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const api = (init: RequestInit = {}) =>
    fetch(FUNCTION_URL, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(init.headers || {}),
      },
    });

  const load = async () => {
    setLoading(true);
    try {
      const r = await api({ method: "GET" });
      const d = await r.json();
      setPosts(d.posts || []);
    } catch (e) {
      toast({ title: "שגיאה בטעינה", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.title || !editing.slug) {
      toast({ title: "כותרת ו-slug חובה", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const r = await api({ method: "POST", body: JSON.stringify(editing) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      toast({ title: "נשמר" });
      setEditing(null);
      load();
    } catch (e) {
      toast({ title: "שגיאה", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("למחוק את המאמר?")) return;
    await api({ method: "DELETE", body: JSON.stringify({ id }) });
    load();
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-base">ניהול בלוג</h2>
          <p className="text-xs text-slate-500">צרי, ערכי ופרסמי מאמרים</p>
        </div>
        <Button size="sm" onClick={() => setEditing({ ...empty })}>
          <Plus size={14} className="ml-1" />
          מאמר חדש
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">כותרת</TableHead>
            <TableHead className="text-right">Slug</TableHead>
            <TableHead className="text-right">קטגוריה</TableHead>
            <TableHead className="text-right">סטטוס</TableHead>
            <TableHead className="text-right">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && posts.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="inline animate-spin" size={16} /></TableCell></TableRow>
          ) : posts.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">אין מאמרים עדיין</TableCell></TableRow>
          ) : posts.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.title}</TableCell>
              <TableCell className="text-xs text-slate-500" dir="ltr">{p.slug}</TableCell>
              <TableCell className="text-xs">{p.category || "—"}</TableCell>
              <TableCell>
                <Badge variant={p.published ? "default" : "secondary"}>{p.published ? "פורסם" : "טיוטה"}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setEditing({ ...empty, ...p, content_blocks: p.content_blocks || [], tags: p.tags || [], keywords: p.keywords || [] })}>
                    <Pencil size={14} />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => p.id && remove(p.id)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editing && <PostEditor post={editing} setPost={setEditing} onSave={save} saving={saving} />}
    </Card>
  );
};

const PostEditor = ({
  post,
  setPost,
  onSave,
  saving,
}: {
  post: Post;
  setPost: (p: Post | null) => void;
  onSave: () => void;
  saving: boolean;
}) => {
  const update = (patch: Partial<Post>) => setPost({ ...post, ...patch });
  const updateBlock = (i: number, b: Block) => {
    const next = [...post.content_blocks];
    next[i] = b;
    update({ content_blocks: next });
  };
  const removeBlock = (i: number) => update({ content_blocks: post.content_blocks.filter((_, idx) => idx !== i) });
  const moveBlock = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= post.content_blocks.length) return;
    const next = [...post.content_blocks];
    [next[i], next[j]] = [next[j], next[i]];
    update({ content_blocks: next });
  };
  const addBlock = (b: Block) => update({ content_blocks: [...post.content_blocks, b] });

  // SEO checklist
  const titleOk = post.title.length >= 30 && post.title.length <= 60;
  const descOk = (post.meta_description || post.excerpt).length >= 50 && (post.meta_description || post.excerpt).length <= 160;
  const altOk = !!post.cover_image_alt;
  const hasH2 = post.content_blocks.some((b) => b.type === "h2");
  const hasP = post.content_blocks.some((b) => b.type === "p");
  const kwOk = post.keywords.length > 0;

  return (
    <Dialog open onOpenChange={(o) => !o && setPost(null)}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader><DialogTitle>{post.id ? "עריכת מאמר" : "מאמר חדש"}</DialogTitle></DialogHeader>

        <div className="grid md:grid-cols-[1fr,260px] gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>כותרת</Label>
                <Input value={post.title} onChange={(e) => update({ title: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input dir="ltr" value={post.slug} onChange={(e) => update({ slug: e.target.value })} />
              </div>
            </div>

            <div>
              <Label>תקציר</Label>
              <Textarea rows={2} value={post.excerpt} onChange={(e) => update({ excerpt: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>תמונה ראשית (URL)</Label>
                <Input dir="ltr" value={post.cover_image_url} onChange={(e) => update({ cover_image_url: e.target.value })} />
              </div>
              <div>
                <Label>Alt לתמונה</Label>
                <Input value={post.cover_image_alt} onChange={(e) => update({ cover_image_alt: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>קטגוריה</Label>
                <Input value={post.category} onChange={(e) => update({ category: e.target.value })} />
              </div>
              <div>
                <Label>תגיות (פסיקים)</Label>
                <Input value={post.tags.join(", ")} onChange={(e) => update({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
              </div>
              <div>
                <Label>זמן קריאה (דק׳)</Label>
                <Input type="number" value={post.read_minutes ?? ""} onChange={(e) => update({ read_minutes: e.target.value ? Number(e.target.value) : null })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Meta title</Label>
                <Input value={post.meta_title} onChange={(e) => update({ meta_title: e.target.value })} />
              </div>
              <div>
                <Label>Meta description</Label>
                <Input value={post.meta_description} onChange={(e) => update({ meta_description: e.target.value })} />
              </div>
            </div>

            <div>
              <Label>מילות מפתח (פסיקים)</Label>
              <Input value={post.keywords.join(", ")} onChange={(e) => update({ keywords: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base">בלוקי תוכן</Label>
                <div className="flex flex-wrap gap-1">
                  <Button type="button" size="sm" variant="outline" onClick={() => addBlock({ type: "h2", text: "" })}><Heading2 size={12} className="ml-1" />כותרת</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => addBlock({ type: "p", text: "" })}><Type size={12} className="ml-1" />פסקה</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => addBlock({ type: "image", url: "", alt: "" })}><ImageIcon size={12} className="ml-1" />תמונה</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => addBlock({ type: "quote", text: "" })}><Quote size={12} className="ml-1" />ציטוט</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => addBlock({ type: "product", handle: "" })}><ShoppingBag size={12} className="ml-1" />מוצר</Button>
                </div>
              </div>

              <div className="space-y-2">
                {post.content_blocks.map((b, i) => (
                  <div key={i} className="border border-border/60 rounded-lg p-3 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground">{b.type}</span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => moveBlock(i, -1)}><ArrowUp size={12} /></Button>
                        <Button size="icon" variant="ghost" onClick={() => moveBlock(i, 1)}><ArrowDown size={12} /></Button>
                        <Button size="icon" variant="ghost" onClick={() => removeBlock(i)}><Trash2 size={12} className="text-destructive" /></Button>
                      </div>
                    </div>
                    {b.type === "p" || b.type === "h2" || b.type === "h3" ? (
                      <Textarea rows={b.type === "p" ? 3 : 1} value={b.text} onChange={(e) => updateBlock(i, { ...b, text: e.target.value })} />
                    ) : b.type === "image" ? (
                      <div className="space-y-2">
                        <Input dir="ltr" placeholder="URL" value={b.url} onChange={(e) => updateBlock(i, { ...b, url: e.target.value })} />
                        <Input placeholder="Alt" value={b.alt || ""} onChange={(e) => updateBlock(i, { ...b, alt: e.target.value })} />
                        <Input placeholder="כיתוב" value={b.caption || ""} onChange={(e) => updateBlock(i, { ...b, caption: e.target.value })} />
                      </div>
                    ) : b.type === "quote" ? (
                      <div className="space-y-2">
                        <Textarea rows={2} value={b.text} onChange={(e) => updateBlock(i, { ...b, text: e.target.value })} />
                        <Input placeholder="מקור" value={b.cite || ""} onChange={(e) => updateBlock(i, { ...b, cite: e.target.value })} />
                      </div>
                    ) : b.type === "product" ? (
                      <Input dir="ltr" placeholder="Shopify product handle" value={b.handle} onChange={(e) => updateBlock(i, { ...b, handle: e.target.value })} />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <Switch checked={post.published} onCheckedChange={(v) => update({ published: v })} />
                <Label>פרסם</Label>
              </div>
            </div>
          </div>

          <aside className="space-y-2 text-sm">
            <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-3">SEO Checklist</h3>
            <CheckRow ok={titleOk} label={`Title 30-60 (${post.title.length})`} />
            <CheckRow ok={descOk} label={`Description 50-160 (${(post.meta_description || post.excerpt).length})`} />
            <CheckRow ok={altOk} label="Alt לתמונה הראשית" />
            <CheckRow ok={hasH2} label="לפחות H2 אחד" />
            <CheckRow ok={hasP} label="לפחות פסקה אחת" />
            <CheckRow ok={kwOk} label="מילות מפתח" />
          </aside>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setPost(null)}>ביטול</Button>
          <Button onClick={onSave} disabled={saving}>
            {saving && <Loader2 className="animate-spin ml-2" size={14} />}
            שמירה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CheckRow = ({ ok, label }: { ok: boolean; label: string }) => (
  <div className={`flex items-center gap-2 ${ok ? "text-green-600" : "text-slate-400"}`}>
    {ok ? <CheckCircle2 size={14} /> : <Circle size={14} />}
    <span className="text-xs">{label}</span>
  </div>
);