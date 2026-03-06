export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author?: string;
  image?: string;
  body: string[];
}

/* ── Accessible Athens guides ───────────────────────────── */
export const guides: Article[] = [
  {
    slug: "acropolis",
    title: "Is the Acropolis Wheelchair Accessible?",
    excerpt:
      "Everything you need to know about visiting the Acropolis with a wheelchair or mobility aid — ramps, elevators, and what to expect.",
    date: "2026-01-15",
    body: [
      "The Acropolis of Athens has undergone significant accessibility improvements in recent years. A cement pathway and an elevator now provide step-free access from the base to the summit, allowing wheelchair users and those with limited mobility to reach the Parthenon plateau.",
      "The elevator is located on the north slope and operates during regular visiting hours. It can accommodate standard manual and power wheelchairs. Staff are available to assist, and we recommend arriving early to avoid peak crowds, especially between 10:00 and 14:00 during summer months.",
      "The pathways on top are mostly smooth stone, though some areas can be uneven. A companion is recommended for power wheelchair users due to occasional inclines. The Acropolis Museum, located nearby, is fully wheelchair accessible with ramps, elevators, and accessible restrooms on every floor.",
      "We recommend renting a lightweight manual wheelchair or a compact mobility scooter for your Acropolis visit. Our team can advise on the best equipment based on your specific needs — just reach out when booking.",
    ],
  },
  {
    slug: "museums",
    title: "Accessible Museums in Athens",
    excerpt:
      "A curated list of Athens' most wheelchair-friendly museums, including the National Archaeological Museum and the Benaki.",
    date: "2026-01-28",
    body: [
      "Athens is home to some of the world's greatest museums, and many have made impressive strides in accessibility. Whether you're interested in ancient artifacts, modern art, or Greek history, there's an accessible museum experience waiting for you.",
      "The Acropolis Museum is the gold standard — fully step-free with elevators, wide corridors, accessible restrooms, and even tactile exhibits for visually impaired visitors. The National Archaeological Museum has ramp access and an elevator covering all floors, though some galleries have narrower passages.",
      "The Benaki Museum of Greek Culture offers step-free access to most floors and has an accessible entrance on the side of the building. The Museum of Cycladic Art is similarly well-equipped, with a modern elevator and spacious galleries perfect for wheelchair navigation.",
      "We suggest visiting during weekday mornings for a quieter, more comfortable experience. If you need a wheelchair or scooter for your museum day, we deliver directly to your hotel so you're ready to go.",
    ],
  },
  {
    slug: "restaurants",
    title: "Accessible Restaurants in Plaka & Monastiraki",
    excerpt:
      "Where to eat in Athens' most popular neighborhoods if you use a wheelchair, rollator, or mobility scooter.",
    date: "2026-02-10",
    body: [
      "Plaka and Monastiraki are Athens' most charming and popular dining neighborhoods — but cobblestone streets and narrow alleys can be challenging for mobility equipment users. The good news is that many restaurants in these areas are making accessibility a priority.",
      "Several restaurants on Adrianou Street (the main pedestrian thoroughfare) offer step-free entrances and spacious outdoor seating ideal for wheelchairs and scooters. Look for places with smooth patio areas rather than raised terraces.",
      "In Monastiraki Square, many cafés and tavernas have ground-level entrances. The area around the Monastiraki metro station is relatively flat and navigable. For Plaka, stick to the lower streets closer to Ermou — the upper Plaka streets become steep and cobbled.",
      "We maintain a growing list of verified accessible restaurants and are happy to share personalized recommendations based on your location and cuisine preferences. Just ask when you book your equipment!",
    ],
  },
  {
    slug: "beaches",
    title: "Accessible Beaches Near Athens",
    excerpt:
      "Discover beaches along the Athenian Riviera with ramps, accessible changing rooms, and Seatrac systems.",
    date: "2026-02-20",
    body: [
      "The Athenian Riviera stretches along the Saronic Gulf south of the city center, offering beautiful beaches that are increasingly wheelchair accessible. Several beaches now feature Seatrac systems — motorized ramps that allow wheelchair users to enter the sea independently.",
      "Voula Beach (A' and B') is one of the best-equipped accessible beaches near Athens. It has paved pathways to the waterline, a Seatrac system, accessible changing rooms, and adapted shower facilities. The beach is easily reached by tram from Syntagma Square.",
      "Alimos Beach and parts of Glyfada Beach also offer accessible facilities including ramps and adapted restrooms. In the summer months, many organized beaches along the coast provide beach wheelchairs available free of charge.",
      "If you're planning a beach day, we can deliver a beach-friendly wheelchair or a compact scooter to your hotel the morning of your trip. The coastal tram line is fully accessible, making it easy to hop between beaches.",
    ],
  },
  {
    slug: "public-transport",
    title: "Athens Public Transport Accessibility Guide",
    excerpt:
      "Metro, tram, and bus accessibility in Athens — which lines are step-free, how to navigate, and tips for a smooth ride.",
    date: "2026-03-01",
    body: [
      "Athens' public transport system has come a long way in terms of accessibility. The metro, in particular, is one of the most wheelchair-friendly in Europe — all three lines and every station are fully step-free with elevators, tactile paving, and audio announcements.",
      "The tram connecting Syntagma to the southern coast (Voula, Glyfada) is also fully accessible. All tram stops have level boarding, and there's designated wheelchair space inside each car. The tram is a great option for reaching the Athenian Riviera beaches.",
      "City buses are more variable. Newer buses (particularly on major routes) are low-floor with ramps, but older vehicles on some routes may not be accessible. The Athens Urban Transport Organisation (OASA) website lists which routes use accessible buses.",
      "Our top tip: use the metro and tram as your primary transport. They're reliable, air-conditioned, and consistently accessible. If you need to reach somewhere off the rail network, we recommend accessible taxi services — ask us for recommendations when you book.",
    ],
  },
  {
    slug: "airport-transfer",
    title: "Getting from Athens Airport with Mobility Equipment",
    excerpt:
      "How to arrange an accessible transfer from Athens International Airport to your hotel — options, costs, and tips.",
    date: "2026-03-05",
    body: [
      "Athens International Airport (Eleftherios Venizelos) is fully wheelchair accessible. From the moment you land, you'll find elevators, accessible restrooms, and assistance desks throughout the terminal. Airlines provide wheelchair assistance through the airport — request this when booking your flight.",
      "For getting to your hotel, you have several accessible options. The metro Line 3 runs directly from the airport to the city center (Syntagma, Monastiraki) in about 40 minutes, and all stations are fully step-free.",
      "If you prefer a private transfer, several Athens taxi companies operate wheelchair-accessible vehicles (WAVs). We can recommend trusted partners who offer reliable airport-to-hotel transfers with vehicles that accommodate wheelchairs and scooters.",
      "We also offer direct airport delivery — we can meet you at arrivals with your rental equipment so you're set from the moment you land. Just select 'Athens Airport' as your delivery zone when booking. The delivery fee is €30 and includes equipment demonstration on the spot.",
    ],
  },
];

