import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  noIndex?: boolean;
}

/**
 * SEOHead Component
 * Dynamically updates document head for per-page SEO optimization
 * 
 * Usage:
 * <SEOHead 
 *   title="Dashboard" 
 *   description="Manage your creative business" 
 *   noIndex={true} // for private pages
 * />
 */
export function SEOHead({ 
  title, 
  description, 
  canonical,
  noIndex = false 
}: SEOHeadProps) {
  const baseTitle = "Artha | Professional Proposal & Invoice Builder for Creatives";
  const baseDescription = "Streamline your freelance business with Artha. Create stunning proposals, automate invoices, and manage clients with ease.";
  
  useEffect(() => {
    // Update title
    document.title = title ? `${title} | Artha` : baseTitle;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description || baseDescription);
    }
    
    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.rel = "canonical";
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical;
    }
    
    // Update robots meta for private pages
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (noIndex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.setAttribute("name", "robots");
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute("content", "noindex, nofollow");
    } else if (robotsMeta) {
      robotsMeta.setAttribute("content", "index, follow");
    }
    
    // Update OG title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", title ? `${title} | Artha` : baseTitle);
    }
    
    // Update OG description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute("content", description || baseDescription);
    }
    
    return () => {
      // Reset to defaults on unmount
      document.title = baseTitle;
    };
  }, [title, description, canonical, noIndex]);
  
  return null;
}

export default SEOHead;
