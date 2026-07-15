import SEOHead from "@/components/SEOHead";
import ArticleCard from "@/components/articles/ArticleCard";
import { guides, blogPosts, type Article } from "@/data/articles";

const GUIDE_BASE = "/accessible-athens";
const BLOG_BASE = "/blog";
const GUIDE_LINK = "Read Guide →";

/** Flagship pieces shown in the highlighted "Start Here" band, in this order. */
const FEATURED_SLUGS = [
  "acropolis-wheelchair-guide",
  "athens-accessibility-honest-guide",
  "athens-airport-wheelchair-guide",
];

/**
 * Themed sections, driven by each article's `category` field. A section can
 * gather several categories so badges stay short while the page reads clean.
 * "Planning & Tips" is handled separately because it also surfaces blog posts.
 */
const SECTIONS: { icon: string; title: string; description: string; categories: string[] }[] = [
  {
    icon: "🏛️",
    title: "Sights, Food & Beaches",
    description: "Where to go, eat, and relax — across the city and along the coast.",
    categories: ["Attractions", "Dining", "Outdoors"],
  },
  {
    icon: "🦽",
    title: "Equipment Guides",
    description: "Choosing and renting the right mobility equipment.",
    categories: ["Equipment Guides"],
  },
  {
    icon: "🚇",
    title: "Getting Around",
    description: "Airport, cruise port, and public transport.",
    categories: ["Transport"],
  },
];

const isFeatured = (a: Article) => FEATURED_SLUGS.includes(a.slug);

const featured: Article[] = FEATURED_SLUGS
  .map((slug) => guides.find((g) => g.slug === slug))
  .filter((g): g is Article => Boolean(g));

const inCategories = (cats: string[]): Article[] =>
  guides.filter((g) => cats.includes(g.category) && !isFeatured(g));

/** Planning & Tips: the "Practical" guide(s) plus the three blog posts. */
const planningGuides = inCategories(["Practical", "Planning & Tips"]);

const SectionHeader = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <div className="mb-8 max-w-3xl">
    <h2 className="text-2xl font-heading font-bold text-foreground md:text-3xl">
      <span className="mr-2" aria-hidden="true">
        {icon}
      </span>
      {title}
    </h2>
    <p className="mt-2 text-muted-foreground">{description}</p>
  </div>
);

const AccessibleAthens = () => (
  <>
    <SEOHead
      title="Accessible Athens Guide – Wheelchair Travel Tips | Movability"
      description="Practical guides for wheelchair users visiting Athens. Acropolis access, accessible restaurants, metro info &amp; more."
    />

    {/* Hero */}
    <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16 md:py-20">
      <div className="container text-center">
        <h1 className="text-4xl font-heading font-extrabold tracking-tight text-foreground md:text-5xl">
          Accessible Athens Guide
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Practical, honest guides to help you explore Athens with confidence
        </p>
      </div>
    </section>

    {/* ⭐ Start Here — highlighted featured band */}
    {featured.length > 0 && (
      <section className="border-y border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background py-14 md:py-16">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 max-w-3xl">
            <h2 className="text-2xl font-heading font-bold text-foreground md:text-3xl">
              <span className="mr-2" aria-hidden="true">
                ⭐
              </span>
              Start Here
            </h2>
            <p className="mt-2 text-muted-foreground">
              New to accessible Athens? Begin with these.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((a) => (
              <ArticleCard
                key={a.slug}
                article={a}
                to={`${GUIDE_BASE}/${a.slug}`}
                linkLabel={GUIDE_LINK}
                className="ring-1 ring-primary/15 shadow-md"
              />
            ))}
          </div>
        </div>
      </section>
    )}

    {/* Themed sections */}
    <section className="bg-background py-16 md:py-20">
      <div className="container mx-auto max-w-5xl space-y-16">
        {SECTIONS.map((s) => {
          const items = inCategories(s.categories);
          if (items.length === 0) return null;
          return (
            <div key={s.title}>
              <SectionHeader icon={s.icon} title={s.title} description={s.description} />
              <div className="grid gap-8 sm:grid-cols-2">
                {items.map((a) => (
                  <ArticleCard
                    key={a.slug}
                    article={a}
                    to={`${GUIDE_BASE}/${a.slug}`}
                    linkLabel={GUIDE_LINK}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* 💡 Planning & Tips — practical guide(s) + blog posts (linking to /blog) */}
        <div>
          <SectionHeader
            icon="💡"
            title="Planning & Tips"
            description="Practical advice to read before you travel."
          />
          <div className="grid gap-8 sm:grid-cols-2">
            {planningGuides.map((a) => (
              <ArticleCard
                key={a.slug}
                article={a}
                to={`${GUIDE_BASE}/${a.slug}`}
                linkLabel={GUIDE_LINK}
              />
            ))}
            {blogPosts.map((a) => (
              <ArticleCard
                key={a.slug}
                article={a}
                to={`${BLOG_BASE}/${a.slug}`}
                linkLabel="Read Post →"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  </>
);

export default AccessibleAthens;
