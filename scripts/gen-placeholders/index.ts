import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { products } from "../../packages/mocks/src/fixtures/products";
import { renderPlaceholder } from "../lib/placeholders";

const OUTPUT = "apps/shop/public/images/products";

function main() {
  const root = process.cwd();
  const dir = join(root, ...OUTPUT.split("/"));
  mkdirSync(dir, { recursive: true });

  let written = 0;
  for (const [index, product] of products.entries()) {
    const svg = renderPlaceholder({ slug: product.slug, title: product.title }, index);
    writeFileSync(join(dir, `${product.slug}.svg`), svg, "utf8");
    written += 1;
  }
  console.log(`gen-placeholders wrote ${written} deterministic SVG(s) to ${OUTPUT}`);
}

main();
