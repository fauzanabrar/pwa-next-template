"use client";

import { adsConfig } from "@/config/ads";

type ScriptTargetProvider = () => HTMLElement | null;
type StorageProvider = () => Storage | null;

export type PopUnderAdConfig = {
  scriptSrc: string;
  scriptId: string;
  frequencyStorageKey: string;
  minIntervalMs: number;
  storageProvider?: StorageProvider;
  appendTargetProvider?: ScriptTargetProvider;
};

const defaultStorageProvider: StorageProvider = () =>
  typeof window !== "undefined" ? window.localStorage : null;

const defaultAppendTargetProvider: ScriptTargetProvider = () =>
  typeof document !== "undefined"
    ? document.body ?? document.head ?? document.documentElement
    : null;

const DEFAULT_POP_UNDER_CONFIG: PopUnderAdConfig = {
  scriptSrc: adsConfig.popUnder.scriptSrc,
  scriptId: adsConfig.popUnder.scriptId,
  frequencyStorageKey: adsConfig.popUnder.frequencyStorageKey,
  minIntervalMs: adsConfig.popUnder.minIntervalMs,
  storageProvider: defaultStorageProvider,
  appendTargetProvider: defaultAppendTargetProvider,
};

const isBrowser = () =>
  typeof window !== "undefined" && typeof document !== "undefined";

const hasRecentAd = (
  storage: Storage,
  key: string,
  minIntervalMs: number
): boolean => {
  const lastShown = storage.getItem(key);
  if (!lastShown) {
    return false;
  }

  const previousTimestamp = Number(lastShown);
  if (Number.isNaN(previousTimestamp)) {
    return false;
  }

  return Date.now() - previousTimestamp < minIntervalMs;
};

const recordAdTimestamp = (storage: Storage, key: string) => {
  storage.setItem(key, Date.now().toString());
};

/** Returns a reusable pop-under controller that can be configured per project. */
export function createPopUnderAd(configOverrides?: Partial<PopUnderAdConfig>) {
  const config: PopUnderAdConfig = {
    ...DEFAULT_POP_UNDER_CONFIG,
    ...configOverrides,
  };

  const storageProvider = config.storageProvider ?? defaultStorageProvider;
  const appendTargetProvider =
    config.appendTargetProvider ?? defaultAppendTargetProvider;

  const show = () => {
    if (!isBrowser()) {
      return;
    }

    const storage = storageProvider();
    const target = appendTargetProvider();

    if (!storage || !target) {
      return;
    }

    if (hasRecentAd(storage, config.frequencyStorageKey, config.minIntervalMs)) {
      return;
    }

    if (document.getElementById(config.scriptId)) {
      return;
    }

    const script = document.createElement("script");
    script.id = config.scriptId;
    script.src = config.scriptSrc;
    script.async = true;
    target.appendChild(script);

    recordAdTimestamp(storage, config.frequencyStorageKey);
  };

  return { show };
}

/** Default instance that mirrors the configured behavior. */
export const popUnderAd = createPopUnderAd(DEFAULT_POP_UNDER_CONFIG);
export const defaultPopUnderAd = popUnderAd;
