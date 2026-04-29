import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  noIndex?: boolean;
}

const SITE_URL = "https://arthawork.vercel.app";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-preview.jpg?v=5`;
const BASE_TITLE = "Artha | Proposal & Invoice Builder untuk Freelancer Indonesia";
const BASE_DESCRIPTION =
  "Artha membantu freelancer Indonesia membuat proposal yang lebih meyakinkan, invoice yang lebih cepat dibayar, dan workflow klien yang lebih rapi.";
const ROBOTS_PUBLIC = "index, follow, max-image-preview:large";

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element!.setAttribute(key, value);
  });
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element!.setAttribute(key, value);
  });
}

function upsertSchema(id: string, data: Record<string, unknown>) {
  let script = document.head.querySelector(
    `script[data-seo-schema="${id}"]`,
  ) as HTMLScriptElement | null;

  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seoSchema = id;
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

export function SEOHead({
  title,
  description,
  canonical,
  noIndex = false,
}: SEOHeadProps) {
  const resolvedTitle = title ? `${title} | Artha` : BASE_TITLE;
  const resolvedDescription = description || BASE_DESCRIPTION;
  const resolvedCanonical = canonical || SITE_URL;

  useEffect(() => {
    document.title = resolvedTitle;

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: resolvedDescription,
    });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: noIndex ? "noindex, nofollow" : ROBOTS_PUBLIC,
    });
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: "website",
    });
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: "Artha",
    });
    upsertMeta('meta[property="og:locale"]', {
      property: "og:locale",
      content: "id_ID",
    });
    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: resolvedTitle,
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: resolvedDescription,
    });
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: resolvedCanonical,
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: DEFAULT_OG_IMAGE,
    });
    upsertMeta('meta[property="og:image:secure_url"]', {
      property: "og:image:secure_url",
      content: DEFAULT_OG_IMAGE,
    });
    upsertMeta('meta[property="og:image:alt"]', {
      property: "og:image:alt",
      content: "Preview landing page Artha untuk freelancer Indonesia",
    });
    upsertMeta('meta[property="og:image:width"]', {
      property: "og:image:width",
      content: "1200",
    });
    upsertMeta('meta[property="og:image:height"]', {
      property: "og:image:height",
      content: "630",
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: resolvedTitle,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: resolvedDescription,
    });
    upsertMeta('meta[name="twitter:url"]', {
      name: "twitter:url",
      content: resolvedCanonical,
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: DEFAULT_OG_IMAGE,
    });
    upsertMeta('meta[name="twitter:image:alt"]', {
      name: "twitter:image:alt",
      content: "Preview landing page Artha",
    });
    upsertLink('link[rel="canonical"]', {
      rel: "canonical",
      href: resolvedCanonical,
    });
    upsertLink('link[rel="image_src"]', {
      rel: "image_src",
      href: DEFAULT_OG_IMAGE,
    });

    upsertSchema("software-application", {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Artha",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Proposal & Invoice Builder",
      operatingSystem: "Web",
      inLanguage: "id",
      url: resolvedCanonical,
      image: DEFAULT_OG_IMAGE,
      description: resolvedDescription,
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "IDR",
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "50000",
          priceCurrency: "IDR",
        },
      ],
    });

    return () => {
      document.title = BASE_TITLE;
    };
  }, [noIndex, resolvedCanonical, resolvedDescription, resolvedTitle]);

  return null;
}

export default SEOHead;
