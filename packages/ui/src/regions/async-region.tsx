"use client";

import { ApiError, type ApiErrorKind } from "@fullstack-templates/api-contract";
import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { EmptyVariant } from "../copy/states";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";

export type RegionState =
  | "loading"
  | "refetching"
  | "ready"
  | "empty:first-use"
  | "empty:no-results"
  | "empty:cleared"
  | "error:network"
  | "error:timeout"
  | "error:http"
  | "error:not-found"
  | "error:unauthorized"
  | "error:forbidden"
  | "error:rate-limited"
  | "error:parse"
  | "partial";

type QueryLike<T> = Pick<
  UseQueryResult<T, unknown>,
  "isPending" | "isError" | "isFetching" | "data" | "error" | "refetch"
>;

export interface AsyncRegionProps<T> {
  query?: QueryLike<T>;
  state?: RegionState;
  data?: T;
  isEmpty?: (data: T) => boolean;
  emptyVariant?: EmptyVariant;
  skeleton: ReactNode;
  children: (data: T) => ReactNode;
  testId?: string;
  errorMessage?: string;
  onRetry?: () => void;
  /** Distinct action for empty states (e.g. clear filters); defaults to retry. */
  onEmptyAction?: () => void;
}

function errorKind(error: unknown): ApiErrorKind {
  if (error instanceof ApiError) {
    return error.kind === "validation" ? "http" : error.kind;
  }
  return "http";
}

function resolveState<T>(
  props: AsyncRegionProps<T>,
): { state: RegionState; data: T | undefined; error?: unknown } {
  if (props.state) return { state: props.state, data: props.data };
  const query = props.query;
  if (!query) return { state: "ready", data: props.data };

  if (query.isPending) return { state: "loading", data: query.data };
  if (query.isError) {
    return { state: `error:${errorKind(query.error)}` as RegionState, data: query.data, error: query.error };
  }
  if (query.data !== undefined && props.isEmpty?.(query.data)) {
    return { state: `empty:${props.emptyVariant ?? "first-use"}` as RegionState, data: query.data };
  }
  if (query.data && typeof query.data === "object" && "partial" in query.data && query.data.partial) {
    return { state: "partial", data: query.data };
  }
  if (query.isFetching) return { state: "refetching", data: query.data };
  return { state: "ready", data: query.data };
}

export function AsyncRegion<T>(props: AsyncRegionProps<T>) {
  const { state, data, error } = resolveState(props);
  const testId = props.testId ?? "async-region";
  const retry =
    props.onRetry ??
    (() => {
      void props.query?.refetch();
    });

  let content: ReactNode;
  if (state === "loading") {
    content = props.skeleton;
  } else if (state.startsWith("empty:")) {
    content = (
      <EmptyState
        variant={state.slice("empty:".length) as EmptyVariant}
        onAction={props.onEmptyAction ?? retry}
      />
    );
  } else if (state.startsWith("error:")) {
    const apiError = error instanceof ApiError ? error : undefined;
    content = (
      <ErrorState
        kind={state.slice("error:".length) as ApiErrorKind}
        message={props.errorMessage ?? apiError?.message}
        retryAfter={apiError?.retryAfter}
        requestId={apiError?.requestId}
        onRetry={retry}
      />
    );
  } else if (data !== undefined) {
    content = (
      <>
        {state === "refetching" ? (
          <div
            aria-hidden="true"
            className="h-0.5 w-full animate-pulse rounded-full bg-primary"
          />
        ) : null}
        {state === "partial" ? (
          <p
            role="status"
            className="mb-4 rounded-md border border-line bg-subtle px-4 py-3 text-sm text-muted"
          >
            Some sections could not load. Everything else is up to date.
          </p>
        ) : null}
        {props.children(data)}
      </>
    );
  } else {
    content = props.skeleton;
  }

  return (
    <div
      data-testid={testId}
      data-state={state}
      aria-busy={state === "loading" || state === "refetching"}
    >
      {content}
    </div>
  );
}
