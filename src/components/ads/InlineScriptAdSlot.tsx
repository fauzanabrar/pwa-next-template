"use client";

import { useEffect, useRef, useState } from "react";
import { storage } from "@/lib/storage";

export type InlineScriptAdConfig = {
  enabled: boolean;
  containerId: string;
  scriptId: string;
  scriptSrc: string;
  sessionStorageKey?: string;
  ariaLabel?: string;
};

type InlineScriptAdSlotProps = {
  config: InlineScriptAdConfig;
  className?: string;
};

export function InlineScriptAdSlot({
  config,
  className,
}: InlineScriptAdSlotProps) {
  const injectedRef = useRef(false);
  const [shouldShow] = useState(() => {
    if (!config.enabled) {
      return false;
    }
    if (!config.sessionStorageKey) {
      return true;
    }
    return !storage.readSession(config.sessionStorageKey);
  });

  useEffect(() => {
    if (!shouldShow || !config.sessionStorageKey) {
      return;
    }
    storage.writeSession(config.sessionStorageKey, "true");
  }, [config.sessionStorageKey, shouldShow]);

  useEffect(() => {
    if (!config.enabled || !shouldShow || injectedRef.current) {
      return;
    }
    if (typeof document === "undefined") {
      return;
    }
    const container = document.getElementById(config.containerId);
    if (!container) {
      return;
    }
    if (document.getElementById(config.scriptId)) {
      injectedRef.current = true;
      return;
    }
    const script = document.createElement("script");
    script.id = config.scriptId;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = config.scriptSrc;
    const target = container.parentElement ?? document.body;
    target.appendChild(script);
    injectedRef.current = true;
  }, [config, shouldShow]);

  if (!config.enabled || !shouldShow) {
    return null;
  }

  return (
    <section className={className} aria-label={config.ariaLabel}>
      <div id={config.containerId} />
    </section>
  );
}
