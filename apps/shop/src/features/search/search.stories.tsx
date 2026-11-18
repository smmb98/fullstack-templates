import type { Meta, StoryObj } from "@storybook/nextjs";
import type { ReactNode } from "react";
import type { SearchOption } from "./components/search-suggestions";
import { SearchSuggestions } from "./components/search-suggestions";

const suggestionOptions: SearchOption[] = [
  {
    id: "search-option-0",
    label: "Oak Dining Table",
    detail: "Furniture",
    type: "product",
    href: "/products?q=Oak%20Dining%20Table",
  },
  {
    id: "search-option-1",
    label: "Alder Lounge Chair",
    detail: "Furniture",
    type: "product",
    href: "/products?q=Alder%20Lounge%20Chair",
  },
  {
    id: "search-option-2",
    label: "Northline",
    detail: "Brand",
    type: "brand",
    href: "/products?brand=Northline",
  },
];

const recentOptions: SearchOption[] = ["oak", "linen", "brass"].map((value, index) => ({
  id: `search-recent-${index}`,
  label: value,
  type: "recent" as const,
  href: `/products?q=${value}`,
}));

const meta = {
  title: "Features/Search",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full max-w-md p-4">
      <p className="mb-2 text-sm text-muted">Header search popup</p>
      <div className="relative h-11 rounded-md border border-line bg-page" />
      {children}
    </div>
  );
}

export const Loading: Story = {
  name: "loading",
  render: () => (
    <Shell>
      <SearchSuggestions
        state="loading"
        query="oak"
        options={[]}
        heading="Suggestions"
        activeIndex={-1}
        listboxId="story-search-listbox"
        onChoose={() => undefined}
        onActiveChange={() => undefined}
        onRetry={() => undefined}
      />
    </Shell>
  ),
};

export const Ready: Story = {
  name: "ready",
  render: () => (
    <Shell>
      <SearchSuggestions
        state="ready"
        query="oak"
        options={suggestionOptions}
        heading="Suggestions"
        activeIndex={0}
        listboxId="story-search-listbox"
        onChoose={() => undefined}
        onActiveChange={() => undefined}
        onRetry={() => undefined}
      />
    </Shell>
  ),
};

export const Empty: Story = {
  name: "empty:no-results",
  render: () => (
    <Shell>
      <SearchSuggestions
        state="empty:no-results"
        query="zzzz"
        options={[]}
        heading="Suggestions"
        activeIndex={-1}
        listboxId="story-search-listbox"
        onChoose={() => undefined}
        onActiveChange={() => undefined}
        onRetry={() => undefined}
      />
    </Shell>
  ),
};

export const ErrorNetwork: Story = {
  name: "error:network",
  render: () => (
    <Shell>
      <SearchSuggestions
        state="error:network"
        query="oak"
        options={[]}
        heading="Suggestions"
        activeIndex={-1}
        listboxId="story-search-listbox"
        onChoose={() => undefined}
        onActiveChange={() => undefined}
        onRetry={() => undefined}
      />
    </Shell>
  ),
};

export const ErrorHttp: Story = {
  name: "error:http",
  render: () => (
    <Shell>
      <SearchSuggestions
        state="error:http"
        query="oak"
        options={[]}
        heading="Suggestions"
        activeIndex={-1}
        listboxId="story-search-listbox"
        onChoose={() => undefined}
        onActiveChange={() => undefined}
        onRetry={() => undefined}
      />
    </Shell>
  ),
};

export const ErrorRateLimited: Story = {
  name: "error:rate-limited",
  render: () => (
    <Shell>
      <SearchSuggestions
        state="error:rate-limited"
        query="oak"
        options={[]}
        heading="Suggestions"
        activeIndex={-1}
        listboxId="story-search-listbox"
        onChoose={() => undefined}
        onActiveChange={() => undefined}
        onRetry={() => undefined}
      />
    </Shell>
  ),
};

export const RecentSearches: Story = {
  name: "recent searches",
  render: () => (
    <Shell>
      <SearchSuggestions
        state="ready"
        query=""
        options={recentOptions}
        heading="Recent searches"
        activeIndex={-1}
        listboxId="story-search-listbox"
        onChoose={() => undefined}
        onActiveChange={() => undefined}
        onRetry={() => undefined}
        onClearRecents={() => undefined}
      />
    </Shell>
  ),
};
