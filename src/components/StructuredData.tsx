import { Helmet } from "react-helmet-async";

const SITE = "https://movability.gr";
const LOGO = "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/movability-logo.png";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

/* ── LocalBusiness (homepage) ── */
export function LocalBusiness() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Movability",
        description:
          "Wheelchair and mobility equipment rental in Athens, Greece. Delivered to your hotel.",
        url: SITE,
        telephone: "+30-210-951-1750",
        email: "info@movability.gr",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Stadiou 31",
          addressLocality: "Athens",
          postalCode: "10559",
          addressCountry: "GR",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 37.9838,
          longitude: 23.7275,
        },
        areaServed: "Athens, Greece",
        priceRange: "€€",
        image: LOGO,
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "08:00",
          closes: "21:00",
        },
      }}
    />
  );
}

/* ── Product (equipment detail) ── */
interface ProductProps {
  name: string;
  description: string;
  image?: string;
  price: number;
  availability: string;
  categorySlug?: string;
  slug?: string;
}

const availabilityUrl: Record<string, string> = {
  Available: "https://schema.org/InStock",
  Limited: "https://schema.org/LimitedAvailability",
  Unavailable: "https://schema.org/OutOfStock",
};

export function Product({
  name,
  description,
  image,
  price,
  availability,
  categorySlug,
  slug,
}: ProductProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        ...(image ? { image } : {}),
        brand: { "@type": "Brand", name: "Movability" },
        offers: {
          "@type": "Offer",
          priceCurrency: "EUR",
          price: price.toFixed(2),
          availability:
            availabilityUrl[availability] ?? "https://schema.org/InStock",
          priceValidUntil: "2026-12-31",
          ...(categorySlug && slug
            ? { url: `${SITE}/equipment/${categorySlug}/${slug}` }
            : {}),
        },
      }}
    />
  );
}

/* ── FAQPage ── */
interface FAQPageProps {
  questions: { q: string; a: string }[];
}

export function FAQPage({ questions }: FAQPageProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      }}
    />
  );
}

/* ── Article ── */
interface ArticleProps {
  title: string;
  description: string;
  datePublished: string;
  image: string;
  slug?: string;
}

export function Article({
  title,
  description,
  datePublished,
  image,
  slug,
}: ArticleProps) {
  const imageUrl = image.startsWith("http") ? image : `${SITE}${image}`;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        datePublished,
        image: imageUrl,
        author: { "@type": "Organization", name: "Movability" },
        publisher: {
          "@type": "Organization",
          name: "Movability",
          logo: { "@type": "ImageObject", url: LOGO },
        },
        ...(slug
          ? { mainEntityOfPage: `${SITE}/accessible-athens/${slug}` }
          : {}),
      }}
    />
  );
}

/* ── BreadcrumbList ── */
interface BreadcrumbItem {
  name: string;
  href?: string;
}

export function BreadcrumbList({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          ...(item.href ? { item: `${SITE}${item.href}` } : {}),
        })),
      }}
    />
  );
}
