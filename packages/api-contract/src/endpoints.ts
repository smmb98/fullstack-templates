import type { z } from "zod";
import type { ScenarioName } from "./scenarios";
import { scenarioNames } from "./scenarios";
import { productListQuerySchema, productListResponseSchema } from "./schemas/product";

export interface EndpointDefinition {
  id: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  query?: z.ZodType;
  body?: z.ZodType;
  response: z.ZodType;
  scenarios: readonly ScenarioName[];
}

export const productsListEndpoint = {
  id: "products.list",
  method: "GET",
  path: "/products",
  query: productListQuerySchema,
  response: productListResponseSchema,
  scenarios: scenarioNames,
} satisfies EndpointDefinition;

export const endpoints = {
  productsList: productsListEndpoint,
} as const;

export type AnyEndpoint = EndpointDefinition;

export type EndpointQuery<E extends AnyEndpoint> = E extends { query: infer Q }
  ? Q extends z.ZodType
    ? z.input<Q>
    : Record<string, never>
  : Record<string, never>;

export type EndpointBody<E extends AnyEndpoint> = E extends { body: infer B }
  ? B extends z.ZodType
    ? z.input<B>
    : undefined
  : undefined;

export type EndpointResponse<E extends AnyEndpoint> = z.infer<E["response"]>;

export interface EndpointInput<E extends AnyEndpoint> {
  query?: EndpointQuery<E>;
  body?: EndpointBody<E>;
}
