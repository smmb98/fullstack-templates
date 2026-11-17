import { describe, expect, it } from "vitest";
import { productsListEndpoint } from "../../packages/api-contract/src/endpoints";
import { buildOpenApi, toYaml, type Json } from "./contract";

describe("contract:gen", () => {
  it("builds an OpenAPI document from the endpoint registry", () => {
    const document = buildOpenApi([productsListEndpoint]);
    expect(document.openapi).toBe("3.1.0");
    const get = document.paths["/products"].get as Record<string, unknown>;
    expect(get.operationId).toBe("products.list");
    expect(document.components.schemas.ProductsListResponse).toBeTruthy();
    const parameters = get.parameters as Array<{ name: string; required: boolean }>;
    expect(parameters.map((parameter) => parameter.name)).toEqual(
      expect.arrayContaining(["page", "pageSize", "sort", "q"]),
    );
  });

  it("renders YAML with nested arrays and objects", () => {
    const value: Json = {
      openapi: "3.1.0",
      paths: { "/products": { get: { parameters: [{ name: "page", schema: { type: "integer" } }] } } },
    };
    const yaml = toYaml(value);
    expect(yaml).toContain("openapi: 3.1.0");
    expect(yaml).toContain("- name: page");
    expect(yaml).toContain("schema:");
    expect(yaml).toContain("type: integer");
    expect(yaml).toContain('"/products":');
  });
});
