"use client";

import * as React from "react";
import { Pencil, Trash2, Plus, X, Eye } from "lucide-react";
import { services } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/components/providers/toast-provider";

const EMPTY = { title: "", subtitle: "", image_url: "", link: "", color: "from-[#FF9A3D] to-[#F26400]", is_active: true, sort_order: 0 };

export default function AdminBannersPage() {
  const { toast } = useToast();
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState(EMPTY);

  const load = React.useCallback(() => {
    setLoading(true);
    services.adminBanners
      .list()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };
  const openEdit = (b) => {
    setEditing(b);
    setForm({
      title: b.title || "",
      subtitle: b.subtitle || "",
      image_url: b.image_url || "",
      link: b.link || "",
      color: b.color || "from-[#FF9A3D] to-[#F26400]",
      is_active: b.is_active !== false,
      sort_order: b.sort_order || 0,
    });
    setOpen(true);
  };
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.title) {
      toast({ variant: "error", title: "Title is required" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        image_url: form.image_url || null,
        link: form.link || null,
        color: form.color,
        is_active: !!form.is_active,
        sort_order: Number(form.sort_order) || 0,
      };
      if (editing) {
        await services.adminBanners.update(editing.id, payload);
      } else {
        await services.adminBanners.create(payload);
      }
      toast({ variant: "success", title: editing ? "Banner updated" : "Banner created" });
      setOpen(false);
      load();
    } catch {
      toast({ variant: "error", title: "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b) => {
    if (!confirm(`Delete ${b.title}?`)) return;
    try {
      await services.adminBanners.remove(b.id);
      toast({ variant: "success", title: "Banner deleted" });
      load();
    } catch {
      toast({ variant: "error", title: "Delete failed" });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Banners</h1>
          <p className="text-sm text-muted-foreground">{list.length} banners</p>
        </div>
        <Button variant="gradient" size="sm" className="gap-1.5" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((b) => (
            <Card key={b.id} className="flex items-center gap-4 p-3">
              <div className={`flex h-16 w-28 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r ${b.gradient} text-xs font-bold text-white`}>
                {b.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- banner image is an arbitrary URL
                  <img src={b.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  b.title
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{b.title}</p>
                <p className="text-xs text-muted-foreground">Link: {b.link || "—"}</p>
              </div>
              <Badge variant={b.is_active ? "success" : "warning"}>{b.is_active ? "Live" : "Hidden"}</Badge>
              <div className="flex gap-1">
                <button onClick={() => openEdit(b)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-primary-soft hover:text-primary-soft-foreground">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(b)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[95vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit banner" : "Add banner"}</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon-sm">✕</Button>
            </SheetClose>
          </SheetHeader>
          <div className="space-y-4 px-5 pb-8 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Title</label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Banner title" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Subtitle</label>
              <Input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="Subtitle" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Link</label>
                <Input value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="/offers" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Sort order</label>
                <Input type="number" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
              </div>
            </div>
            <ImageUpload label="Banner image" value={form.image_url} onChange={(v) => set("image_url", v)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
              Active (visible on storefront)
            </label>
            <Button fullWidth variant="gradient" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editing ? "Update banner" : "Create banner"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
