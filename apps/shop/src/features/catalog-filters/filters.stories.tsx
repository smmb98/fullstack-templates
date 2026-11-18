import { products, productFacets } from "@fullstack-templates/mocks";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { ActiveFilters } from "./components/active-filters";
import { FilterPanel } from "./components/filter-panel";
import {
  emptyFilters,
  removeChip,
  type CatalogFilters as FilterState,
} from "./filter-state";

const facets = productFacets(products);

function Preview({ initial = emptyFilters }: { initial?: FilterState }) {
  const [value, setValue] = useState<FilterState>(initial);
  return (
    <div className="max-w-sm p-6">
      <FilterPanel
        facets={facets}
        value={value}
        onChange={setValue}
        onClear={() => setValue(emptyFilters)}
        idPrefix="story"
      />
      <ActiveFilters
        filters={value}
        onRemove={(chip) => setValue(removeChip(value, chip))}
        onClear={() => setValue(emptyFilters)}
      />
    </div>
  );
}

const meta = {
  title: "Features/Catalog filters",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "default",
  render: () => <Preview />,
};

export const Applied: Story = {
  name: "applied filters",
  render: () => (
    <Preview
      initial={{
        category: "Decor",
        brands: ["Clay & Co"],
        colors: [],
        materials: [],
        minPrice: 5000,
        maxPrice: 20000,
        minRating: 4,
        inStock: true,
        onSale: false,
      }}
    />
  ),
};

export const NoFacets: Story = {
  name: "loading facets",
  render: () => (
    <div className="max-w-sm p-6">
      <FilterPanel
        value={emptyFilters}
        onChange={() => undefined}
        onClear={() => undefined}
        idPrefix="story-empty"
      />
    </div>
  ),
};
