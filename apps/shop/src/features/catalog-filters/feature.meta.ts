import { defineFeature } from "../types";

/** Facet filters for the catalog. Rendered by catalog-listing; no route of its own. */
export default defineFeature({
  id: "catalog-filters",
  title: "Catalog filters",
  flag: "catalogFilters",
  routes: [],
  endpoints: ["products.list"],
  states: [],
  scenarios: {},
  dependsOn: [],
  tag: "catalog-filters",
});
