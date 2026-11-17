import { z } from "zod";
import type { AnyEndpoint } from "../../packages/api-contract/src/endpoints";

export interface OpenApiDocument {
  openapi: string;
  info: { title: string; version: string; description: string };
  paths: Record<string, Record<string, unknown>>;
  components: { schemas: Record<string, unknown> };
}

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function pascalCase(id: string): string {
  return id
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

function jsonSchema(schema: z.ZodType): Record<string, unknown> {
  const result = z.toJSONSchema(schema) as Record<string, unknown>;
  delete result.$schema;
  if (result.$defs) {
    throw new Error("Nested $defs are not supported yet; extend scripts/lib/contract.ts");
  }
  return result;
}

export function buildOpenApi(endpoints: readonly AnyEndpoint[]): OpenApiDocument {
  const document: OpenApiDocument = {
    openapi: "3.1.0",
    info: {
      title: "Hearth & Grain shop API",
      version: "0.0.0",
      description: "Generated from the zod endpoint registry. Fake data only.",
    },
    paths: {},
    components: { schemas: {} },
  };

  for (const endpoint of endpoints) {
    const name = pascalCase(endpoint.id);
    const operation: Record<string, unknown> = { operationId: endpoint.id, responses: {} };
    const parameters: Array<Record<string, unknown>> = [];

    if (endpoint.query) {
      const query = jsonSchema(endpoint.query);
      const required = new Set((query.required as string[] | undefined) ?? []);
      const properties = (query.properties ?? {}) as Record<string, Record<string, unknown>>;
      for (const [property, schema] of Object.entries(properties)) {
        parameters.push({
          name: property,
          in: "query",
          required: required.has(property) && schema.default === undefined,
          schema,
        });
      }
    }
    if (parameters.length > 0) operation.parameters = parameters;

    if (endpoint.body) {
      operation.requestBody = {
        required: true,
        content: { "application/json": { schema: jsonSchema(endpoint.body) } },
      };
    }

    const responseName = `${name}Response`;
    document.components.schemas[responseName] = jsonSchema(endpoint.response);
    (operation.responses as Record<string, unknown>)["200"] = {
      description: "OK",
      content: { "application/json": { schema: { $ref: `#/components/schemas/${responseName}` } } },
    };
    (operation.responses as Record<string, unknown>)["default"] = {
      description: "ApiError envelope ({ error, message, fieldErrors? })",
      content: { "application/json": { schema: { type: "object" } } },
    };

    const path = endpoint.path.replace(/:([a-zA-Z]+)/g, "{$1}");
    document.paths[path] = { [endpoint.method.toLowerCase()]: operation };
  }

  return document;
}

function renderScalar(value: Json): string {
  if (value === null) return "null";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value !== "string") throw new Error("Not a scalar");
  const plain = /^[A-Za-z0-9_][A-Za-z0-9 _./-]*$/.test(value);
  const ambiguous = /^(true|false|null|yes|no|on|off)$/i.test(value) || /^-?\d+(\.\d+)?$/.test(value);
  if (value.length === 0 || !plain || ambiguous) return JSON.stringify(value);
  return value;
}

function renderKey(key: string): string {
  const plain = /^[A-Za-z_][A-Za-z0-9 _./-]*$/.test(key);
  const ambiguous = /^(true|false|null|yes|no|on|off)$/i.test(key);
  return plain && !ambiguous ? key : JSON.stringify(key);
}

export function toYaml(value: Json, indent = 0): string {
  const pad = " ".repeat(indent);

  if (value === null || typeof value !== "object") return renderScalar(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value
      .map((item) => {
        if (item !== null && typeof item === "object") {
          const nested = toYaml(item, indent + 2);
          return `${pad}- ${nested.slice(indent + 2)}`;
        }
        return `${pad}- ${renderScalar(item)}`;
      })
      .join("\n");
  }

  if (Object.keys(value).length === 0) return "{}";

  return Object.entries(value)
    .map(([key, nested]) => {
      const name = renderKey(key);
      if (nested === null || typeof nested !== "object") {
        return `${pad}${name}: ${renderScalar(nested)}`;
      }
      if (Array.isArray(nested) && nested.length === 0) return `${pad}${name}: []`;
      if (!Array.isArray(nested) && Object.keys(nested).length === 0) return `${pad}${name}: {}`;
      return `${pad}${name}:\n${toYaml(nested, indent + 2)}`;
    })
    .join("\n");
}
