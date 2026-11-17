import { emptyCopy, type EmptyVariant } from "../copy/states";
import { Button } from "../primitives/button";

export interface EmptyStateProps {
  variant: EmptyVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ variant, title, description, actionLabel, onAction }: EmptyStateProps) {
  const copy = emptyCopy[variant];
  const label = actionLabel ?? copy.actionLabel;
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-lg border border-dashed border-line px-6 py-12 text-center">
      <h2 className="font-display text-xl text-ink">{title ?? copy.title}</h2>
      <p className="text-sm text-muted">{description ?? copy.description}</p>
      {label && onAction ? (
        <Button variant="secondary" onClick={onAction} className="mt-2">
          {label}
        </Button>
      ) : null}
    </div>
  );
}
