"use client";

import type { ProductListResponse } from "@fullstack-templates/api-contract";
import { Badge, Skeleton } from "@fullstack-templates/ui";
import { useState } from "react";
import { formatMoney } from "@/config/locale";

type Product = ProductListResponse["items"][number];

function ProductImage({ product }: { product: Product }) {
  const image = product.images[0];
  const [failed, setFailed] = useState(false);

  if (!image || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-subtle px-4 text-center text-muted">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-8 w-8 opacity-60"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="m21 15-4.5-4.5L9 18" />
        </svg>
        <span className="text-xs font-medium tracking-wide uppercase">Image coming soon</span>
        <span className="sr-only">No photo available for {product.title}.</span>
      </div>
    );
  }

  return (
    <img
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}

function ProductCard({ product }: { product: Product }) {
  const onSale = product.compareAtPrice !== null;

  return (
    <li className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-subtle">
        <ProductImage product={product} />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {onSale ? <Badge tone="sale">Sale</Badge> : null}
          {!product.inStock ? <Badge tone="warning">Out of stock</Badge> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-lg leading-snug text-ink">{product.title}</h2>
          <p className="shrink-0 text-sm font-medium text-ink">{formatMoney(product.price)}</p>
        </div>
        <p className="text-sm leading-relaxed text-muted">{product.description}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-muted">
          <p>
            <span aria-hidden="true">★ {product.rating.toFixed(1)}</span>
            <span className="sr-only">{product.rating.toFixed(1)} out of 5</span>
            <span aria-hidden="true"> · </span>
            <span>{product.reviewCount} reviews</span>
          </p>
          <p className="uppercase tracking-wide">{product.category}</p>
        </div>
      </div>
    </li>
  );
}

export function ListingGrid({ data }: { data: ProductListResponse }) {
  return (
    <section aria-labelledby="catalog-results">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id="catalog-results" className="text-sm font-medium tracking-wide text-muted uppercase">
          Results
        </h2>
        <p className="text-sm text-muted" role="status">
          {data.total} {data.total === 1 ? "piece" : "pieces"}
        </p>
      </div>
      <ul className="grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
    </section>
  );
}

export function ListingSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="mb-4 h-4 w-24" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-lg border border-line bg-surface">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="flex flex-col gap-3 p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
