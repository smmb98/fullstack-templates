import type { RegionState } from "@fullstack-templates/ui";

export interface FeatureNav {
  label: string;
  href: string;
  placement: "header" | "footer";
}

export interface FeatureMeta {
  id: string;
  title: string;
  flag: string;
  routes: string[];
  endpoints: string[];
  states: RegionState[];
  scenarios: Record<string, RegionState>;
  dependsOn: string[];
  tag: string;
  nav?: FeatureNav;
}

export function defineFeature(meta: FeatureMeta): FeatureMeta {
  return meta;
}
