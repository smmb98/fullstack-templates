import type { Meta, StoryObj } from "@storybook/nextjs";
import { SortControl } from "./components/sort-control";

function SortPreview({ value }: { value?: "relevance" | "price-asc" | "price-desc" | "newest" | "rating" | "best-selling" }) {
  return (
    <div className="max-w-md p-6">
      <SortControl value={value} onChange={() => undefined} />
    </div>
  );
}

const meta = {
  title: "Features/Catalog sort",
  component: SortPreview,
  parameters: { layout: "centered" },
} satisfies Meta<typeof SortPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "default (relevance)",
  render: () => <SortPreview />,
};

export const PriceLowToHigh: Story = {
  name: "price asc",
  render: () => <SortPreview value="price-asc" />,
};

export const Newest: Story = {
  name: "newest",
  render: () => <SortPreview value="newest" />,
};
