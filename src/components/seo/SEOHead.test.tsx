import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SEOHead } from "@/components/seo/SEOHead";

function upsertHeadElement(
  selector: string,
  create: () => HTMLElement,
): HTMLElement {
  const existing = document.head.querySelector(selector) as HTMLElement | null;
  if (existing) {
    return existing;
  }

  const element = create();
  document.head.appendChild(element);
  return element;
}

function resetHead() {
  document.head.innerHTML = "";
  document.title = "";

  upsertHeadElement('meta[name="description"]', () => {
    const node = document.createElement("meta");
    node.setAttribute("name", "description");
    return node;
  });

  upsertHeadElement('meta[property="og:title"]', () => {
    const node = document.createElement("meta");
    node.setAttribute("property", "og:title");
    return node;
  });

  upsertHeadElement('meta[property="og:description"]', () => {
    const node = document.createElement("meta");
    node.setAttribute("property", "og:description");
    return node;
  });
}

describe("SEOHead", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.title = "";
  });

  it("adds complete social sharing metadata for landing pages", () => {
    resetHead();

    render(
      <SEOHead
        title="Landing Page"
        description="Artha helps Indonesian freelancers send better proposals."
        canonical="https://arthawork.vercel.app/"
      />,
    );

    expect(document.title).toBe("Landing Page | Artha");
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://arthawork.vercel.app/",
    );
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute(
      "content",
      "https://arthawork.vercel.app/",
    );
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
      "content",
      "https://arthawork.vercel.app/og-preview.jpg?v=6",
    );
    expect(document.querySelector('meta[name="twitter:image"]')).toHaveAttribute(
      "content",
      "https://arthawork.vercel.app/og-preview.jpg?v=6",
    );
    expect(
      document.querySelector('script[data-seo-schema="software-application"]'),
    ).toBeInTheDocument();
  });

  it("marks private pages as noindex and restores crawlability for public pages", () => {
    resetHead();

    const { rerender } = render(<SEOHead title="Private" noIndex />);
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );

    rerender(<SEOHead title="Public" />);
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "index, follow, max-image-preview:large",
    );
  });
});
