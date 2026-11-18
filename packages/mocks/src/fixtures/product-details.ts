import type { Product, ProductDetail, ProductSpec, ProductVariant } from "@fullstack-templates/api-contract";

/**
 * Hand-written detail copy for the products the demo links to most. Everything else gets
 * specs and care derived from its own fields, so no product ever shows lorem ipsum.
 */
interface DetailExtras {
  highlights: string[];
  specs?: ProductSpec[];
  care?: string[];
  leadTime?: string;
}

const extras: Record<string, DetailExtras> = {
  "oak-dining-table": {
    highlights: [
      "Solid white oak, joined without visible hardware",
      "Seats six at 180 cm, ten at 300 cm",
      "Hand-finished with a low-sheen hardwax oil",
    ],
    specs: [
      { label: "Material", value: "Solid white oak" },
      { label: "Finish", value: "Hardwax oil, matte" },
      { label: "Clearance", value: "68 cm" },
      { label: "Weight", value: "62 kg at 180 cm" },
      { label: "Origin", value: "Made in Portugal" },
    ],
    care: [
      "Dust with a dry cloth; wipe spills straight away.",
      "Oil twice a year with a hardwax oil to keep the grain sealed.",
    ],
    leadTime: "Made to order · ships in 6–8 weeks",
  },
  "alder-lounge-chair": {
    highlights: [
      "Steam-bent oak frame with a paper-cord seat",
      "Seat height of 38 cm suits most dining tables",
      "Cord is woven by hand, one chair at a time",
    ],
    specs: [
      { label: "Frame", value: "FSC-certified oak" },
      { label: "Seat", value: "Hand-woven paper cord" },
      { label: "Dimensions", value: "68 × 74 × 79 cm" },
      { label: "Seat height", value: "38 cm" },
    ],
    care: [
      "Dust the frame with a soft cloth.",
      "Keep the cord dry; blot spills rather than rubbing.",
    ],
  },
  "stoneware-serving-bowl": {
    highlights: [
      "Wheel-thrown in small batches",
      "Speckled matte glaze, no two pieces alike",
      "Oven safe to 220°C and dishwasher safe",
    ],
    specs: [
      { label: "Material", value: "High-fired stoneware" },
      { label: "Glaze", value: "Speckled matte cream" },
      { label: "Capacity", value: "1.4 L (Small), 3.2 L (Large)" },
      { label: "Origin", value: "Made in Stoke-on-Trent" },
    ],
    care: [
      "Dishwasher safe on a low heat cycle.",
      "Avoid sudden temperature changes; let it cool before washing.",
    ],
  },
  "hand-thrown-vase": {
    highlights: [
      "One-of-a-kind vessel, thrown on the wheel",
      "Raw clay exterior, sealed inside for water",
      "Small variations in shape are part of the piece",
    ],
    specs: [
      { label: "Material", value: "Terracotta" },
      { label: "Finish", value: "Raw clay, sealed interior" },
      { label: "Dimensions", value: "16 × 16 × 28 cm" },
      { label: "Origin", value: "Made in Portugal" },
    ],
    care: ["Wipe with a soft, damp cloth.", "Do not put it in the dishwasher."],
  },
  "brass-candle-holder": {
    highlights: [
      "Turned from solid brass",
      "Brushed finish that patinas with use",
      "Fits standard taper candles",
    ],
    specs: [
      { label: "Material", value: "Solid brass" },
      { label: "Finish", value: "Brushed, unlacquered" },
      { label: "Height", value: "12 cm" },
    ],
    care: [
      "Wipe with a dry cloth; polish only if you want an even shine.",
      "Unlacquered brass is meant to darken over time.",
    ],
  },
};

const careByMaterial: Array<[string, string]> = [
  ["linen", "Machine wash cold on a gentle cycle; line dry."],
  ["oak", "Dust with a dry cloth and oil once a year."],
  ["teak", "Rinse and scrub with a soft brush; oil yearly to keep the colour."],
  ["cedar", "Dust with a dry cloth; keep away from direct heat."],
  ["stoneware", "Dishwasher safe on a low heat cycle."],
  ["ceramic", "Dishwasher safe on a low heat cycle."],
  ["clay", "Wipe with a damp cloth; do not soak."],
  ["brass", "Wipe with a soft dry cloth; avoid abrasive cleaners."],
  ["steel", "Wipe with a soft dry cloth; avoid abrasive cleaners."],
  ["paper cord", "Keep dry; blot spills rather than rubbing."],
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function derivedSpecs(product: Product): ProductSpec[] {
  const specs: ProductSpec[] = [{ label: "Category", value: product.categoryPath.join(" / ") }];
  if (product.materials.length > 0) specs.push({ label: "Materials", value: product.materials.join(", ") });
  if (product.colors.length > 0) specs.push({ label: "Colours", value: product.colors.join(", ") });
  if (product.sizes.length > 0) specs.push({ label: "Sizes", value: product.sizes.join(", ") });
  if (product.brand) specs.push({ label: "Brand", value: product.brand });
  specs.push({ label: "SKU", value: product.id.toUpperCase() });
  return specs;
}

function derivedCare(product: Product): string[] {
  const lines = product.materials
    .map((material) => careByMaterial.find(([key]) => material.toLowerCase().includes(key))?.[1])
    .filter((line): line is string => Boolean(line));
  return [...new Set(lines)];
}

function derivedLeadTime(product: Product): string | null {
  if (product.stock === 0) return "Made to order · ships in 6–8 weeks";
  if (product.stock === 1) return "Only 1 left · ships in 2–3 days";
  if (product.stock === 2) return "Only 2 left · ships in 2–3 days";
  return null;
}

/**
 * Stock is split evenly across variants, remainder to the first. A product with fewer units
 * than variants therefore shows some variants as unavailable, which is the honest result.
 */
function buildVariants(product: Product): ProductVariant[] {
  const colors = product.colors.length > 0 ? product.colors : ["Natural"];
  const sizes = product.sizes.length > 0 ? product.sizes : ["One size"];
  const combos = colors
    .flatMap((color) => sizes.map((size) => ({ color, size })))
    .slice(0, 12);

  const base = Math.floor(product.stock / combos.length);
  const remainder = product.stock % combos.length;

  return combos.map(({ color, size }, index) => {
    const stock = base + (index < remainder ? 1 : 0);
    return {
      id: `${slugify(color)}--${slugify(size)}`,
      color,
      size,
      stock,
      inStock: product.inStock && stock > 0,
    };
  });
}

export function productDetailFor(product: Product): ProductDetail {
  // Large-scenario products are copies of a fixture with a suffix; reuse the base copy.
  const key = product.slug.replace(/-large-\d+$/, "");
  const extra = extras[key];

  return {
    ...product,
    highlights: extra?.highlights ?? [],
    specs: extra?.specs ?? derivedSpecs(product),
    care: extra?.care ?? derivedCare(product),
    variants: buildVariants(product),
    leadTime: extra?.leadTime ?? derivedLeadTime(product),
  };
}
