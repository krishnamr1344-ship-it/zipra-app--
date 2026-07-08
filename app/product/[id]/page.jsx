"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  Star,
  Plus,
  Minus,
  Zap,
} from "lucide-react";
import { services } from "@/services/api";
import { cn } from "@/lib/utils";
import { formatPrice, discountPercent } from "@/utils";
import { Image } from "@/components/ui/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { ProductGrid } from "@/components/product/product-grid";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/empty-state";
import { useStore } from "@/store/useStore";
import { useToast } from "@/components/providers/toast-provider";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = React.useState(null);
  const [similar, setSimilar] = React.useState([]);
  const [activeImg, setActiveImg] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const addToCart = useStore((s) => s.addToCart);
  const setQty = useStore((s) => s.setQty);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const isWishlisted = useStore((s) => s.wishlist.some((i) => i.id === product?.id));
  const qty = useStore((s) => s.cart.find((i) => i.id === product?.id)?.qty || 0);
  const { toast } = useToast();

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const [p, sim] = await Promise.all([
          services.products.get(id),
          services.products.similar(id),
        ]);
        if (!active) return;
        setProduct(p);
        setSimilar(sim);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => (active = false);
  }, [id]);

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-72 w-full rounded-3xl" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );

  if (error || !product)
    return <ErrorState onRetry={() => router.refresh()} title="Product not found" />;

  const pct = discountPercent(product.price, product.mrp);
  const gallery = [product.image, product.image, product.image];

  return (
    <div className="space-y-5 pb-24">
      <button
        onClick={() => router.back()}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-sm"
        aria-label="Back"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="relative overflow-hidden rounded-3xl shadow-md">
        <Image
          src={gallery[activeImg]}
          alt={product.name}
          ratio="4/3"
          className="bg-muted"
        />
        {pct > 0 && (
          <Badge variant="destructive" className="absolute left-3 top-3 text-sm">
            {pct}% OFF
          </Badge>
        )}
        <div className="absolute right-3 top-3 flex gap-2">
          <button
            aria-label="Share"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card/90 shadow-sm"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            aria-label="Wishlist"
            onClick={() => toggleWishlist(product)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card/90 shadow-sm"
          >
            <Heart
              className={cn(
                "h-4 w-4",
                isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"
              )}
            />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {gallery.map((g, i) => (
          <button
            key={i}
            onClick={() => setActiveImg(i)}
            className={cn(
              "h-16 w-16 overflow-hidden rounded-xl border-2 transition",
              i === activeImg ? "border-primary" : "border-transparent"
            )}
          >
            <Image src={g} alt="" ratio="1/1" />
          </button>
        ))}
      </div>

      <div>
        {product.badge && (
          <Badge variant="soft" className="mb-2">
            {product.badge}
          </Badge>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {product.name}
        </h1>
        <p className="text-sm text-muted-foreground">{product.unit}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-1">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="text-sm font-semibold">{product.rating?.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({product.reviews})</span>
          </div>
          <span
            className={cn(
              "text-xs font-semibold",
              product.inStock ? "text-success" : "text-destructive"
            )}
          >
            {product.inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
          {pct > 0 && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.mrp)}
              </span>
              <Badge variant="success">Save {formatPrice(product.mrp - product.price)}</Badge>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-muted p-3 text-center">
          <Truck className="h-5 w-5 text-primary" />
          <span className="text-xs font-medium">10 min delivery</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-muted p-3 text-center">
          <Zap className="h-5 w-5 text-accent" />
          <span className="text-xs font-medium">Express</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-muted p-3 text-center">
          <ShieldCheck className="h-5 w-5 text-success" />
          <span className="text-xs font-medium">Quality assured</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-2 font-semibold">Offers</h3>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>• Use FRESH20 for 20% off on first order</li>
          <li>• Free delivery on orders above ₹499</li>
          <li>• Bank offer: 5% cashback with Zipra Pay</li>
        </ul>
      </div>

      <Accordion type="multiple" defaultValue={["desc", "spec"]}>
        <AccordionItem value="desc" title="Description">
          Fresh, hand-picked {product.name.toLowerCase()} sourced from trusted local
          farms. Stored in temperature-controlled facilities to retain maximum
          freshness and nutrition. Ideal for everyday use.
        </AccordionItem>
        <AccordionItem value="spec" title="Specifications & Nutrition">
          <div className="space-y-1">
            <div className="flex justify-between"><span>Weight</span><span className="font-medium">{product.unit}</span></div>
            <div className="flex justify-between"><span>Storage</span><span className="font-medium">Cool & dry</span></div>
            <div className="flex justify-between"><span>Shelf life</span><span className="font-medium">3-5 days</span></div>
          </div>
        </AccordionItem>
      </Accordion>

      {similar.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold">Similar products</h2>
          <ProductGrid products={similar} />
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:static lg:border-0 lg:bg-transparent">
        <div className="container-app flex items-center gap-3 py-3">
          <QuantityStepper
            value={qty}
            onChange={(v) => setQty(product.id, v)}
          />
          <Button
            fullWidth
            variant="gradient"
            size="lg"
            disabled={!product.inStock}
            onClick={() => {
              if (qty === 0) addToCart(product, 1);
              toast({ variant: "success", title: "Added to cart", description: product.name });
              router.push("/cart");
            }}
          >
            {qty > 0 ? "Go to Cart" : "Add to Cart"}
          </Button>
          <Button
            fullWidth
            variant="default"
            size="lg"
            disabled={!product.inStock}
            onClick={() => {
              if (qty === 0) addToCart(product, 1);
              router.push("/checkout");
            }}
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
