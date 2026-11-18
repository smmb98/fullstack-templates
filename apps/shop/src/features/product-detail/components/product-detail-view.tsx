"use client";

import type { ProductDetail } from "@fullstack-templates/api-contract";
import { Badge } from "@fullstack-templates/ui";
import Link from "next/link";
import { useState } from "react";
import { formatMoney } from "@/config/locale";
import { addCartItem, cartQuantity, readCart, writeCart } from "../cart";
import { productPath } from "../api";
import {
  clampQuantity,
  discountPercent,
  findVariant,
  firstAvailableVariant,
  pickOption,
  productJsonLd,
  selectionOf,
  serializeJsonLd,
  variantLabel,
  type VariantSelection,
} from "../detail";
import { BuyActions, StickyBuyBar, canBuy } from "./buy-actions";
import { ProductAccordion } from "./product-accordion";
import { ProductGallery } from "./product-gallery";
import { VariantPicker } from "./variant-picker";

function ProductJsonLd({ product }: { product: ProductDetail }) {
  const json = serializeJsonLd(productJsonLd(product, productPath(product.slug)));
  return (
    <script
      type="application/ld+json"
      data-testid="product-json-ld"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

function Breadcrumbs({ product }: { product: ProductDetail }) {
  const top = product.categoryPath[0] ?? product.category;
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href="/products" className="hover:text-ink">
            Collection
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href={`/products?category=${encodeURIComponent(top)}`} className="hover:text-ink">
            {top}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-ink">
          {product.title}
        </li>
      </ol>
    </nav>
  );
}

export function ProductDetailView({
  product,
  partial = false,
}: {
  product: ProductDetail;
  partial?: boolean;
}) {
  const first = firstAvailableVariant(product.variants);
  const [selection, setSelection] = useState<VariantSelection>(() =>
    first ? selectionOf(first) : { color: "", size: "" },
  );
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  const variant = findVariant(product.variants, selection) ?? null;
  const maxQuantity = variant?.stock ?? 0;
  const saved = discountPercent(product.price.amount, product.compareAtPrice?.amount);

  const handlePick = (axis: "color" | "size", value: string) => {
    const next = pickOption(product.variants, selection, axis, value);
    setSelection(next);
    setMessage(null);
    const nextVariant = findVariant(product.variants, next);
    setQuantity((current) => clampQuantity(current, nextVariant?.stock ?? 1));
  };

  const handleAdd = () => {
    if (!variant || !canBuy(product, variant)) return;
    const amount = clampQuantity(quantity, maxQuantity);
    const items = addCartItem(readCart(window.localStorage), {
      slug: product.slug,
      variantId: variant.id,
      title: product.title,
      color: variant.color,
      size: variant.size,
      unitAmount: product.price.amount,
      currency: product.price.currency,
      image: product.images[0]?.src,
      quantity: amount,
    });
    writeCart(window.localStorage, items);
    setMessage(
      `Added ${amount} × ${product.title} (${variantLabel(variant)}) to your bag. ${cartQuantity(items)} in the bag.`,
    );
  };

  return (
    <div className="pb-24 lg:pb-0">
      <ProductJsonLd product={product} />
      <Breadcrumbs product={product} />

      {partial ? (
        <p
          role="status"
          className="mb-4 rounded-md border border-line bg-subtle px-4 py-3 text-sm text-muted"
        >
          Some details are missing. Photos and specifications will return shortly.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
        <ProductGallery images={product.images} title={product.title} />

        <div className="flex flex-col gap-5">
          {product.brand ? (
            <p className="text-xs font-medium tracking-wide text-muted uppercase">{product.brand}</p>
          ) : null}

          <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl">{product.title}</h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
            <p>
              <span aria-hidden="true">★ {product.rating.toFixed(1)}</span>
              <span className="sr-only">{product.rating.toFixed(1)} out of 5</span>
              <span aria-hidden="true"> · </span>
              <span>
                {product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"}
              </span>
            </p>
            <span aria-hidden="true">·</span>
            <p>{product.categoryPath.join(" / ")}</p>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <p className="text-2xl font-medium text-ink">{formatMoney(product.price)}</p>
            {product.compareAtPrice ? (
              <>
                <s className="text-base text-muted">{formatMoney(product.compareAtPrice)}</s>
                {saved ? <Badge tone="sale">{`Save ${saved}%`}</Badge> : null}
              </>
            ) : null}
          </div>

          <p className="max-w-prose text-base leading-relaxed text-muted">{product.description}</p>

          {product.variants.length > 0 ? (
            <VariantPicker variants={product.variants} selection={selection} onPick={handlePick} />
          ) : null}

          <BuyActions
            product={product}
            variant={variant}
            quantity={clampQuantity(quantity, maxQuantity)}
            message={message}
            onQuantityChange={(next) => setQuantity(clampQuantity(next, maxQuantity))}
            onAdd={handleAdd}
          />

          <ProductAccordion product={product} />
        </div>
      </div>

      <StickyBuyBar product={product} variant={variant} onAdd={handleAdd} />
    </div>
  );
}
