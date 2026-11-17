import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { VirtualFs } from "./flows";

const SKIP = new Set(["node_modules", ".next", ".turbo", ".git", "storybook-static", "test-results"]);

export function nodeFs(root: string): VirtualFs {
  const absolute = (path: string) => join(root, ...path.split("/"));
  const walk = (dir: string): string[] => {
    const base = absolute(dir);
    if (!existsSync(base)) return [];
    const files: string[] = [];
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (SKIP.has(entry.name)) continue;
      const child = `${dir}/${entry.name}`;
      if (entry.isDirectory()) files.push(...walk(child));
      else if (entry.isFile()) files.push(child);
    }
    return files.sort();
  };
  return {
    exists: (path) => existsSync(absolute(path)),
    readFile: (path) => readFileSync(absolute(path), "utf8"),
    walk,
  };
}
