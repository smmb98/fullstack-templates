import { describe, expect, it } from "vitest";
import { productsListEndpoint } from "@showcase/api-contract";
import { executeMock } from "./engine";
import { productsListHandler } from "./handlers/products-list";

const base = "http://localhost/api/products";

describe("scenario protocol", () => {
  it("defaults to ok and paginates deterministically", async () => {
    const result = await executeMock(productsListEndpoint, productsListHandler, {
      url: `${base}?pageSize=5&page=2`,
      headers: {},
    });
    const body = result.body as { items: unknown[]; page: number; total: number };
    expect(result.status).toBe(200);
    expect(body.page).toBe(2);
    expect(body.items).toHaveLength(5);
    expect(body.total).toBeGreaterThan(5);
  });

  it("supports per-endpoint scenario overrides and rejects typos", async () => {
    const empty = await executeMock(productsListEndpoint, productsListHandler, {
      url: `${base}?scenario=products.list:empty`,
      headers: {},
    });
    expect((empty.body as { items: unknown[] }).items).toHaveLength(0);

    const typo = await executeMock(productsListEndpoint, productsListHandler, {
      url: `${base}?scenario=error-999`,
      headers: {},
    });
    expect(typo.status).toBe(400);
    expect((typo.body as { error: string }).error).toBe("unsupported-scenario");
  });

  it("fails flaky once and succeeds when x-attempt is set", async () => {
    const first = await executeMock(productsListEndpoint, productsListHandler, {
      url: `${base}?scenario=flaky`,
      headers: {},
    });
    expect(first.status).toBe(503);
    const retry = await executeMock(productsListEndpoint, productsListHandler, {
      url: `${base}?scenario=flaky`,
      headers: { "x-attempt": "1" },
    });
    expect(retry.status).toBe(200);
  });

  it("returns raw malformed JSON for bad-json", async () => {
    const result = await executeMock(productsListEndpoint, productsListHandler, {
      url: `${base}?scenario=bad-json`,
      headers: {},
    });
    expect(result.rawBody).toBe('{"items":[');
  });
});
