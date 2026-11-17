"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { offlineCopy } from "../copy/states";
import { useOnlineStatus } from "./use-online-status";

export function OfflineBanner() {
  const online = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const previous = useRef(online);

  useEffect(() => {
    if (!online) {
      setWasOffline(true);
      setShowBack(false);
    } else if (previous.current === false && wasOffline) {
      setShowBack(true);
      const timer = setTimeout(() => setShowBack(false), 2500);
      previous.current = online;
      return () => clearTimeout(timer);
    }
    previous.current = online;
  }, [online, wasOffline]);

  if (online && !showBack) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 bg-warning px-4 py-3 text-sm font-medium text-white shadow-2"
    >
      <WifiOff aria-hidden="true" className="size-4" />
      {online ? offlineCopy.backOnline : offlineCopy.banner}
    </div>
  );
}
