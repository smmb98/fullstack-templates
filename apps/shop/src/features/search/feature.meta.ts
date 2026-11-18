import { defineFeature } from "../types";

/** Header search with debounced autosuggest and recent searches. No route of its own. */
export default defineFeature({
  id: "search",
  title: "Search",
  flag: "search",
  routes: [],
  endpoints: ["search.suggest"],
  states: ["loading", "ready", "empty:no-results", "error:network", "error:http", "error:rate-limited"],
  scenarios: {
    empty: "empty:no-results",
    slow: "loading",
    "error-500": "error:http",
    "rate-limit": "error:rate-limited",
  },
  dependsOn: [],
  tag: "search",
});
