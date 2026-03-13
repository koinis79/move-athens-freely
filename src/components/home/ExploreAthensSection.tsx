const spots = [
  {
    src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
    caption: "Independence at every landmark",
    alt: "Person in wheelchair exploring outdoors",
  },
  {
    src: "https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=600&h=400&fit=crop",
    caption: "Quality time with loved ones",
    alt: "Senior couple enjoying outdoors together",
  },
  {
    src: "https://images.unsplash.com/photo-1502920514313-52581002a659?w=600&h=400&fit=crop",
    caption: "The Acropolis awaits",
    alt: "View of the Parthenon in Athens",
  },
  {
    src: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=600&h=400&fit=crop",
    caption: "Stroll through Plaka's charm",
    alt: "Charming Athens street scene",
  },
];

const ExploreAthensSection = () => (
  <section className="bg-gradient-to-b from-secondary/8 via-primary/5 to-background py-16 md:py-24">
    <div className="container">
      <h2 className="text-center text-3xl font-heading font-bold text-foreground md:text-4xl">
        Explore Athens Your Way
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
        Real freedom to discover the city at your own pace
      </p>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
        {spots.map((spot) => (
          <div
            key={spot.caption}
            className="group relative overflow-hidden rounded-lg shadow-md"
          >
            <img
              src={spot.src}
              alt={spot.alt}
              loading="lazy"
              className="aspect-[3/2] w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10">
              <p className="text-sm font-medium text-white">{spot.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ExploreAthensSection;
