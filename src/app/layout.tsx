import type { Metadata, Viewport } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { appConfig } from "@/config/app";
import { buildMetadata, seoConfig } from "@/config/seo";
import { pwaConfig } from "@/config/pwa";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const baseMetadata = buildMetadata();

export const metadata: Metadata = {
  ...baseMetadata,
  applicationName: appConfig.name,
  manifest: pwaConfig.enabled ? pwaConfig.manifestPath : undefined,
  appleWebApp: pwaConfig.enabled
    ? {
        capable: true,
        title: appConfig.name,
        statusBarStyle: "default",
      }
    : undefined,
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: appConfig.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd =
    seoConfig.enabled && seoConfig.jsonLd
      ? {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: appConfig.name,
          description: appConfig.description,
          url: appConfig.url,
          applicationCategory: "EducationalApplication",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          author: {
            "@type": "Organization",
            name: appConfig.author,
          },
          inLanguage: appConfig.locale,
        }
      : null;

  return (
    <html lang={appConfig.locale}>
      <head>
        {jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        ) : null}
      </head>
      <body className={`${outfit.variable} ${spaceGrotesk.variable}`}>
        <ServiceWorkerRegister
          enabled={pwaConfig.enabled}
          path={pwaConfig.serviceWorkerPath}
        />
        {children}
      </body>
    </html>
  );
}
