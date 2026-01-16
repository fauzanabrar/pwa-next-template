import { MetadataRoute } from "next";
import { appConfig } from "@/config/app";
import { seoConfig } from "@/config/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!seoConfig.enabled || !seoConfig.indexable) {
    return [];
  }

  return [
    {
      url: appConfig.url,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
  ];
}
