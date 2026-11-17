import flags from "../../features.config.json";

/** Flags are static JSON so the build can tree-shake disabled features. */
export function isFeatureEnabled(flag: keyof typeof flags): boolean {
  return flags[flag] === true;
}
