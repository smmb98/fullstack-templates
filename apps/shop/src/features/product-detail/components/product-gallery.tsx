"use client";

import type { ImageAsset } from "@fullstack-templates/api-contract";
import { cn } from "@fullstack-templates/ui";
import { useState } from "react";

function ImageFallback({ title }: { title: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-subtle px-4 text-center text-muted">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-10 w-10 opacity-60"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="m21 15-4.5-4.5L9 18" />
      </svg>
      <span className="text-xs font-medium tracking-wide uppercase">Image coming soon</span>
      <span className="sr-only">No photo available for {title}.</span>
    </div>
  );
}

export interface ProductGalleryProps {
  images: ImageAsset[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<number[]>([]);
  const current = images[active] ?? images[0];
  const showThumbs = images.length > 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-line bg-subtle">
        {!current || failed.includes(active) ? (
          <ImageFallback title={title} />
        ) : (
          <img
            src={current.src}
            alt={current.alt}
            width={current.width}
            height={current.height}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {showThumbs ? (
        <ul aria-label={`${title} photos`} className="flex flex-wrap gap-2">
          {images.map((image, index) => (
            <li key={`${image.src}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1}: ${image.alt}`}
                aria-current={index === active ? "true" : undefined}
                className={cn(
                  "block h-16 w-20 overflow-hidden rounded-md border-2 bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  index === active ? "border-primary" : "border-line hover:border-muted",
                )}
              >
                {failed.includes(index) ? (
                  <span aria-hidden="true" className="block h-full w-full bg-subtle" />
                ) : (
                  <img
                    src={image.src}
                    alt=""
                    width={image.width}
                    height={image.height}
                    loading="lazy"
                    onError={() => setFailed((list) => [...list, index])}
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
