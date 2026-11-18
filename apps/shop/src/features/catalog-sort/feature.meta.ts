import { defineFeature } from "../types";

/** Sort control for the catalog. Rendered by catalog-listing; no route of its own. */
export default defineFeature({
  id: "catalog-sort",
  title: "Catalog sort",
  flag: "catalogSort",
  routes: [],
  endpoints: ["products.list"],
  states: [],
  scenarios: {},
  dependsOn: [],
  tag: "catalog-sort",
});
