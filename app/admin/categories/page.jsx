"use client";

import * as React from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { services } from "@/services/api";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/components/providers/toast-provider";

const EMPTY = { name: "", description: "", image: "" };

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState(EMPTY);

  const load = React.useCallback(() => {
    setLoading(true);
    services.categories
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
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || "", image: c.image || "" });
    setOpen(true);
  };
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name) {
      toast({ variant: "error", title: "Name is required" });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await services.categories.update(editing.id, { ...form });
      } else {
        await services.categories.create({ ...form });
      }
      toast({ variant: "success", title: editing ? "Category updated" : "Category created" });
      setOpen(false);
      load();
    } catch {
      toast({ variant: "error", title: "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c) => {
    if (!confirm(`Delete ${c.name}?`)) return;
    try {
      await services.categories.remove(c.id);
      toast({ variant: "success", title: "Category deleted" });
      load();
    } catch {
      toast({ variant: "error", title: "Delete failed" });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">{list.length} categories</p>
        </div>
        <Button variant="gradient" size="sm" className="gap-1.5" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((c) => (
            <Card key={c.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Image src={c.image} alt="" ratio="1/1" className="h-11 w-11 rounded-xl" />
                <span className="font-semibold">{c.name}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-primary-soft hover:text-primary-soft-foreground">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(c)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive">
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
            <SheetTitle>{editing ? "Edit category" : "Add category"}</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon-sm">✕</Button>
            </SheetClose>
          </SheetHeader>
          <div className="space-y-4 px-5 pb-8 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Name</label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Category name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Description</label>
              <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Description" />
            </div>
            <ImageUpload label="Category image" value={form.image} onChange={(v) => set("image", v)} aspect="1/1" />
            <Button fullWidth variant="gradient" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editing ? "Update category" : "Create category"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
