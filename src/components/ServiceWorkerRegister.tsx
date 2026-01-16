"use client";

import { useEffect } from "react";

type ServiceWorkerRegisterProps = {
  enabled?: boolean;
  path?: string;
};

export default function ServiceWorkerRegister({
  enabled = true,
  path = "/sw.js",
}: ServiceWorkerRegisterProps) {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (!("serviceWorker" in navigator)) {
      return;
    }
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const onLoad = () => {
      navigator.serviceWorker.register(path).catch(() => {
        // Ignore registration errors; the app still works without offline cache.
      });
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, [enabled, path]);

  return null;
}
