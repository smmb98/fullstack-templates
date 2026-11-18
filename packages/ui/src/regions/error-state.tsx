"use client";

import type { ApiErrorKind } from "@fullstack-templates/api-contract";
import { useEffect, useState } from "react";
import { errorCopy } from "../copy/states";
import { Button } from "../primitives/button";

export interface ErrorStateProps {
  kind: ApiErrorKind | "http";
  message?: string;
  retryAfter?: number;
  requestId?: string;
  onRetry?: () => void;
}

export function ErrorState({ kind, message, retryAfter, requestId, onRetry }: ErrorStateProps) {
  const copy = errorCopy[kind] ?? errorCopy.http;
  const [seconds, setSeconds] = useState(retryAfter ?? 0);

  useEffect(() => {
    setSeconds(retryAfter ?? 0);
  }, [retryAfter]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-lg border border-line bg-surface px-6 py-10 text-center">
      <h2 className="font-display text-xl text-ink">{copy.title}</h2>
      <p className="text-sm text-muted">{message ?? copy.description}</p>
      {requestId ? <p className="font-mono text-xs text-muted">Ref: {requestId}</p> : null}
      <Button onClick={onRetry} disabled={seconds > 0} className="mt-2">
        {seconds > 0 ? `Retry in ${seconds}s` : "Try again"}
      </Button>
    </div>
  );
}
