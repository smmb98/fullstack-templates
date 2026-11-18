import type { ProductListResponse } from "@fullstack-templates/api-contract";
import { products } from "@fullstack-templates/mocks";
import { AsyncRegion, type RegionState } from "@fullstack-templates/ui";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { emptyFilters } from "@/features/catalog-filters";
import type { ListingView } from "./api";
import { ListingFrame } from "./components/listing-frame";
import { ListingGrid, ListingSkeleton } from "./components/listing-grid";

const readyData: ProductListResponse = {
  items: products.slice(0, 6),
  page: 1,
  pageSize: 6,
  total: 6,
};

const emptyData: ProductListResponse = {
  items: [],
  page: 1,
  pageSize: 12,
  total: 0,
};

const missingImageData: ProductListResponse = {
  items: [{ ...products[5], images: [] }],
  page: 1,
  pageSize: 12,
  total: 1,
};

interface PreviewProps {
  state: RegionState;
  data?: ProductListResponse;
  isLarge?: boolean;
  view?: ListingView;
}

function Preview({
  state,
  data,
  isLarge = false,
  view = "grid",
}: PreviewProps) {
  return (
    <ListingFrame
      query={{ ...emptyFilters, view: view === "grid" ? undefined : view }}
      searchText=""
      isLarge={isLarge}
      showSort
      view={view}
      onSearchChange={() => undefined}
      onSearchSubmit={() => undefined}
      onSortChange={() => undefined}
      onViewChange={() => undefined}
    >
      <AsyncRegion
        state={state}
        data={data}
        testId="region-catalog-listing"
        skeleton={<ListingSkeleton view={view} />}
      >
        {(response) => <ListingGrid data={response} view={view} />}
      </AsyncRegion>
    </ListingFrame>
  );
}

const meta = {
  title: "Features/Catalog listing",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  name: "loading",
  render: () => <Preview state="loading" />,
};

export const Refetching: Story = {
  name: "refetching",
  render: () => <Preview state="refetching" data={readyData} />,
};

export const Ready: Story = {
  name: "ready",
  render: () => <Preview state="ready" data={readyData} />,
};

export const MissingImage: Story = {
  name: "missing image",
  render: () => <Preview state="ready" data={missingImageData} />,
};

export const ListView: Story = {
  name: "list view",
  render: () => <Preview state="ready" data={readyData} view="list" />,
};

export const LargeCollection: Story = {
  name: "large collection",
  render: () => <Preview state="ready" isLarge data={{ ...readyData, total: 512 }} />,
};

export const EmptyFirstUse: Story = {
  name: "empty:first-use",
  render: () => <Preview state="empty:first-use" data={emptyData} />,
};

export const EmptyNoResults: Story = {
  name: "empty:no-results",
  render: () => <Preview state="empty:no-results" data={emptyData} />,
};

export const Partial: Story = {
  name: "partial",
  render: () => <Preview state="partial" data={{ ...readyData, partial: true }} />,
};

export const ErrorNetwork: Story = {
  name: "error:network",
  render: () => <Preview state="error:network" />,
};

export const ErrorTimeout: Story = {
  name: "error:timeout",
  render: () => <Preview state="error:timeout" />,
};

export const ErrorHttp: Story = {
  name: "error:http",
  render: () => <Preview state="error:http" />,
};

export const ErrorUnauthorized: Story = {
  name: "error:unauthorized",
  render: () => <Preview state="error:unauthorized" />,
};

export const ErrorForbidden: Story = {
  name: "error:forbidden",
  render: () => <Preview state="error:forbidden" />,
};

export const ErrorNotFound: Story = {
  name: "error:not-found",
  render: () => <Preview state="error:not-found" />,
};

export const ErrorRateLimited: Story = {
  name: "error:rate-limited",
  render: () => <Preview state="error:rate-limited" />,
};

export const ErrorParse: Story = {
  name: "error:parse",
  render: () => <Preview state="error:parse" />,
};
