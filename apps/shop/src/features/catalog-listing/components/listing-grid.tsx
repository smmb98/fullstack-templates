"use client";

import type { ProductListResponse } from "@fullstack-templates/api-contract";
import { Badge, cn, Skeleton } from "@fullstack-templates/ui";
import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { formatMoney } from "@/config/locale";
import type { ListingView } from "../api";

type Product = ProductListResponse["items"][number];

function ProductImage({ product, className }: { product: Product; className?: string }) {
  const image = product.images[0];
  const [failed, setFailed] = useState(false);

  if (!image || failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-2 bg-subtle px-4 text-center text-muted",
          className,
        )}
      >
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
      className={cn("h-full w-full object-cover", className)}
    />
  );
}

function Price({ product }: { product: Product }) {
  return (
    <p className="flex flex-wrap items-baseline gap-2 text-sm font-medium text-ink">
      <span>{formatMoney(product.price)}</span>
      {product.compareAtPrice ? (
        <s className="text-xs font-normal text-muted">{formatMoney(product.compareAtPrice)}</s>
      ) : null}
    </p>
  );
}

function Rating({ product }: { product: Product }) {
  return (
    <p className="text-xs text-muted">
      <span aria-hidden="true">★ {product.rating.toFixed(1)}</span>
      <span className="sr-only">{product.rating.toFixed(1)} out of 5</span>
      <span aria-hidden="true"> · </span>
      <span>
        {product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"}
      </span>
    </p>
  );
}

function CardTitle({ product, href }: { product: Product; href?: string }) {
  return (
    <h2 className="font-display text-lg leading-snug text-ink">
      {href ? (
        <Link
          href={href}
          className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {product.title}
        </Link>
      ) : (
        product.title
      )}
    </h2>
  );
}

function ProductCard({ product, href }: { product: Product; href?: string }) {
  return (
    <li className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-subtle">
        <ProductImage product={product} />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {product.compareAtPrice ? <Badge tone="sale">Sale</Badge> : null}
          {!product.inStock ? <Badge tone="warning">Out of stock</Badge> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle product={product} href={href} />
          <div className="shrink-0 text-right">
            <Price product={product} />
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted">{product.description}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <Rating product={product} />
          <p className="text-xs tracking-wide text-muted uppercase">{product.category}</p>
        </div>
      </div>
    </li>
  );
}

function ProductRow({ product, href }: { product: Product; href?: string }) {
  return (
    <li className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-subtle sm:aspect-auto sm:h-auto sm:w-56 sm:shrink-0">
          <ProductImage product={product} />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {product.compareAtPrice ? <Badge tone="sale">Sale</Badge> : null}
            {!product.inStock ? <Badge tone="warning">Out of stock</Badge> : null}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle product={product} href={href} />
            <Price product={product} />
          </div>
          <p className="max-w-prose text-sm leading-relaxed text-muted">{product.description}</p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
            <Rating product={product} />
            <p className="text-xs tracking-wide text-muted uppercase">{product.category}</p>
          </div>
        </div>
      </div>
    </li>
  );
}

export interface ListingGridProps {
  data: ProductListResponse;
  view?: ListingView;
  pageHref?: (page: number) => string;
  onPageChange?: (page: number) => void;
  /** Builds the product page link; omitted when the detail slice is switched off. */
  productHref?: (product: Product) => string;
}

function pageWindow(page: number, totalPages: number): Array<number | "gap"> {
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const valid = [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
  const result: Array<number | "gap"> = [];
  for (const value of valid) {
    const previous = result[result.length - 1];
    if (typeof previous === "number" && value - previous > 1) result.push("gap");
    result.push(value);
  }
  return result;
}

function Pagination({
  data,
  pageHref,
  onPageChange,
}: {
  data: ProductListResponse;
  pageHref?: (page: number) => string;
  onPageChange?: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  if (totalPages <= 1) return null;

  const linkClass =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-line px-3 text-sm font-medium text-ink hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
  const currentClass = "border-primary bg-primary text-on-primary hover:bg-primary";
  const disabledClass = "cursor-not-allowed opacity-40";

  const go = (event: MouseEvent<HTMLAnchorElement>, page: number) => {
    if (!onPageChange) return;
    event.preventDefault();
    onPageChange(page);
  };

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-muted" role="status">
        Page {data.page} of {totalPages}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {data.page > 1 && pageHref ? (
          <a href={pageHref(data.page - 1)} onClick={(event) => go(event, data.page - 1)} className={linkClass}>
            Previous
          </a>
        ) : (
          <span aria-disabled="true" className={cn(linkClass, disabledClass)}>
            Previous
          </span>
        )}
        {pageWindow(data.page, totalPages).map((item, index) =>
          item === "gap" ? (
            <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-sm text-muted">
              …
            </span>
          ) : (
            <a
              key={item}
              href={pageHref?.(item) ?? `?page=${item}`}
              onClick={(event) => go(event, item)}
              aria-current={item === data.page ? "page" : undefined}
              aria-label={`Page ${item}`}
              className={cn(linkClass, item === data.page && currentClass)}
            >
              {item}
            </a>
          ),
        )}
        {data.page < totalPages && pageHref ? (
          <a href={pageHref(data.page + 1)} onClick={(event) => go(event, data.page + 1)} className={linkClass}>
            Next
          </a>
        ) : (
          <span aria-disabled="true" className={cn(linkClass, disabledClass)}>
            Next
          </span>
        )}
      </div>
    </nav>
  );
}

export function ListingGrid({
  data,
  view = "grid",
  pageHref,
  onPageChange,
  productHref,
}: ListingGridProps) {
  const list = view === "list";
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
      <ul
        data-view={view}
        className={cn(
          "grid list-none",
          list ? "grid-cols-1 gap-4" : "grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {data.items.map((product) =>
          list ? (
            <ProductRow key={product.id} product={product} href={productHref?.(product)} />
          ) : (
            <ProductCard key={product.id} product={product} href={productHref?.(product)} />
          ),
        )}
      </ul>
      <Pagination data={data} pageHref={pageHref} onPageChange={onPageChange} />
    </section>
  );
}

export function ListingSkeleton({ view = "grid" }: { view?: ListingView }) {
  return (
    <div aria-hidden="true">
      <Skeleton className="mb-4 h-4 w-24" />
      <div
        className={cn(
          "grid grid-cols-1",
          view === "list" ? "gap-4" : "gap-5 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
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
