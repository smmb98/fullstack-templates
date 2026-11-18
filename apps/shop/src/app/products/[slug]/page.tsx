import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/features/product-detail";
import { isFeatureEnabled } from "@/features/flags";

export const metadata = {
  title: "Product",
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!isFeatureEnabled("productDetail")) notFound();

  const { slug } = await params;
  return <ProductDetailPage slug={slug} />;
}
