"use client";

import * as React from "react";
import { Pencil, Trash2, Plus, Search, X } from "lucide-react";
import { services } from "@/services/api";
import { Image } from "@/components/ui/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/components/providers/toast-provider";
import { formatPrice } from "@/utils";

const EMPTY = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  unit: "each",
  stock: 0,
  discount_percent: 0,
  image: "",
  variants: [],
};

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [q, setQ] = React.useState("");
  const [list, setList] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState(EMPTY);

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      services.products.list({ q: q || undefined }),
      services.categories.list(),
    ])
      .then(([products, cats]) => {
        setList(products);
        setCategories(cats);
      })
      .catch(() => {
        setList([]);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, [q]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      category_id: p.category || p.category_id || "",
      unit: p.unit || "each",
      stock: p.stock || 0,
      discount_percent: p.discount_percent || 0,
      image: p.image || "",
      variants: (p.variants || []).map((v) => ({
        id: v.id,
        name: v.name,
        price: v.price != null ? String(v.price) : "",
        stock: v.stock || 0,
      })),
    });
    setOpen(true);
  };

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const setVariant = (i, key, val) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, idx) => (idx === i ? { ...v, [key]: val } : v)),
    }));

  const addVariant = () =>
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { name: "", price: "", stock: 0 }],
    }));

  const removeVariant = (i) =>
    setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.name || !form.category_id || !form.price) {
      toast({ variant: "error", title: "Name, category and price are required" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        category_id: form.category_id,
        unit: form.unit || "each",
        stock: Number(form.stock) || 0,
        discount_percent: Number(form.discount_percent) || 0,
        image: form.image || null,
      };

      let saved;
      if (editing) {
        saved = await services.products.update(editing.id, payload);
        const existing = (editing.variants || []).map((v) => v.id);
        const kept = [];
        for (const v of form.variants) {
          if (v.id) {
            await services.products.updateVariant(editing.id, v.id, {
              name: v.name,
              price: v.price === "" ? null : Number(v.price),
              stock: Number(v.stock) || 0,
            });
            kept.push(v.id);
          } else {
            await services.products.createVariant(editing.id, {
              name: v.name,
              price: v.price === "" ? null : Number(v.price),
              stock: Number(v.stock) || 0,
            });
          }
        }
        for (const id of existing) {
          if (!kept.includes(id)) {
            await services.products.removeVariant(editing.id, id);
          }
        }
      } else {
        saved = await services.products.create(payload);
        for (const v of form.variants) {
          await services.products.createVariant(saved.id, {
            name: v.name,
            price: v.price === "" ? null : Number(v.price),
            stock: Number(v.stock) || 0,
          });
        }
      }
      toast({ variant: "success", title: editing ? "Product updated" : "Product created" });
      setOpen(false);
      load();
    } catch {
      toast({ variant: "error", title: "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    try {
      await services.products.remove(p.id);
      toast({ variant: "success", title: "Product deleted" });
      load();
    } catch {
      toast({ variant: "error", title: "Delete failed" });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{list.length} items</p>
        </div>
        <Button variant="gradient" size="sm" className="gap-1.5" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="pl-9" />
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-none" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((p) => (
                <tr key={p.id} className="transition hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image src={p.image} alt="" ratio="1/1" className="h-11 w-11 rounded-xl" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.unit}</p>
                        {(p.variants || []).length > 0 && (
                          <span className="text-xs text-primary">{p.variants.length} variants</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="font-semibold">{formatPrice(p.price)}</span>
                    {p.discount_percent > 0 && (
                      <span className="ml-1 text-xs text-muted-foreground line-through">{formatPrice(p.mrp)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.inStock ? <Badge variant="success">In stock</Badge> : <Badge variant="destructive">Out</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-primary-soft hover:text-primary-soft-foreground">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(p)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[95vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit product" : "Add product"}</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon-sm">✕</Button>
            </SheetClose>
          </SheetHeader>

          <div className="space-y-4 px-5 pb-8 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Name</label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Product name" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Description</label>
              <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Description" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Price (₹)</label>
                <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Unit</label>
                <Input value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="e.g. 500g" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Stock</label>
                <Input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Discount %</label>
                <Input type="number" value={form.discount_percent} onChange={(e) => set("discount_percent", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => set("category_id", e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-card px-3 text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <ImageUpload label="Product image" value={form.image} onChange={(v) => set("image", v)} />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">Variants</label>
                <Button type="button" variant="outline" size="sm" onClick={addVariant} className="gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add variant
                </Button>
              </div>
              {form.variants.length === 0 && (
                <p className="text-xs text-muted-foreground">No variants. Add sizes/options if needed.</p>
              )}
              {form.variants.map((v, i) => (
                <div key={i} className="flex items-end gap-2 rounded-xl border border-border p-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground">Name</label>
                    <Input value={v.name} onChange={(e) => setVariant(i, "name", e.target.value)} placeholder="e.g. 500g" />
                  </div>
                  <div className="w-20 space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground">Price</label>
                    <Input type="number" value={v.price} onChange={(e) => setVariant(i, "price", e.target.value)} placeholder="opt" />
                  </div>
                  <div className="w-16 space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground">Stock</label>
                    <Input type="number" value={v.stock} onChange={(e) => setVariant(i, "stock", e.target.value)} />
                  </div>
                  <button type="button" onClick={() => removeVariant(i)} className="mb-0.5 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <Button fullWidth variant="gradient" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editing ? "Update product" : "Create product"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
