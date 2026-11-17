import { describe, expect, it } from "vitest";
import { hashSlug, renderPlaceholder } from "./placeholders";

describe("placeholders", () => {
  it("is byte-identical for the same slug and index", () => {
    const first = renderPlaceholder({ slug: "alder-chair", title: "Alder chair" }, 3);
    const second = renderPlaceholder({ slug: "alder-chair", title: "Alder chair" }, 3);
    expect(first).toBe(second);
    expect(first).toContain('width="800"');
    expect(first).toContain("<title>Alder chair</title>");
  });

  it("changes with the slug and escapes XML", () => {
    expect(renderPlaceholder({ slug: "a", title: "A & B" }, 0)).not.toBe(
      renderPlaceholder({ slug: "b", title: "A & B" }, 0),
    );
    expect(renderPlaceholder({ slug: "a", title: "A & B" }, 0)).toContain("A &amp; B");
    expect(hashSlug("a")).not.toBe(hashSlug("b"));
  });
});
