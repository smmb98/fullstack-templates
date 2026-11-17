import { describe, expect, it } from "vitest";
import type { FeatureMetaLike } from "./flows";
import { formatPlan, planReduction, resolveKeepSet } from "./reduce";

const base: FeatureMetaLike = {
  id: "catalog-listing",
  title: "Catalog listing",
  flag: "catalogListing",
  routes: ["/products"],
  endpoints: ["products.list"],
  states: [],
  scenarios: {},
  dependsOn: [],
  tag: "catalog-listing",
};

const detail: FeatureMetaLike = {
  ...base,
  id: "product-detail",
  title: "Product detail",
  flag: "productDetail",
  routes: ["/products/[slug]"],
  endpoints: ["products.get"],
  dependsOn: ["catalog-listing"],
  tag: "product-detail",
};

describe("reduce:plan", () => {
  it("keeps requested features and their dependencies", () => {
    expect(resolveKeepSet([base, detail], ["product-detail"])).toEqual([
      "catalog-listing",
      "product-detail",
    ]);
    expect(() => resolveKeepSet([base], ["nope"])).toThrow(/Unknown feature/);
  });

  it("lists everything that would be removed without deleting", () => {
    const plan = planReduction([base, detail], { catalogListing: true, productDetail: true }, {
      keep: ["catalog-listing"],
      themes: ["ink"],
      noLab: true,
    });
    expect(plan.kept).toEqual(["catalog-listing"]);
    expect(plan.removed).toEqual(["product-detail"]);
    expect(plan.folders).toEqual(["apps/shop/src/features/product-detail"]);
    expect(plan.routes).toEqual(["/products/[slug]"]);
    expect(plan.endpoints).toEqual(["products.get"]);
    expect(plan.flags).toEqual(["productDetail"]);
    expect(plan.cards).toEqual(["docs/flows/product-detail.md"]);
    expect(plan.specs).toEqual(["apps/shop/e2e/product-detail.spec.ts"]);
    expect(plan.notes.join(" ")).toContain("Theme Lab");
    expect(formatPlan(plan).join("\n")).toContain("dry run");
  });

  it("does not remove endpoints still used by a kept feature", () => {
    const plan = planReduction([base, detail], {}, { keep: ["catalog-listing"] });
    expect(plan.endpoints).toEqual(["products.get"]);
  });
});
