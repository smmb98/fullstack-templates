import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="max-w-2xl">
        <p className="mb-4 text-sm font-medium tracking-[0.18em] text-muted uppercase">
          Hearth &amp; Grain
        </p>
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
          Objects for the everyday home.
        </h1>
        <p className="mt-6 max-w-prose text-lg leading-relaxed text-muted">
          Furniture, lighting and tableware chosen for the way a room actually feels. Made in
          small batches, kept for years.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-on-primary hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Browse the collection
          </Link>
          <Link
            href="/products?sort=newest"
            className="inline-flex min-h-11 items-center rounded-md border border-line bg-surface px-5 text-sm font-medium text-ink hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            New arrivals
          </Link>
        </div>
      </div>
    </div>
  );
}
