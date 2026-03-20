import { Helmet } from "react-helmet-async";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

export function LocalBusiness() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Moveability",
        description: "Wheelchair and mobility equipment rental in Athens, Greece",
        url: "https://moveability.gr",
        telephone: "+30-210-951-1750",
        email: "info@moveability.gr",
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
        priceRange: "€€",
        openingHours: "Mo-Su 08:00-21:00",
      }}
    />
  );
}

const availabilityUrl: Record<string, string> = {
  Available: "https://schema.org/InStock",
  Limited: "https://schema.org/LimitedAvailability",
  Unavailable: "https://schema.org/OutOfStock",
};

interface ProductProps {
  name: string;
  description: string;
  image?: string;
  price: number;
  availability: string;
}

export function Product({ name, description, image, price, availability }: ProductProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        ...(image ? { image } : {}),
        brand: { "@type": "Brand", name: "Moveability" },
        offers: {
          "@type": "Offer",
          priceCurrency: "EUR",
          price: price.toFixed(2),
          availability: availabilityUrl[availability] ?? "https://schema.org/InStock",
          seller: { "@type": "Organization", name: "Moveability" },
        },
      }}
    />
  );
}

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

interface ArticleProps {
  title: string;
  description: string;
  datePublished: string;
  image: string;
}

export function Article({ title, description, datePublished, image }: ArticleProps) {
  const imageUrl = image.startsWith("http")
    ? image
    : `https://moveability.gr${image}`;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        datePublished,
        image: imageUrl,
        author: { "@type": "Organization", name: "Moveability" },
        publisher: {
          "@type": "Organization",
          name: "Moveability",
          logo: {
            "@type": "ImageObject",
            url: "https://moveability.gr/og-image.png",
          },
        },
      }}
    />
  );
}