/* ── Blog posts ─────────────────────────────────────────── */
export const blogPosts: Article[] = [
  {
    slug: "5-tips-wheelchair-travel-greece",
    title: "5 Tips for Traveling with a Wheelchair in Greece",
    excerpt:
      "Practical advice from our team on making your Greek holiday smoother, more comfortable, and more enjoyable.",
    date: "2026-02-05",
    author: "Moveability Team",
    body: [
      "Traveling to Greece with a wheelchair doesn't have to be daunting. With a bit of planning and the right local knowledge, you can enjoy everything this incredible country has to offer. Here are our top five tips.",
      "First, book your mobility equipment in advance. Peak season (April–October) means high demand. Reserving your wheelchair, scooter, or rollator at least 48 hours ahead guarantees availability and gives us time to deliver to your accommodation.",
      "Second, choose your accommodation wisely. Many newer Athens hotels are fully accessible, but it's worth confirming specifics like roll-in showers and elevator access before booking. We maintain a list of verified accessible hotels — just ask.",
      "Third, embrace public transport. Athens' metro is excellent for wheelchair users — fully step-free with elevators at every station. The tram to the coast is equally accessible. These are often faster and more reliable than taxis for getting around.",
    ],
  },
  {
    slug: "what-to-pack-accessible-trip-athens",
    title: "What to Pack for an Accessible Trip to Athens",
    excerpt:
      "A packing checklist tailored for travelers who use wheelchairs, scooters, or other mobility equipment.",
    date: "2026-02-18",
    author: "Moveability Team",
    body: [
      "Packing for an accessible trip to Athens requires a few extra considerations beyond the usual sunscreen and camera. Here's what our team recommends based on years of helping travelers navigate the city.",
      "Sun protection is essential — Athens gets very hot in summer. Pack a wide-brimmed hat, high-SPF sunscreen, and a reusable water bottle. If you're using a wheelchair or scooter, consider a clip-on umbrella for shade during long outdoor explorations.",
      "Comfortable, supportive footwear matters even if you primarily use a wheelchair. You may need to transfer or walk short distances, and Athens' stone surfaces can be slippery. Bring anti-fatigue gloves if you self-propel a manual wheelchair — the terrain can be demanding.",
      "Don't worry about bringing bulky mobility equipment from home. We deliver everything you need — wheelchairs, scooters, rollators — directly to your hotel. This saves luggage space and the hassle of airline equipment handling.",
    ],
  },
  {
    slug: "athens-becoming-more-accessible",
    title: "Why Athens Is Becoming More Accessible Every Year",
    excerpt:
      "From the Acropolis elevator to metro upgrades — how Athens is investing in accessibility for all visitors.",
    date: "2026-03-02",
    author: "Moveability Team",
    body: [
      "Athens has historically been a challenging city for visitors with mobility needs. Steep hills, ancient cobblestone streets, and older infrastructure created real barriers. But over the past decade, the city has made remarkable progress.",
      "The installation of an elevator at the Acropolis was a landmark moment — literally and figuratively. For the first time, wheelchair users could independently access one of the world's most important archaeological sites. The adjacent Acropolis Museum was built from the ground up with universal design principles.",
      "The Athens metro, completed for the 2004 Olympics, set a new standard. Every station has elevators, tactile guidance, and audio announcements. The coastal tram is similarly modern and accessible. Newer bus fleets feature low floors and boarding ramps.",
      "Looking ahead, the city continues to invest. Pedestrian zones are being expanded and repaved with smooth surfaces. New hotels are required to meet accessibility standards. And organizations like ours are filling the gaps by providing equipment, local guides, and honest accessibility information.",
    ],
  },
];
