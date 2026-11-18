import { describe, expect, it } from "vitest";
import { readSortParam, sortParamValue } from "./sort";

describe("catalog sort url state", () => {
  it("accepts every known sort and drops the default", () => {
    expect(readSortParam("price-asc")).toBe("price-asc");
    expect(readSortParam("newest")).toBe("newest");
    expect(readSortParam("best-selling")).toBe("best-selling");
    expect(readSortParam("relevance")).toBeUndefined();
  });

  it("falls back to relevance for missing or unknown values", () => {
    expect(readSortParam(undefined)).toBeUndefined();
    expect(readSortParam("")).toBeUndefined();
    expect(readSortParam("cheapest")).toBeUndefined();
    expect(readSortParam("PRICE-ASC")).toBeUndefined();
  });

  it("keeps relevance out of the URL", () => {
    expect(sortParamValue("price-desc")).toBe("price-desc");
    expect(sortParamValue("relevance")).toBeUndefined();
    expect(sortParamValue(undefined)).toBeUndefined();
  });
});
