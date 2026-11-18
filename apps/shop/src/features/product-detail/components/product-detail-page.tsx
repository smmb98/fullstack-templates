"use client";

import { ApiError } from "@fullstack-templates/api-contract";
import { AsyncRegion } from "@fullstack-templates/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchProductDetail, productDetailKeys } from "../api";
import { ProductDetailSkeleton } from "./product-detail-skeleton";
import { ProductDetailView } from "./product-detail-view";

export function ProductDetailPage({ slug }: { slug: string }) {
  const router = useRouter();
  const query = useQuery({
    queryKey: productDetailKeys.detail(slug),
    queryFn: () => fetchProductDetail(slug),
  });

  const missing = query.error instanceof ApiError && query.error.kind === "not-found";

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-12 sm:px-6">
      <AsyncRegion
        query={query}
        testId="region-product-detail"
        skeleton={<ProductDetailSkeleton />}
        errorMessage={
          missing
            ? "We could not find this piece. It may have sold out or moved — the collection is a good place to look."
            : undefined
        }
        // A missing product cannot be fixed by retrying, so send the visitor to the catalog.
        onRetry={() => {
          if (missing) router.push("/products");
          else void query.refetch();
        }}
      >
        {(data) => (
          <ProductDetailView key={data.product.slug} product={data.product} partial={data.partial} />
        )}
      </AsyncRegion>
    </div>
  );
}
