import type { ProductListResponse } from "@showcase/api-contract";
import { Badge, Skeleton } from "@showcase/ui";
import { formatMoney } from "@/config/locale";

function ProductCard({ product }: { product: ProductListResponse["items"][number] }) {
  const image = product.images[0];
  const onSale = product.compareAtPrice !== null;

  return (
    <li className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-subtle">
        {image ? (
          <img
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div aria-hidden="true" className="h-full w-full bg-subtle" />
        )}
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
