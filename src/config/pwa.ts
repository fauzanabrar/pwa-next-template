import { appConfig } from "./app";
import { featureFlags } from "./features";

export const pwaConfig = {
  enabled: featureFlags.pwa.enabled,
  manifestPath: "/manifest.json",
  serviceWorkerPath: "/sw.js",
  themeColor: appConfig.themeColor,
};
