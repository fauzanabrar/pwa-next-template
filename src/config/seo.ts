import type { Metadata } from "next";
import { appConfig } from "./app";
import { featureFlags } from "./features";

const metadataBase = new URL(appConfig.url);

export const seoConfig = {
  enabled: featureFlags.seo.enabled,
  indexable: featureFlags.seo.indexable,
  jsonLd: featureFlags.seo.jsonLd,
  title: `${appConfig.name} - Adaptive Practice`,
  description: appConfig.description,
  keywords: appConfig.keywords,
  metadataBase,
  openGraphImage: appConfig.socialImage,
  locale: appConfig.locale,
  verification: {
    google: "",
  },
};

export const buildMetadata = (): Metadata => {
  if (!seoConfig.enabled) {
    return {
      title: appConfig.name,
      description: appConfig.description,
    };
  }

  return {
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
    applicationName: appConfig.name,
    metadataBase: seoConfig.metadataBase,
    openGraph: {
      title: seoConfig.title,
      description: seoConfig.description,
      url: "/",
      siteName: appConfig.name,
      images: [
        {
          url: seoConfig.openGraphImage,
          width: 512,
          height: 512,
          alt: `${appConfig.name} logo`,
        },
      ],
      locale: seoConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoConfig.title,
      description: seoConfig.description,
      images: [seoConfig.openGraphImage],
    },
    robots: seoConfig.indexable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        }
      : {
          index: false,
          follow: false,
        },
    verification: seoConfig.verification.google
      ? { google: seoConfig.verification.google }
      : undefined,
    authors: [{ name: appConfig.author }],
  };
};
