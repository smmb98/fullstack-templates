import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { productsListEndpoint } from "../../packages/api-contract/src/endpoints";
import { buildOpenApi, toYaml, type Json } from "../lib/contract";

const OUTPUT = "docs/contracts/shop.openapi.yaml";

function main() {
  const root = process.cwd();
  const document = buildOpenApi([productsListEndpoint]);
  const yaml = toYaml(document as unknown as Json) + "\n";

  const file = join(root, ...OUTPUT.split("/"));
  mkdirSync(join(root, "docs/contracts"), { recursive: true });
  writeFileSync(file, yaml, "utf8");
  console.log(`contract:gen wrote ${OUTPUT} (${Object.keys(document.paths).length} path(s))`);
}

main();
