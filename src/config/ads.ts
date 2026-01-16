import { featureFlags } from "./features";

export const adsConfig = {
  enabled: featureFlags.ads.enabled,
  popUnder: {
    enabled: featureFlags.ads.popUnder,
    scriptSrc:
      "https://pl28480662.effectivegatecpm.com/5b/9e/bf/5b9ebf11a1c5d7a7e97f435c53621ae2.js",
    scriptId: "pop-under-ad-script",
    frequencyStorageKey: "popUnderAdLastShown",
    minIntervalMs: 300_000,
  },
  inline: {
    enabled: featureFlags.ads.inline,
    containerId: "container-9c9ea4fbff8dd33e714120c2cb2ec0d5",
    scriptId: "adsterra-native-9c9ea4fbff8dd33e714120c2cb2ec0d5",
    scriptSrc:
      "https://pl28463616.effectivegatecpm.com/9c9ea4fbff8dd33e714120c2cb2ec0d5/invoke.js",
    sessionStorageKey: "inlineAdShown",
    ariaLabel: "Sponsored content",
  },
};
