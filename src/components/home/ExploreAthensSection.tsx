const spots = [
  { caption: "Visiting the Acropolis Museum", alt: "Accessible entrance of the Acropolis Museum in Athens" },
  { caption: "Strolling through Plaka", alt: "Cobblestone streets of Plaka neighborhood in Athens" },
  { caption: "Enjoying the Athens Riviera", alt: "Seaside promenade along the Athens Riviera coast" },
  { caption: "Exploring Monastiraki Square", alt: "Bustling Monastiraki Square with flea market stalls" },
];

const ExploreAthensSection = () => (
  <section className="bg-gradient-to-b from-primary/5 via-primary/3 to-background py-16 md:py-24">
    <div className="container">
      <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
        Explore Athens Your Way
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
        Discover the best of Athens with full accessibility — from ancient landmarks to vibrant neighborhoods.
      </p>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {spots.map((spot) => (
          <div key={spot.caption} className="group">
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted flex items-center justify-center">
              <span className="px-4 text-center text-sm text-muted-foreground">{spot.alt}</span>
            </div>
            <p className="mt-3 text-center text-sm font-medium text-foreground">
              {spot.caption}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ExploreAthensSection;
