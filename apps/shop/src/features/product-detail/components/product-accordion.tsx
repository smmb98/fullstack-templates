import type { ProductDetail } from "@fullstack-templates/api-contract";

const summaryClass =
  "flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
const bodyClass = "flex flex-col gap-3 pb-5 text-sm leading-relaxed text-muted";

export function ProductAccordion({ product }: { product: ProductDetail }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      <details open>
        <summary className={summaryClass}>
          Details
          <span aria-hidden="true" className="text-muted">
            +
          </span>
        </summary>
        <div className={bodyClass}>
          <p>{product.description}</p>
          {product.highlights.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5">
              {product.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          ) : null}
          {product.specs.length > 0 ? (
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex flex-col">
                  <dt className="text-xs tracking-wide text-muted uppercase">{spec.label}</dt>
                  <dd className="text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </details>

      <details>
        <summary className={summaryClass}>
          Materials &amp; care
          <span aria-hidden="true" className="text-muted">
            +
          </span>
        </summary>
        <div className={bodyClass}>
          <p>{product.materials.length > 0 ? product.materials.join(", ") : "See the details above."}</p>
          {product.care.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5">
              {product.care.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : (
            <p>Wipe with a soft, damp cloth.</p>
          )}
        </div>
      </details>

      <details>
        <summary className={summaryClass}>
          Delivery &amp; returns
          <span aria-hidden="true" className="text-muted">
            +
          </span>
        </summary>
        <div className={bodyClass}>
          <p>{product.leadTime ?? "Ships in 2–3 working days."}</p>
          <p>
            Delivery is free over $150. Returns are accepted within 30 days, unused and in the original
            packaging. Made-to-order pieces are final sale.
          </p>
        </div>
      </details>
    </div>
  );
}
