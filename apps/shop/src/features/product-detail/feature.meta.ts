import { defineFeature } from "../types";

/** Product page: gallery, variants, stock, bag action, details and structured data. */
export default defineFeature({
  id: "product-detail",
  title: "Product detail",
  flag: "productDetail",
  routes: ["/products/[slug]"],
  endpoints: ["products.detail"],
  states: [
    "loading",
    "ready",
    "partial",
    "error:not-found",
    "error:http",
    "error:network",
    "error:rate-limited",
    "error:parse",
  ],
  scenarios: {
    empty: "error:not-found",
    slow: "loading",
    partial: "partial",
    "error-404": "error:not-found",
    "error-500": "error:http",
    "rate-limit": "error:rate-limited",
    "bad-json": "error:parse",
  },
  dependsOn: [],
  tag: "product-detail",
});
