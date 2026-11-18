import type { ProductDetail, ProductDetailResponse } from "@fullstack-templates/api-contract";
import { productDetailFor, products } from "@fullstack-templates/mocks";
import { AsyncRegion, type RegionState } from "@fullstack-templates/ui";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ProductDetailSkeleton } from "./components/product-detail-skeleton";
import { ProductDetailView } from "./components/product-detail-view";

const oak: ProductDetail = productDetailFor(products[10]);
const bowl: ProductDetail = productDetailFor(products[2]);
const brass: ProductDetail = productDetailFor(products[6]);
const longTitle: ProductDetail = productDetailFor(products[7]);

interface PreviewProps {
  state: RegionState;
  data?: ProductDetailResponse;
}

function Preview({ state, data }: PreviewProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <AsyncRegion
        state={state}
        data={data}
        testId="region-product-detail"
        skeleton={<ProductDetailSkeleton />}
      >
        {(response: ProductDetailResponse) => (
          <ProductDetailView product={response.product} partial={response.partial} />
        )}
      </AsyncRegion>
    </div>
  );
}

const meta = {
  title: "Features/Product detail",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  name: "loading",
  render: () => <Preview state="loading" />,
};

export const Ready: Story = {
  name: "ready",
  render: () => <Preview state="ready" data={{ product: bowl }} />,
};

export const Partial: Story = {
  name: "partial",
  render: () => (
    <Preview state="partial" data={{ product: { ...bowl, images: [], specs: [] }, partial: true }} />
  ),
};

export const OutOfStock: Story = {
  name: "out of stock",
  render: () => <Preview state="ready" data={{ product: oak }} />,
};

export const MissingPhotos: Story = {
  name: "missing photos",
  render: () => <Preview state="ready" data={{ product: { ...brass, images: [] } }} />,
};

export const LongTitle: Story = {
  name: "long title",
  render: () => <Preview state="ready" data={{ product: longTitle }} />,
};

export const ErrorNotFound: Story = {
  name: "error:not-found",
  render: () => <Preview state="error:not-found" />,
};

export const ErrorHttp: Story = {
  name: "error:http",
  render: () => <Preview state="error:http" />,
};

export const ErrorNetwork: Story = {
  name: "error:network",
  render: () => <Preview state="error:network" />,
};

export const ErrorRateLimited: Story = {
  name: "error:rate-limited",
  render: () => <Preview state="error:rate-limited" />,
};

export const ErrorParse: Story = {
  name: "error:parse",
  render: () => <Preview state="error:parse" />,
};
