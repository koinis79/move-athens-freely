// Guide images
import acropolisImg from "@/assets/guides/acropolis.jpg";
import museumsImg from "@/assets/guides/museums.jpg";
import restaurantsImg from "@/assets/guides/restaurants.jpg";
import beachesImg from "@/assets/guides/beaches.jpg";
import publicTransportImg from "@/assets/guides/public-transport.jpg";
import airportTransferImg from "@/assets/guides/airport-transfer.jpg";
// Blog images
import wheelchairTravelImg from "@/assets/blog/wheelchair-travel-greece.jpg";
import packingImg from "@/assets/blog/packing-accessible-trip.jpg";
import athensAccessibleImg from "@/assets/blog/athens-accessible.jpg";

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author?: string;
  image: string;
  body: string[];
  category: string;
  takeaways?: string[];
  /** Raw markdown — rendered instead of body[] when present */
  content?: string;
  /** Equipment slugs to show as CTAs at the end of the article */
  recommendedEquipment?: string[];
}

/* ── Accessible Athens guides ───────────────────────────── */
export const guides: Article[] = [
  {
    slug: "piraeus-cruise-port-wheelchair-guide",
    title: "Piraeus Cruise Port: Wheelchair & Mobility Scooter Guide for Your Athens Shore Day",
    excerpt:
      "Cruising to Athens? Get off the ship with ease and have a wheelchair, scooter, or rollator delivered right to Piraeus cruise terminal for your shore day \u2014 from \u20ac49, reserved before you sail.",
    date: "2026-07-15",
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/equipment-images/articles/piraeus-cruise-guide.webp",
    category: "Transport",
    recommendedEquipment: ["lightweight-folding-wheelchair", "foldable-travel-scooter", "rollator-walker"],
    takeaways: [
      "We deliver rental wheelchairs, scooters, and rollators to your Piraeus terminal \u2014 \u20ac25, coordinated by WhatsApp",
      "Reserve before you sail; we hand over at disembarkation and collect before you re-board",
      "Metro Line 1 from Piraeus to the Acropolis area is step-free \u2014 25 minutes, \u20ac1.20",
    ],
    body: [],
    content: `
Docking at Piraeus for a day in Athens? A cruise stop is short, and the last thing you want is to spend it worrying about mobility. Whether you use a wheelchair full-time or just need help covering Athens' long, uneven distances, a little planning before you sail makes your shore day effortless.

This guide covers both sides of it: the logistics of getting off the ship and into the city, and how to have a rental wheelchair, scooter, or rollator waiting for you right at the cruise terminal.

## The Port Layout

Piraeus is the main cruise port serving Athens — one of the busiest in the Mediterranean — with several cruise terminals:

- **Terminal A (Miaoulis)** — the largest, for the biggest ships
- **Terminal B (Themistocles)** — medium ships
- **Terminal C (Alkimos)** — smaller vessels

All are step-free accessible, with ramps and elevators where needed.

## Getting Off the Ship

Cruise ships provide accessible gangways. If you need disembarkation assistance:

1. Register with guest services before your port day
2. Accessible passengers usually disembark first or last
3. Ship crew assist with gangways and ramps

You can take your own mobility scooter ashore — ships have elevators to the gangway level. But many passengers prefer to travel light and rent on arrival, which is where we come in.

## How Cruise-Terminal Equipment Delivery Works

This is the part that makes a shore day easy: we bring the equipment to you.

1. **Reserve before you sail** — book online and tell us your ship, terminal, and arrival date.
2. **We meet you at the terminal** — our team hand-delivers your wheelchair, scooter, or rollator to the Piraeus cruise terminal (a €25 delivery zone).
3. **We coordinate by WhatsApp** — on port morning we message you to confirm the exact handover spot and time, so there's no hunting around a busy terminal.
4. **Explore, then hand it back** — we collect the equipment from the terminal before you re-board. No return trips, no storage.

Because timing is confirmed live over WhatsApp (+30 697 463 3697), a slightly early or late docking is no problem — we adjust to your ship.

## Why Rent Instead of Bringing Your Own

Bringing your own equipment on a cruise sounds simplest, but for a single port day it rarely is:

- **No lugging it through the ship** — gangways, elevators, and tight cabins make maneuvering a personal scooter a hassle.
- **No wear on your own device** — salt air, ramps, and cobblestones are hard on the equipment you rely on at home.
- **The right tool for the terrain** — rent exactly what suits an Athens shore day, even if it differs from what you use day to day.
- **Nothing to charge or store** — we hand it over ready to go and take it back at the end.

If you'd rather travel hands-free and keep your own chair pristine, renting for the day is usually the easier call.

## What to Rent for a Shore Day

For a Piraeus shore day, three options cover almost everyone:

- **[Lightweight folding wheelchair](/equipment/wheelchairs/lightweight-folding-wheelchair)** — easy to push and folds for the metro and taxis. Ideal if a companion is pushing.
- **[Foldable travel scooter](/equipment/mobility-scooters/foldable-travel-scooter)** — independent mobility over Athens' long distances, and it folds to fit a taxi boot or the metro.
- **[Rollator walker](/equipment/walking-aids/rollator-walker)** — if you can walk but need support and a place to rest, a rollator with a seat lets you pace yourself.

All rentals start from €49 and are fully sanitized before every handover. Not sure which fits? [Message us](/contact) and we'll advise for your mobility and your plans.

## Getting to Athens: Metro Line 1

The easiest way into the city is the metro:

- **Accessibility:** Piraeus and Monastiraki stations have elevators; trains have wheelchair spaces.
- **Journey:** about 25 minutes to Monastiraki, right by the Acropolis area.
- **Tickets:** €1.20 per ride.

A folding wheelchair or travel scooter makes boarding straightforward. Prefer door to door? A private accessible van is an option — [contact us](/contact) and we'll point you to trusted operators.

## What You Can See in a Day

You have time for the highlights. Two realistic plans:

**Short visit (4–5 hours):**
- Metro to Monastiraki (25 min)
- Acropolis Museum (fully accessible, ~2 hours)
- Lunch in Plaka
- Metro back

**Full day (7–8 hours):**
- Morning: the Acropolis and its museum
- Lunch: Plaka or Monastiraki
- Afternoon: the National Garden or Syntagma Square

The Acropolis itself is more accessible than most people expect — there's a free wheelchair lift to the top. Read our [complete Acropolis wheelchair guide](/accessible-athens/acropolis-wheelchair-guide), which includes a real photo of the accessibility lift shared by one of our customers, before you go.

## Timing & Reliability: Cruise-Day FAQ

**How far ahead should I book?**
Reserve as soon as your itinerary is set — ideally a week or more, and at least 48 hours before arrival. Cruise days are busy and equipment is limited.

**What if my ship docks late or leaves early?**
No problem. We confirm the live handover time by WhatsApp on port morning and adjust to your ship, with buffer built in so a schedule change doesn't cost you your equipment.

**Can I pay in dollars or by card?**
Booking is by card, online, in euros. For anything you buy ashore, carry some euros — many small cafes and kiosks don't take cards.

**Is the equipment cleaned between customers?**
Yes. Every wheelchair, scooter, and rollator is fully sanitized before each handover.

**We're stopping at Piraeus on a multi-port cruise — can you still help?**
Absolutely. A single shore-day rental is exactly what we do. Give us your Piraeus date and terminal and we'll have it ready.

**More questions?** See our [full FAQ](/faq) or message us any time.

## Ready to Book?

Don't spend your one day in Athens stuck on the ship. Reserve before you sail, and we'll have the right equipment waiting at the terminal.

[Browse equipment](/equipment) | [Contact us](/contact) | WhatsApp: +30 697 463 3697
`,
  },
  {
    slug: "athens-summer-wheelchair-tips",
    title: "Athens in Summer: Tips for Wheelchair Users",
    excerpt:
      "Visiting Athens in summer with a wheelchair or scooter? Beat the heat with these practical tips from locals.",
    date: "2026-04-25",
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/athens-summer-wheelchair-tips.jpg",
    category: "Practical",
    recommendedEquipment: ["electric-mobility-scooter", "lightweight-folding-wheelchair"],
    takeaways: [
      "Sightsee before noon or after 5pm \u2014 midday temperatures in July and August are brutal",
      "Prioritize air-conditioned attractions: Acropolis Museum, National Archaeological Museum, Benaki",
      "Carry 1L+ of water, a hat, SPF, and a cloth to cover hot metal wheelchair parts",
    ],
    body: [],
    content: `
Athens in summer is hot. Really hot. July and August regularly hit 35-40\u00b0C, and the sun is intense.

But millions of visitors come anyway \u2014 and so can you. Here\u2019s how to enjoy Athens in summer while staying safe and comfortable with a wheelchair or mobility scooter.

## The Heat Reality

Athens summer heat is serious. Temperatures above 35\u00b0C are common. The sun reflects off marble and concrete. Air conditioning is essential, not optional.

For wheelchair and scooter users, heat matters more:
- You can\u2019t cool down by walking in shade as easily
- Metal wheelchair parts get hot in direct sun
- Battery life on scooters can decrease in extreme heat
- Dehydration happens faster when you\u2019re less mobile

None of this means you can\u2019t visit. It means you need to plan.

## Golden Rules for Summer Visits

### 1. Embrace the Siesta Schedule

Plan your day like a local:

- **7am - 12pm:** Active sightseeing (museums, sites, exploring)
- **12pm - 5pm:** Indoor time (lunch, hotel, air-conditioned spaces)
- **5pm - 10pm:** Evening sightseeing, dinner, nightlife

The Acropolis opens at 8am. Be there when doors open. By noon, you should be somewhere cool.

### 2. Water, Water, Water

Carry more water than you think you need. Athens has public water fountains that are safe to drink.

Signs of dehydration:
- Headache
- Dizziness
- Fatigue
- Confusion

If you feel any of these, get to shade and hydrate immediately.

### 3. Choose Air-Conditioned Routes

Best summer sightseeing happens indoors:

- **Acropolis Museum** \u2014 World-class collection, perfect air conditioning, fully accessible
- **National Archaeological Museum** \u2014 Hours of cool, accessible galleries
- **Benaki Museum** \u2014 Art and history with a great rooftop caf\u00e9
- **Stavros Niarchos Foundation** \u2014 Modern cultural center with gardens

### 4. Mornings at Outdoor Sites

If you want to see the Acropolis or Ancient Agora:

- Book the 8am slot
- Bring a hat and sunscreen
- Carry a small spray bottle to mist yourself
- Take breaks in any available shade
- Leave before you need to

### 5. Evenings Are Magic

Athens comes alive after dark. Summer evenings are warm but bearable:

- Outdoor cinemas (some accessible)
- Rooftop bars with Acropolis views
- Dinner in Psyrri or Koukaki starting at 9pm
- Night walks through illuminated ancient sites

## Scooter and Wheelchair Tips for Heat

**For wheelchair users:**
- Cover metal armrests with cloth in direct sun
- Wear light, breathable clothing
- Attach an umbrella or parasol if possible
- Gloves protect hands from hot push rims

**For scooter users:**
- Park in shade when possible
- Charge overnight when it\u2019s cooler
- Carry a light cloth to cover the seat when parked

## Best Summer Cooling Spots

- **The National Garden** \u2014 Shaded paths, fountains, benches
- **Stavros Niarchos Park** \u2014 Designed for accessibility, some shaded areas
- **Any museum caf\u00e9** \u2014 Order a freddo cappuccino and cool down
- **Shopping malls** \u2014 No shame in a mall break
- **Hotel pool** \u2014 If your hotel has one, use it midday

## What to Pack

Summer wheelchair essentials:
- Wide-brim hat
- High SPF sunscreen
- Refillable water bottle (1L minimum)
- Small battery-powered fan
- Cooling towel
- Light scarf (for covering hot surfaces)
- Sunglasses

## When NOT to Visit

If you have health conditions affected by heat, consider May-June or September-October instead. The weather is still warm but manageable.

August is the hottest month AND when many locals leave. Some smaller shops close.

## Ready to Visit?

Athens in summer is absolutely doable with the right approach. Embrace the siesta rhythm, prioritize air-conditioned attractions, and save outdoor exploration for early morning and evening.

Need mobility equipment? Our [scooters and wheelchairs](/equipment) are delivered to your hotel.

[Browse equipment](/equipment) or [contact us](/contact) with questions.
`,
  },
  {
    slug: "accessible-greek-islands",
    title: "Accessible Greek Islands: Where to Go from Athens",
    excerpt:
      "Which Greek islands are wheelchair accessible? Your honest guide to island-hopping with mobility equipment.",
    date: "2026-04-25",
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/accessible-greek-islands.jpg",
    category: "Attractions",
    recommendedEquipment: ["foldable-travel-scooter", "lightweight-folding-wheelchair"],
    takeaways: [
      "Aegina is the easiest day trip \u2014 flat harbor, 40-minute ferry from Piraeus",
      "For multi-day stays, Rhodes and Kos offer the best accessibility plus great beaches",
      "Skip Santorini, Mykonos, and Hydra if full access matters \u2014 they\u2019re built on stairs",
    ],
    body: [],
    content: `
The Greek islands are a dream \u2014 white villages, blue domes, crystal water. But are they accessible?

Honest answer: it varies wildly. Some islands are surprisingly manageable. Others are beautiful nightmares of cobblestones, stairs, and steep hills.

Here\u2019s what we\u2019ve learned from years of helping visitors with mobility needs.

## The Reality Check

Greek islands were built centuries ago on rocky hillsides. Accessibility wasn\u2019t a consideration. Many iconic destinations \u2014 Santorini\u2019s Oia, Mykonos Town, Hydra \u2014 are genuinely difficult or impossible with a wheelchair or scooter.

That said, things are improving. Newer developments, waterfronts, and some beaches now have accessible infrastructure. And certain islands are far more manageable than others.

## Most Accessible Islands from Athens

### 1. Aegina (Best for Day Trips)

**Ferry:** 40 minutes from Piraeus (conventional ferry)

**Why it works:** The main harbor town is flat and accessible. Waterfront caf\u00e9s and restaurants have step-free access. Taxis can take you around the island.

**Challenges:** The Temple of Aphaia has limited accessibility. Village streets can be narrow.

**Verdict:** Perfect for a day trip. No overnight logistics needed.

### 2. Rhodes (Best for Extended Stays)

**Access:** Flight from Athens (1 hour) or long ferry (13-18 hours)

**Why it works:** Rhodes Town has a accessible waterfront promenade. Many hotels are modern and accessible. Beaches like Faliraki have beach wheelchairs.

**Challenges:** The medieval Old Town has cobblestones and steps \u2014 beautiful to see from the gates, hard to explore inside.

**Verdict:** Best for a multi-day stay. Fly rather than ferry.

### 3. Kos (Best Beaches)

**Access:** Flight from Athens (1 hour) or ferry via Rhodes

**Why it works:** Flat terrain, modern resort infrastructure, several beaches with accessibility features. The town center is manageable.

**Challenges:** Some archaeological sites have limited access.

**Verdict:** Great for beach-focused holidays with good accessibility.

### 4. Corfu (Best Variety)

**Access:** Flight from Athens (1 hour)

**Why it works:** Mix of accessible beaches, flat coastal areas, and modern hotels. Achilleion Palace has partial access.

**Challenges:** Corfu Old Town is steep and cobbled in places.

**Verdict:** Good for combining beach and culture.

## Islands to Approach with Caution

### Santorini

The iconic caldera views come with a price: everything is built on cliffs. Oia and Fira involve endless steps. The cable car from the port is not wheelchair accessible. Even accessible hotels require navigating steep village paths.

**If you must go:** Stay in a hotel with caldera views and private transfers. Accept that you\u2019ll see less than able-bodied visitors. Consider it a \u201cview from the terrace\u201d trip rather than an exploration.

### Mykonos

The charming Cycladic streets are narrow, stepped, and paved with uneven flagstones. Beach clubs vary in accessibility.

**If you must go:** Stick to accessible beach resorts and don\u2019t expect to explore Mykonos Town independently.

### Hydra

No vehicles allowed \u2014 transport is by donkey or on foot. Steep paths everywhere. Not recommended for wheelchair or scooter users.

## Ferry Accessibility

**Conventional ferries** (Blue Star, Anek Lines) are generally accessible. They have elevators, accessible cabins on overnight routes, and can accommodate wheelchairs/scooters.

**Hydrofoils and catamarans** are harder. Boarding is often via narrow gangways. Check with the specific operator.

**Always book assistance in advance.** Call the ferry company and arrive at the port early.

## Our Recommendations

**For a day trip:** Aegina. Easy ferry, flat harbor, back in Athens by dinner.

**For a beach holiday:** Kos or Rhodes. Fly for convenience, stay in modern accessible hotels.

**For island atmosphere without the obstacles:** Skip the islands and visit Nafplio instead \u2014 it has the beauty without the stairs.

## Taking Equipment to the Islands

Your rental scooter or wheelchair can travel with you on conventional ferries.

For flights, wheelchairs travel free. Scooters require advance notice and battery documentation (we provide this).

## Need Mobility Equipment?

Rent from us in Athens and take it with you \u2014 or arrange pickup/dropoff at your island hotel. [Contact us](/contact) to discuss your island plans.

[Browse equipment](/equipment) and let\u2019s make your Greek island dream work.
`,
  },
  {
    slug: "athens-accessible-day-trips",
    title: "Athens Accessible Day Trips: 5 Easy Excursions",
    excerpt:
      "Five wheelchair-friendly day trips from Athens \u2014 from coastal temples to island escapes, all doable with mobility equipment.",
    date: "2026-04-25",
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/athens-day-trips.jpg",
    category: "Attractions",
    recommendedEquipment: ["foldable-travel-scooter", "electric-mobility-scooter"],
    takeaways: [
      "Lake Vouliagmeni and the Nafplio waterfront are the most accessible \u2014 great for relaxed days",
      "Aegina ferry trips work well if you take a scooter \u2014 use the conventional boats, not hydrofoils",
      "Book an accessible taxi or van in advance for Sounion, Delphi, and Nafplio",
    ],
    body: [],
    content: `
Athens is brilliant, but after a few days you might want a change of scenery. Good news: several day trips from Athens are wheelchair and scooter accessible \u2014 no need to limit yourself to the city.

Here are five excursions we recommend, all tested for accessibility.

## 1. Cape Sounion & the Temple of Poseidon

**Distance:** 70km south (1.5 hours by car)

The Temple of Poseidon sits on a cliff overlooking the Aegean Sea. Dramatic, ancient, unforgettable \u2014 especially at sunset.

**Accessibility:** The site has a paved path from the parking area to a viewpoint near the temple. Full access to the temple platform is limited due to ancient stones, but you can get close enough for photos and the experience. The visitor center and caf\u00e9 are accessible.

**Best for:** Mobility scooter users or those who can manage some uneven ground with assistance.

**Tip:** Book an accessible taxi or van for the trip. We can recommend drivers who carry ramps.

## 2. Aegina Island

**Distance:** 40 minutes by ferry from Piraeus

A quick escape to island life without the long journey. Aegina has a charming harbor town, pistachio groves, and the ancient Temple of Aphaia.

**Accessibility:** The main harbor area and waterfront are flat and accessible. Taxis on the island can take you to beaches and the temple. The Aegina-Piraeus ferry (conventional, not hydrofoil) has accessible boarding.

**Best for:** Wheelchair users who want an island taste without overnight stays.

**Tip:** Take your rental scooter on the ferry \u2014 it\u2019s allowed on the conventional boats.

## 3. Nafplio

**Distance:** 140km southwest (2 hours by car)

Greece\u2019s first capital is one of the most beautiful towns in the country. Venetian architecture, seaside promenades, and excellent restaurants.

**Accessibility:** The waterfront promenade is fully accessible and stunning. The old town has some cobblestones but main streets are manageable. Palamidi Fortress on the hill is not accessible (999 steps!), but the town itself has plenty to offer.

**Best for:** A leisurely day of seaside strolling and Greek food.

**Tip:** Arrive by 10am to get parking near the waterfront.

## 4. Delphi

**Distance:** 180km northwest (2.5 hours by car)

The ancient sanctuary where Greeks consulted the Oracle. A UNESCO World Heritage site in a dramatic mountain setting.

**Accessibility:** Challenging but partially possible. The Delphi Museum is fully accessible and excellent \u2014 you can spend hours here. The archaeological site itself has steep paths and stairs, but a lower accessible route reaches the main temple terrace. Ask at the entrance for the accessible path.

**Best for:** History lovers willing to accept partial site access.

**Tip:** Visit the museum first, then assess energy levels for the site.

## 5. Lake Vouliagmeni

**Distance:** 25km south (30 minutes by car)

A thermal lake fed by underground springs, right on the Athens Riviera. Warm water year-round (22-29\u00b0C), surrounded by cliffs and pine trees.

**Accessibility:** The facility is designed for accessibility. Ramps lead to the water, and beach wheelchairs are available for entering the lake. Changing rooms and caf\u00e9 are accessible.

**Best for:** A relaxing half-day escape, especially therapeutic for joint or muscle pain.

**Tip:** Go on a weekday to avoid crowds. Bring your swimsuit.

## Planning Your Accessible Day Trip

**Transport:** Most day trips require a car or private transfer. Public buses are hit-or-miss for accessibility. We can recommend accessible taxi services.

**Equipment:** Take your rental scooter or wheelchair. For ferry trips, confirm accessible boarding when you book.

**Timing:** Start early to avoid heat and crowds. Most sites are best in the morning.

**Energy:** Don\u2019t try to do too much. Pick one destination and enjoy it fully.

## Need Mobility Equipment?

If you\u2019re planning day trips from Athens, a [mobility scooter](/equipment/electric-mobility-scooter) gives you range and independence. Our [foldable travel scooter](/equipment/foldable-travel-scooter) fits in car trunks for excursions.

[Browse equipment](/equipment) or [contact us](/contact) to plan your Athens adventures.
`,
  },
  {
    slug: "mobility-scooter-rental-athens",
    title: "Mobility Scooter Rental Athens: What You Need to Know",
    excerpt:
      "Everything you need to know about renting a mobility scooter in Athens \u2014 pricing, terrain tips, and where to ride.",
    date: "2026-04-24",
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/mobility-scooter-athens.jpg",
    category: "Equipment Guides",
    recommendedEquipment: ["electric-mobility-scooter", "foldable-travel-scooter"],
    takeaways: [
      "Scooters work great on main streets and pedestrianized zones \u2014 stick to flat areas",
      "Budget \u20ac120\u2013150 for a 1\u20133 day rental, with big savings on longer rentals",
      "Charge overnight (6\u20138 hours) for 30\u201340km of next-day range",
    ],
    body: [],
    content: `
Thinking about renting a mobility scooter for your Athens trip? Smart choice. A scooter gives you independence to explore at your own pace \u2014 covering more ground than a wheelchair without exhausting yourself or relying on others.

But Athens isn\u2019t flat, and not every neighborhood is scooter-friendly. Here\u2019s everything you need to know before you book.

## Who Should Rent a Mobility Scooter?

A mobility scooter is ideal if you:

- Can sit upright and operate hand controls
- Want to cover longer distances (museums, markets, waterfront)
- Have some mobility but tire easily walking
- Are traveling with a group and want to keep up

If you need full upper body support or have limited hand control, a [power wheelchair](/equipment/foldable-power-wheelchair) might be a better fit.

## What Types of Scooters Are Available?

**4-Wheel Mobility Scooter** \u2014 Stable, comfortable, good for flat terrain. Best for the city center, waterfront promenades, and accessible attractions. Range of 30-40km per charge.

**Foldable Travel Scooter** \u2014 Lightweight, breaks down for transport. Great if you\u2019re island hopping or taking day trips. Fits in a car trunk or ferry cabin.

At Movability, we offer both \u2014 [delivered directly to your Athens hotel](/equipment).

## Athens Terrain: What to Expect

**Scooter-Friendly Areas:**
- Syntagma Square and the National Garden
- Stavros Niarchos Foundation Cultural Center
- The coastal promenade from Faliro to Glyfada
- Acropolis Museum surroundings (paved, flat)
- Most major museum areas

**Challenging Areas:**
- Plaka and Anafiotika (steep, narrow, cobblestones)
- Monastiraki side streets (uneven surfaces)
- The Acropolis hill itself (use the elevator access instead)

Stick to main streets and pedestrianized zones.

## How Much Does It Cost?

| Duration | Price Range |
|----------|-------------|
| 1-3 days | \u20ac120-150 |
| 4-7 days | \u20ac220-250 total |
| 8-14 days | \u20ac300-350 total |
| 15-30 days | \u20ac400-450 total |

Longer rentals offer significant savings. Delivery to central Athens hotels is included.

## Charging Your Scooter

- Full charge takes 6-8 hours (overnight is fine)
- Range is 30-40km depending on terrain and weight
- Greek outlets are standard European (Type C/F)
- Hotels are usually happy to let you charge in your room

Charge every night and you\u2019ll never run low mid-sightseeing.

## Where to Ride: Our Top Recommendations

**For First-Timers:** Start at Syntagma Square, ride through the National Garden, and end at the Panathenaic Stadium. Flat, scenic, manageable.

**For Culture Lovers:** The museum triangle \u2014 Acropolis Museum, National Archaeological Museum, and Benaki Museum \u2014 all have step-free access.

**For Seaside Vibes:** The Faliro coastal path runs 5km along the water. Flat, wide, beautiful sunset views.

## What\u2019s Included in Your Rental?

- Scooter fully charged and ready
- Charger with European plug
- Brief orientation on controls
- Phone support during your rental
- Free pickup when you\u2019re done

No hidden fees. No surprise charges.

## Ready to Book?

Browse our [mobility scooters](/equipment) and choose your dates. We\u2019ll handle the rest.

Questions? [Contact us](/contact) or message us on WhatsApp.
`,
  },
  {
    slug: "athens-accessibility-honest-guide",
    title: "The Honest Truth About Wheelchair Accessibility in Athens",
    excerpt:
      "Athens has made progress, but challenges remain. Here's what to actually expect \u2014 the good, the bad, and how to navigate it all.",
    date: "2026-04-02",
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/athens-accessible.jpg",
    category: "Accessibility",
    takeaways: [
      "Cobblestones and sidewalk obstacles are the biggest daily challenge \u2014 stick to main commercial streets",
      "Metro Lines 2 and 3 are accessible; Line 1 mostly is not \u2014 plan routes around working stations",
      "Greeks will go out of their way to help \u2014 the human element compensates for imperfect infrastructure",
    ],
    body: [],
    content: `
Athens is one of the oldest cities in the world. That\u2019s what makes it magical \u2014 and also what makes it challenging for wheelchair users and people with mobility needs.

We\u2019re not going to sugarcoat it. As a local mobility equipment company, we see the reality every day. But we also know that Athens IS doable with the right preparation. Here\u2019s the honest truth about what you\u2019ll face, and how to handle it.

## The Real Challenges

### Cobblestones & Uneven Surfaces

**The problem:** The historic neighborhoods \u2014 Plaka, Monastiraki, Anafiotika \u2014 are paved with centuries-old cobblestones. They\u2019re beautiful and absolutely brutal on wheelchairs. Manual wheelchair users will feel every bump. Power wheelchair and scooter users risk getting stuck in gaps.

**The solution:** Stick to the main commercial streets like Ermou, Athinas, and Adrianou where surfaces are smoother. If you want to experience Plaka, go with a companion who can help navigate, and consider a wheelchair with larger front casters or a suspension system. Our [lightweight folding wheelchair](/equipment/wheelchairs/lightweight-folding-wheelchair) handles cobblestones better than rigid frames.

### Sidewalk Obstacles

**The problem:** Athenian sidewalks are an obstacle course. Parked motorcycles, caf\u00e9 tables, tree roots breaking through concrete, random steps, and cars parked across ramps. It\u2019s not malicious \u2014 it\u2019s just decades of unplanned urban growth.

**The solution:** Often, the street itself is smoother than the sidewalk. Don\u2019t be afraid to use the road (carefully) on quieter streets. In busy areas, go early morning when caf\u00e9s haven\u2019t set up their outdoor seating yet.

### Metro Accessibility Is Incomplete

**The problem:** The Athens Metro is actually quite good \u2014 most stations on Lines 2 and 3 (the newer ones) have elevators. But Line 1 (the old line from Piraeus to Kifisia) has many stations with only stairs.

**The solution:** Plan your route using stations we know work:
- \u2705 Syntagma (Lines 2 & 3) \u2014 elevators, accessible
- \u2705 Acropolis (Line 2) \u2014 elevators, accessible
- \u2705 Monastiraki (Lines 1 & 3) \u2014 accessible entrance on Line 3 side
- \u2705 Evangelismos (Line 3) \u2014 elevators
- \u274c Thissio \u2014 stairs only
- \u274c Omonia \u2014 elevators often broken
- \u274c Victoria \u2014 not accessible

Use an accessible taxi or our [scooter](/equipment/mobility-scooters) / [wheelchair](/equipment/wheelchairs) rental as backup for areas the metro doesn\u2019t serve well.

### Restaurants & Caf\u00e9s With Steps

**The problem:** A huge number of restaurants, especially in older neighborhoods, have one or more steps at the entrance. Narrow doorways are common. Accessible bathrooms are rare outside of newer establishments.

**The solution:** We maintain a list of accessible restaurants we\u2019ve personally verified \u2014 see our [Accessible Restaurants in Athens guide](/accessible-athens/accessible-restaurants-bars-athens). When in doubt, call ahead. Most restaurant owners are genuinely helpful and will assist with a portable ramp or help you enter if you let them know in advance.

### The Hills

**The problem:** Athens is built on hills. The Acropolis sits on one. Lycabettus Hill towers over the city. Even \u201cflat\u201d areas have unexpected inclines. Power wheelchair users \u2014 watch your battery on steep climbs.

**The solution:** For the Acropolis, use the [accessible entrance on the north slope](/accessible-athens/acropolis-wheelchair-guide) which has a gentler grade and an elevator. Avoid trying to reach Lycabettus Hill unless you\u2019re taking the funicular. The Stavros Niarchos Foundation Cultural Center is completely flat and modern \u2014 a great accessible outing.

### Aggressive Traffic

**The problem:** Athenian drivers are... enthusiastic. Crosswalks are suggestions. Ramps are sometimes blocked by parked cars.

**The solution:** Use pedestrian crossings at traffic lights rather than zebra crossings. Make eye contact with drivers before crossing. Consider going out during siesta hours (3\u20136pm) when traffic is lighter.

## What\u2019s Actually Good

It\u2019s not all bad. Here\u2019s where Athens has genuinely improved:

### The Acropolis Is Accessible

Yes, really. There\u2019s an elevator that takes you to the top. You can see the Parthenon. The path is paved. Greece invested significantly in accessibility for the 2004 Olympics.

### New Metro Stations Are Excellent

Lines 2 and 3 were built in the 1990s\u20132000s with accessibility in mind. Elevators work, platforms are level with trains, and there\u2019s tactile paving for visually impaired visitors.

### Beaches Have Seatrac Systems

Several [beaches near Athens](/accessible-athens/accessible-beaches-athens) (Alimos, Voula, and others) have Seatrac \u2014 an autonomous system that helps wheelchair users enter the sea independently. It\u2019s actually world-class.

### People Want To Help

This matters. Greeks will go out of their way to assist \u2014 carrying wheelchairs up steps, clearing paths, finding solutions. It\u2019s not perfect infrastructure, but the human element is strong.

## Our Honest Advice

1. **Rent equipment locally.** Don\u2019t bring your own wheelchair on the plane if you can avoid it \u2014 airline damage is common, and you\u2019ll want something suited to Athens\u2019 terrain.

2. **Stay in the right area.** Book accommodation in the center (Syntagma, Plaka, Koukaki) near accessible metro stations. Avoid hilly Exarchia or remote suburbs.

3. **Plan, but stay flexible.** Have a rough itinerary but be ready to adapt. That \u201caccessible\u201d restaurant might have new steps. That \u201cinaccessible\u201d site might have a helpful guard who knows a back entrance.

4. **Contact us before your trip.** Seriously \u2014 we do this every day. We can tell you the current state of specific locations, suggest routes, and recommend what equipment will work best for your needs.

Athens isn\u2019t Copenhagen or Tokyo. It\u2019s messy, chaotic, ancient, and imperfect. But it\u2019s also magical, welcoming, and absolutely worth visiting. With realistic expectations and good preparation, you can have an incredible trip.

We\u2019re here to help make that happen.

---

## Need Mobility Equipment for Your Athens Trip?

We deliver wheelchairs, scooters, and rollators directly to your hotel. Free store pickup in central Athens.

[Browse Equipment \u2192](/equipment) | [Contact Us \u2192](/contact)
`,
  },
  {
    slug: "museums",
    title: "Accessible Museums in Athens",
    excerpt:
      "A curated list of Athens' most wheelchair-friendly museums, including the National Archaeological Museum and the Benaki.",
    date: "2026-01-28",
    image: museumsImg,
    category: "Attractions",
    recommendedEquipment: ["lightweight-folding-wheelchair", "rollator-walker"],
    takeaways: [
      "The Acropolis Museum is fully step-free with tactile exhibits and wheelchair loans",
      "Most major museums offer free entry for visitors with disabilities",
      "Call ahead to confirm elevator access — some historic buildings have limitations",
    ],
    body: [],
    content: `
## Acropolis Museum

The **Acropolis Museum** is Athens' most accessible cultural venue, purpose-built in 2009 with universal design principles.

- **Entrance**: Fully step-free from street level
- **Elevators**: Glass lifts to all three floors
- **Wheelchairs**: Free loan at the ticket desk
- **Tactile exhibits**: Scale models you can touch on the ground floor
- **Tickets**: Free for visitors with disabilities + one companion

## National Archaeological Museum

Greece's largest museum has made significant accessibility improvements:

- **Main entrance**: Ramped access from the street
- **Ground floor**: Fully accessible, includes the famous Mycenaean gold
- **Upper floors**: Elevator access, though some galleries have narrow passages
- **Wheelchairs**: Available at reception

## Benaki Museum

The main Benaki building on Vasilissis Sofias Avenue:

- **Entrance**: Step-free via the side entrance (ask security)
- **Elevator**: Serves all floors
- **Café terrace**: Accessible with views of the National Garden

## Museum of Cycladic Art

A beautifully renovated neoclassical building:

- **Entrance**: Ramped access on the side
- **Elevators**: Modern lifts to all exhibition floors
- **Note**: The glass walkway to the Stathatos Mansion annex is step-free

## Tips for Museum Visits

- **Book ahead**: Many museums offer priority entry for wheelchair users
- **Timing**: Tuesday-Thursday mornings are quietest
- **Ask staff**: Guards are generally helpful and can unlock accessible routes
`,
  },
  {
    slug: "restaurants",
    title: "Accessible Restaurants in Plaka & Monastiraki",
    excerpt:
      "Where to eat in Athens' most popular neighborhoods if you use a wheelchair, rollator, or mobility scooter.",
    date: "2026-02-10",
    image: restaurantsImg,
    category: "Dining",
    recommendedEquipment: ["manual-wheelchair", "rollator-walker"],
    takeaways: [
      "Plaka's pedestrian streets are mostly flat cobblestone — manageable with larger wheels",
      "Rooftop restaurants rarely have elevators — call ahead to confirm",
      "Monastiraki Square has several fully accessible tavernas with street-level entry",
    ],
    body: [],
    content: `
## Plaka: The Historic Quarter

Plaka's car-free streets are charming but challenging. Here's how to navigate:

### Accessible Picks

- **Scholarchio**: Ground-floor taverna on Tripodon Street, wide entrance, traditional Greek cuisine
- **Café Avissinia**: In Monastiraki Square, step-free patio seating, great meze
- **Yiasemi**: On Mnisikleous steps — but they have a **ground-level patio** section (confirm when booking)

### Streets to Target

- **Adrianou Street**: The main drag, relatively flat, most restaurants have outdoor seating
- **Kydathineon Street**: Pedestrianized, gentle slope, several accessible patios

### Streets to Avoid

- **Mnisikleous Street**: Famous stepped street — beautiful but impossible for wheels
- **Upper Plaka**: Steep inclines toward Anafiotika

## Monastiraki Square

The flattest, most accessible dining area in central Athens:

- **Ground-level restaurants**: Multiple options around the square
- **Accessible restrooms**: Available at the metro station
- **Surface**: Smooth paving, easy for all mobility equipment

## Rooftop Dining

Many famous Acropolis-view rooftops **lack elevator access**. Exceptions:

- **A for Athens**: Rooftop bar with elevator
- **Hotel Grande Bretagne Roof Garden**: Fully accessible via hotel elevators
- **360 Cocktail Bar**: Has a lift — call to confirm availability

## Booking Tips

- **Always call ahead**: Ask specifically about steps at the entrance
- **Request ground floor**: Many restaurants have multiple levels
- **Outdoor seating**: Often more accessible than navigating interior layouts
`,
  },
  {
    slug: "beaches",
    title: "Accessible Beaches Near Athens",
    excerpt:
      "Discover beaches along the Athenian Riviera with ramps, accessible changing rooms, and Seatrac systems.",
    date: "2026-02-20",
    image: beachesImg,
    category: "Outdoors",
    takeaways: [
      "Seatrac autonomous beach access systems are installed at several Athens-area beaches",
      "Voula A' and Alimos beaches have accessible changing rooms and paved paths to the water",
      "Visit in the morning — Seatrac systems can have queues on summer afternoons",
    ],
    body: [],
    content: `
## What is Seatrac?

Greece has installed **Seatrac systems** at beaches across the country — autonomous chair lifts that let wheelchair users enter the sea independently.

- **How it works**: Transfer to the Seatrac chair, use the remote control to descend into the water
- **Cost**: Free to use
- **Availability**: Typically 9am-7pm in summer season (June-September)

## Best Accessible Beaches Near Athens

### Voula A' Beach (Organized)

- **Distance**: 18km from city center
- **Seatrac**: Yes
- **Facilities**: Accessible changing rooms, showers, paved paths, sunbed service
- **Entry fee**: Small fee for organized section
- **How to get there**: Tram to Voula + short taxi, or accessible taxi direct

### Alimos Beach

- **Distance**: 10km from city center
- **Seatrac**: Yes
- **Facilities**: Accessible parking, paved boardwalk, cafeteria
- **Entry fee**: Free
- **How to get there**: Bus A2 or B2 from Syntagma (low-floor buses)

### Kavouri Beach

- **Distance**: 20km from city center
- **Seatrac**: At the organized section
- **Facilities**: Quieter than Voula, accessible taverna nearby
- **Entry fee**: Free beach + paid organized section

## Beach Equipment Tips

- **Leave power chairs behind**: Sand and saltwater don't mix with electronics
- **Manual beach wheelchair**: Some beaches have these for loan — call ahead
- **Bring a companion**: For transfers and navigating softer sand
- **Timing**: Morning is best — fewer crowds, calmer seas, Seatrac availability
`,
  },
  {
    slug: "public-transport",
    title: "Athens Public Transport Accessibility Guide",
    excerpt:
      "Metro, tram, and bus accessibility in Athens — which lines are step-free, how to navigate, and tips for a smooth ride.",
    date: "2026-03-01",
    image: publicTransportImg,
    category: "Transport",
    takeaways: [
      "All metro stations have elevators — use the OASA app to check real-time lift status",
      "Request the ramp when boarding buses — drivers deploy it from the middle door",
      "Taxis are not required to be accessible — book an accessible van through Beat or Welcome",
    ],
    body: [],
    content: `
## Athens Metro

The Athens Metro is **one of the most accessible in Europe** — built for the 2004 Olympics with universal design.

### Accessibility Features

- **Elevators**: Every station has at least one lift from street to platform
- **Gap fillers**: Platform-to-train gaps are minimal
- **Audio announcements**: Station names announced in Greek and English
- **Tactile paths**: Guide strips throughout stations

### Tips

- **Check lift status**: The OASA app shows real-time elevator outages
- **Avoid rush hour**: 8-9am and 5-7pm are extremely crowded
- **Best lines**: Lines 2 (red) and 3 (blue) are newest and most spacious

## Buses

Athens buses have **low-floor accessible vehicles** on major routes, but coverage is inconsistent.

- **Request the ramp**: Press the wheelchair button or call to the driver — ramp deploys from middle door
- **Routes to trust**: Airport Express X95, coastal routes along the tram line
- **Routes to avoid**: Older routes to suburbs often have step-entry buses

## Trams

The Athens Tram runs from Syntagma to the coast (Voula) and is **fully accessible**:

- **Level boarding**: Platforms match tram floor height
- **Wheelchair space**: Designated areas in each carriage
- **Useful for**: Reaching southern beaches and the Flisvos Marina

## Taxis

Standard Athens taxis are **not accessible** — they're small sedans.

### Accessible Alternatives

- **Welcome Pickups**: Pre-book accessible vans, fixed prices, meets you at the airport
- **Beat app**: Has a "wheelchair accessible" filter (limited availability)
- **Hotel concierge**: Can often arrange accessible transport with notice
`,
  },
  {
    slug: "accessible-restaurants-bars-athens",
    title: "10 Wheelchair-Accessible Restaurants & Bars in Athens",
    excerpt:
      "Discover the best wheelchair-friendly restaurants and bars in Athens. Step-free access, ramps, and accessible bathrooms — our local picks for 2026.",
    date: "2026-03-10",
    image: restaurantsImg,
    category: "Dining",
    recommendedEquipment: ["manual-wheelchair", "rollator-walker"],
    takeaways: [
      "Most Plaka and Monastiraki restaurants have ground-floor outdoor seating — easier access than going inside",
      "Always call ahead to confirm step-free access, especially for rooftop spots",
      "Several rooftop bars now have elevators — Strofi and A for Athens are top picks",
    ],
    body: [],
    content: `
## Our Top 10 Picks

We've personally visited and checked the accessibility of every restaurant on this list. Here's what we found.

### 1. Strofi — Rooftop with Acropolis View

- **Address**: Rovertou Galli 25, Makrygianni
- **Cuisine**: Modern Greek · €€€
- **Access**: Elevator to rooftop terrace, accessible restroom
- **Why go**: Arguably the best Acropolis view in Athens — and one of the rare rooftop restaurants with proper elevator access

### 2. Taverna Platanos — Classic Plaka

- **Address**: Diogenous 4, Plaka
- **Cuisine**: Traditional Greek taverna · €€
- **Access**: Ground floor, wide entrance, outdoor seating under plane tree
- **Why go**: One of the oldest tavernas in Athens (since 1932), and naturally accessible thanks to its ground-level setup

### 3. Smile Café

- **Address**: Adrianou 92, Monastiraki
- **Cuisine**: Café & light meals · €
- **Access**: Fully accessible — ramp entrance, spacious interior, accessible restroom
- **Why go**: Friendly staff, affordable, and right on the main pedestrian drag of Monastiraki

### 4. The Foundry Supper Club

- **Address**: Sarri 27, Psyrri
- **Cuisine**: Contemporary Mediterranean · €€€
- **Access**: Step-free entrance, spacious dining room with wide aisles between tables
- **Why go**: Refined dining in the creative Psyrri neighborhood with zero accessibility barriers

### 5. Lukumades

- **Address**: Aiolou 21, Monastiraki
- **Cuisine**: Greek donuts & desserts · €
- **Access**: Ground floor, no steps, wide doorway
- **Why go**: Athens' most famous loukoumades (honey donuts) — a must-try street food experience

### 6. Six Dogs — Garden Bar

- **Address**: Avramiotou 6-8, Monastiraki
- **Cuisine**: Bar & cocktails · €€
- **Access**: Garden area is flat and step-free, gravel surface (manageable with larger wheels)
- **Why go**: Hidden garden oasis in the city center — perfect for evening drinks

### 7. Heteroclito Wine Bar

- **Address**: Fokionos 2, Syntagma
- **Cuisine**: Wine bar & small plates · €€
- **Access**: Accessible entrance at street level, intimate but navigable interior
- **Why go**: Excellent Greek wine selection with knowledgeable staff who'll guide you through local varietals

### 8. Tzitzikas kai Mermigas

- **Address**: Mitropoleos 12-14, Syntagma
- **Cuisine**: Modern Greek meze · €€
- **Access**: Ramp available at entrance, ground floor dining, accessible restroom
- **Why go**: Creative takes on traditional Greek dishes, central location, consistently good

### 9. Café Avissinia

- **Address**: Avissinia Square, Monastiraki
- **Cuisine**: Greek meze & live music · €€
- **Access**: Ground level seating on the square, outdoor tables are step-free
- **Why go**: Weekend live rebetiko music on the terrace overlooking the flea market

### 10. Ta Karamanlidika tou Fani

- **Address**: Sokratous 1, Psyrri
- **Cuisine**: Greek deli & charcuterie · €€
- **Access**: Wide aisles, ground floor, step-free entrance
- **Why go**: Part deli, part restaurant — taste cured meats and cheeses from across Greece

## Tips for Dining Out

- **Book ground floor**: When reserving, always specify you need ground-floor seating
- **Check restrooms**: Accessible dining doesn't always mean accessible restrooms — ask when booking
- **Outdoor seating**: Often the easiest option, and Athens weather makes it enjoyable 9 months a year
- **Avoid peak hours**: 9-10pm is when locals eat — restaurant aisles get tight with extra chairs and tables

---

*Need mobility equipment for your Athens trip? [Browse our equipment →](/equipment)*
`,
  },
  {
    slug: "acropolis-wheelchair-guide",
    title: "Is the Acropolis Wheelchair Accessible? Complete 2026 Guide",
    excerpt:
      "Yes, the Acropolis is wheelchair accessible. Free elevator, paved paths, free admission. Our local guide covers exactly what to expect \u2014 the good and the limitations.",
    date: "2026-03-15",
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/equipment-images/articles/acropolis-wheelchair-guide.webp",
    category: "Attractions",
    recommendedEquipment: ["lightweight-folding-wheelchair", "rollator-walker"],
    takeaways: [
      "Free elevator access to the top \u2014 use the northeast entrance near the Acropolis Museum",
      "Wheelchair users + 1 companion enter FREE \u2014 no ticket needed",
      "Go early morning (8-9am) to avoid elevator queues and heat",
    ],
    body: [],
    content: `
## Is the Acropolis Wheelchair Accessible?

Yes \u2014 and it\u2019s better than most people expect. The Acropolis has a wheelchair lift/elevator that takes you directly to the top. Paved pathways connect the main monuments, and admission is FREE for wheelchair users plus one companion.

But let\u2019s be honest about limitations: not every corner is accessible, some ancient pathways are uneven, and on crowded days the elevator has a queue. This guide covers exactly what to expect.

## The Accessible Entrance (Don\u2019t Go to the Main Gate)

**Important:** The main entrance on the west side has stairs.

Use the **accessible entrance on the northeast side**, near Dionysiou Areopagitou street. Look for signs pointing to the elevator. This entrance is about 300m from the Acropolis Metro station.

**Address:** Accessible entrance is near the Acropolis Museum, on the path heading up from Makrigianni area.

## How the Elevator Works

- **Capacity:** Fits 1 wheelchair + 1 companion
- **Hours:** Same as Acropolis opening hours (8am-8pm summer, 8am-5pm winter)
- **Cost:** FREE (no ticket needed for wheelchair users + 1 companion)
- **Wait time:** 5-20 minutes depending on season
- **Tip:** Go early morning (8-9am) or late afternoon (after 5pm) to avoid queues

The elevator takes you to the main plateau where the Parthenon sits.

![The Acropolis wheelchair lift — photo by our customer Eliana F.](https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/equipment-images/testimonials/eliana-acropolis-lift.jpg)

## What You CAN See (Accessible Areas)

\u2705 **The Parthenon** \u2014 Full view, can get close on paved paths

\u2705 **The Erechtheion** \u2014 Viewable from accessible path (the Caryatid porch)

\u2705 **Temple of Athena Nike** \u2014 Visible from the accessible route

\u2705 **Panoramic views of Athens** \u2014 The accessible areas have stunning viewpoints

\u2705 **Propylaea (entrance gate)** \u2014 Partially viewable

## What You CANNOT Access

\u274c **Inside the Parthenon** \u2014 Nobody can, it\u2019s closed to all visitors

\u274c **Some narrow ancient pathways** \u2014 Uneven stone, not wheelchair-friendly

\u274c **The Theatre of Dionysus** \u2014 Below the Acropolis, steep terrain

\u274c **Areopagus (Mars Hill)** \u2014 Rocky outcrop, no accessible route

## Getting There: Transport Options

**Metro (Recommended):**
- Take Line 2 (red) to **Acropolis station**
- Station has elevators \u2014 fully accessible
- 5-minute wheel/roll to the accessible entrance

**Taxi:**
- Ask driver for \u201cAcropolis accessible entrance, near the museum\u201d
- Drop-off point is close to the elevator

**From Your Hotel:**
- We deliver wheelchairs and scooters directly to your accommodation
- [Rent a wheelchair for your Acropolis visit \u2192](/equipment/wheelchairs)

## Practical Tips From Locals

1. **Book nothing** \u2014 Just show up. No reservation needed for the elevator.
2. **Bring water** \u2014 No shops at the top, and it\u2019s hot in summer.
3. **Wear a hat** \u2014 Zero shade on the plateau.
4. **Morning is magic** \u2014 Fewer crowds, cooler temperatures, better photos.
5. **Allow 2 hours** \u2014 Enough time to see everything accessible without rushing.
6. **Check the elevator** \u2014 Very rarely it\u2019s under maintenance. Call +30 210 321 4172 to confirm.

## Accessible Restrooms

\u2705 Available near the accessible entrance (before you go up)

\u274c None at the top \u2014 use facilities before taking the elevator

## After the Acropolis: Accessible Spots Nearby

- **Acropolis Museum** (5 min) \u2014 Fully accessible, world-class collection, air-conditioned
- **Plaka** (10 min) \u2014 Some flat pedestrian streets, cafes with outdoor seating
- **Monastiraki Square** (15 min) \u2014 Flat, bustling, great for people-watching

[See our guide to accessible restaurants in Athens \u2192](/accessible-athens/accessible-restaurants-bars-athens)

## The Honest Summary

The Acropolis is more accessible than most ancient sites in the world. The elevator works, the paths are paved, and the views are spectacular. You won\u2019t see every corner, but you WILL see the Parthenon up close \u2014 and that\u2019s why you\u2019re here.

Don\u2019t skip it because you\u2019re worried about access. It\u2019s worth it.

---

## Need a Wheelchair for Your Visit?

We deliver wheelchairs and mobility scooters directly to your Athens hotel. Free store pickup in central Athens.

Recovering from a foot or ankle injury rather than using a wheelchair? A [knee walker](/accessible-athens/knee-walker-rental-athens) lets you explore the Acropolis\u2019s paved areas hands-free.

[Browse Wheelchairs \u2192](/equipment/wheelchairs) | [Browse Mobility Scooters \u2192](/equipment/mobility-scooters)
`,
  },
  {
    slug: "athens-airport-wheelchair-guide",
    title: "Getting From Athens Airport With Mobility Equipment",
    excerpt:
      "Complete guide to navigating Athens Airport with a wheelchair or mobility scooter. Assistance, transport options, and equipment rental.",
    date: "2026-03-20",
    image: airportTransferImg,
    category: "Transport",
    recommendedEquipment: ["foldable-travel-scooter", "transit-wheelchair"],
    takeaways: [
      "Request PRM airport assistance through your airline at least 48 hours before travel",
      "The Metro Line 3 to Syntagma is fully step-free with elevators at every station",
      "We can deliver mobility equipment directly to the airport arrivals area",
    ],
    body: [],
    content: `
## Athens International Airport (ATH) — Accessibility Overview

Eleftherios Venizelos Airport is modern (opened 2001) and **fully accessible**:

- Elevators connecting all terminal levels
- Accessible restrooms throughout
- PRM (Persons with Reduced Mobility) assistance available
- Smooth, wide corridors suitable for all mobility equipment

## Airport Assistance

### How to Request Help

1. **Contact your airline** at least 48 hours before departure
2. Request PRM assistance (meet-and-assist service)
3. Staff will meet you at the aircraft door with a wheelchair
4. They'll assist through immigration, baggage claim, and to your transport

### What's Provided

- Wheelchair transport through the terminal
- Help with luggage
- Escort through security and immigration
- Transport to/from the gate

## Transport Options to Athens City Center

### Option 1: Pre-Booked Accessible Van (Recommended)

- **Price**: €50–70 to city center
- **Duration**: 35–50 minutes
- **Access**: Side ramp or rear lift for wheelchair users
- **Benefits**: Door-to-door, space for equipment, fixed price
- **Book through**: Your hotel, Welcome Pickups, or contact us

### Option 2: Metro Line 3 (Blue Line)

- **Price**: €9 one-way (free for disability card holders in some cases)
- **Duration**: 40 minutes to Syntagma
- **Access**: Elevators at all stations, level boarding, wheelchair spaces on trains
- **Runs**: Every 30 minutes, 6:30 AM – 11:30 PM
- **Downside**: No restroom on train, can be crowded with luggage

### Option 3: Express Bus X95

- **Price**: €6 one-way
- **Duration**: 60–90 minutes (traffic dependent)
- **Access**: Low-floor buses with deployable ramp (middle door)
- **Runs**: 24 hours
- **Downside**: Limited luggage space, bumpy ride

### Option 4: Taxi

- **Price**: €40 flat rate to city center (day), €55 (night)
- **Access**: Standard taxis are small sedans — **not suitable** for wheelchair users
- **Tip**: Request an accessible taxi through the airport info desk (limited availability)

## Our Airport Delivery Service

Don't want to travel with bulky mobility equipment?

- We deliver wheelchairs, scooters, and rollators to **Athens Airport arrivals**
- Equipment is sanitized, charged, and ready to use
- Delivery fee: **€25** to the airport
- [Book equipment for airport delivery →](/equipment)

## Tips

- **Charge batteries before flying**: Airlines require lithium batteries under 300Wh
- **Gate-check your wheelchair**: Request it so your chair arrives at the aircraft door, not baggage claim
- **Have your hotel address in Greek**: Helps taxi/van drivers navigate
- **Keep documentation handy**: Disability card, airline PRM confirmation, hotel booking

---

*Need mobility equipment for your Athens trip? [Browse our equipment →](/equipment)*
`,
  },
  {
    slug: "accessible-beaches-athens",
    title: "Accessible Beaches Near Athens — With Seatrac Wheelchair Access",
    excerpt:
      "Discover Athens beaches with Seatrac wheelchair lifts for sea access. Voula, Alimos, Glyfada & more — free to use, how to book.",
    date: "2026-03-25",
    image: beachesImg,
    category: "Outdoors",
    recommendedEquipment: ["electric-mobility-scooter"],
    takeaways: [
      "Seatrac autonomous sea-access lifts are free to use and installed at multiple Athens-area beaches",
      "Voula A, Alimos, Glyfada, and Varkiza beaches all have Seatrac systems and accessible facilities",
      "Visit in the morning for the shortest wait times and calmest water",
    ],
    body: [],
    content: `
## What is Seatrac?

**Seatrac** is a solar-powered autonomous system that allows wheelchair users to enter and exit the sea independently. Greece has installed over 200 units across the country, with several on beaches near Athens.

### How It Works

1. Transfer from your wheelchair to the Seatrac seat (fixed chair on a rail)
2. Use the waterproof remote control to move into the water
3. The rail extends from the beach into the sea at a gentle angle
4. Use the remote to return to the beach when ready
5. A lifeguard is always nearby to assist if needed

### Key Details

- **Cost**: Completely free
- **Hours**: Typically 9:00 AM – 7:00 PM (summer season, June–September)
- **Booking**: First-come, first-served at most beaches; some accept phone reservations
- **Companion**: A helper can walk alongside in the water

## Beaches with Seatrac Near Athens

### 1. Voula A Beach (Best Overall)

- **Distance**: 18 km from city center (~30 min by car)
- **Seatrac**: Yes — well-maintained unit
- **Facilities**: Accessible changing rooms, showers, paved paths to water, sunbed service, café
- **Entry**: Small fee for organized section (€5)
- **Getting there**: Tram to Voula + short taxi, or we can arrange transport
- **Tip**: Arrive before 10 AM for the best Seatrac availability

### 2. Alimos Beach (Closest to Athens)

- **Distance**: 10 km from city center (~20 min)
- **Seatrac**: Yes
- **Facilities**: Accessible parking (blue badge), paved boardwalk, cafeteria, showers
- **Entry**: Free
- **Getting there**: Bus A2 or B2 from Syntagma (low-floor accessible buses)
- **Tip**: The boardwalk is excellent for a seaside roll even if you don't swim

### 3. Glyfada Beach

- **Distance**: 16 km from city center (~25 min)
- **Seatrac**: Yes — at the organized beach section
- **Facilities**: Accessible restrooms, beach bar, sunbeds, parking
- **Entry**: Free beach + paid organized section
- **Getting there**: Tram to Glyfada, then 5-min taxi
- **Tip**: The Glyfada esplanade has several accessible cafés for post-beach refreshments

### 4. Varkiza Beach (YABANAKI)

- **Distance**: 25 km from city center (~35 min)
- **Seatrac**: Yes
- **Facilities**: Full resort-style beach — accessible changing, showers, restaurant, kids' area
- **Entry**: €5 weekdays, €7 weekends
- **Getting there**: Bus from Glyfada or taxi
- **Tip**: Quieter than closer beaches, beautiful bay, worth the drive

## Beach Tips for Wheelchair Users

- **Leave power chairs on the boardwalk**: Sand and saltwater damage electronics
- **Beach wheelchairs**: Some beaches have manual beach wheelchairs (big balloon tires) for loan — call ahead
- **Timing**: Morning is best — fewer crowds, calmer water, guaranteed Seatrac availability
- **Sun protection**: Bring SPF 50+, a hat, and plenty of water — Greek beach sun is intense
- **Companion recommended**: For transfers and navigating soft sand between boardwalk and Seatrac

## Pickup is Always Free

After a beach day, don't worry about returning equipment. Pickup is free from all delivery zones — just let us know when you're done.

---

*Need a wheelchair or scooter for your beach trip? [Browse our equipment →](/equipment)*
`,
  },
  {
    slug: "electric-wheelchair-rental-athens",
    title: "Electric Wheelchair Rental in Athens: Complete Guide 2026",
    excerpt:
      "Rent electric wheelchairs in Athens from €150 (1–3 days). Free hotel delivery, joystick control, all-day battery. Perfect for exploring the Acropolis and Plaka.",
    date: "2026-06-04",
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/mobility-scooter-acropolis-athens.png",
    category: "Equipment Guides",
    recommendedEquipment: ["foldable-power-wheelchair"],
    takeaways: [
      "Electric wheelchairs give you 15-20km range per charge — enough for a full day of Athens sightseeing",
      "Our foldable power wheelchair fits in taxi trunks and folds in 3 seconds",
      "The Acropolis, museums, and coastal promenades are all accessible with an electric wheelchair",
    ],
    body: [],
    content: `
Planning to visit Athens but worried about the walking distances and hilly terrain? An electric wheelchair can transform your trip, giving you the freedom to explore ancient ruins, vibrant neighborhoods, and scenic coastlines without exhaustion.

## Why Rent an Electric Wheelchair in Athens?

Athens is a city of hills. From the Acropolis perched above the city to the winding streets of Plaka, getting around can be challenging. An electric wheelchair gives you:

**Independence** — Control your own movement with a simple joystick. No need to rely on someone pushing you.

**Extended range** — Cover more ground without fatigue. Visit the Acropolis Museum in the morning, lunch in Monastiraki, and sunset at the Temple of Poseidon.

**All-day battery** — Our electric wheelchairs run 15-20km on a single charge, more than enough for a full day of sightseeing.

**Comfort** — Padded seats, adjustable armrests, and smooth suspension make long days comfortable.

## Our Electric Wheelchair Option

### Foldable Power Wheelchair

Our most popular choice for tourists. This wheelchair folds compactly for transport in taxis or storage at your hotel.

**Features:**
- Joystick control (left or right hand)
- 20km range per charge
- Maximum speed: 6 km/h
- Weight capacity: 120kg
- Folds in 3 seconds
- Fits in car trunks

**Price:** From €150 (1–3 days, discounts for weekly rentals)

## Where Can You Go With an Electric Wheelchair?

### The Acropolis

Yes, the Acropolis is accessible! There's an elevator from the base to the top, and paved pathways around the Parthenon. The electric wheelchair handles the slight inclines with ease. [Read our full Acropolis accessibility guide →](/accessible-athens/acropolis-wheelchair-guide)

### Acropolis Museum

Fully accessible with ramps, elevators, and wide corridors. The smooth marble floors are perfect for electric wheelchairs.

### Plaka & Monastiraki

The historic neighborhoods have a mix of surfaces. Stick to the main pedestrian streets (Adrianou, Ermou) for the smoothest ride. Some cobblestones exist, but an electric wheelchair handles them better than a manual chair.

### National Garden

Flat, shaded paths make this a perfect escape from the summer heat. The electric wheelchair lets you explore all 15 hectares without tiring.

### Piraeus & the Coast

The coastal tram line and seaside promenades are fully accessible. Roll along the Athens Riviera from Faliro to Glyfada.

## Practical Tips for Electric Wheelchair Users in Athens

### Charging

We provide a charger with every rental. Most hotels can accommodate overnight charging — just ask reception for a socket near your room. A full charge takes 4-6 hours.

### Transport

**Taxis:** Athens taxis can fit a folded electric wheelchair in the trunk. Book through the BEAT or Uber app and mention you have mobility equipment.

**Metro:** All metro stations have elevators and ramps. The trains have designated wheelchair spaces.

**Airport:** Athens Airport is fully accessible. We offer delivery and pickup directly at the airport (€50 fee). [See our airport guide →](/accessible-athens/athens-airport-wheelchair-guide)

### Weather Considerations

Athens summers are hot (35°C+). Our electric wheelchairs handle the heat, but we recommend:
- Carry water
- Use a sun umbrella attachment (available as accessory)
- Plan indoor breaks during midday (12-4pm)

## How to Rent an Electric Wheelchair in Athens

1. **Browse our equipment** — Check availability online
2. **Choose your dates** — Minimum 1-day rental
3. **Book and pay** — Secure online payment via Stripe
4. **We deliver** — Equipment arrives at your hotel, sanitized and fully charged
5. **We demonstrate** — Our team shows you how to operate everything safely
6. **Explore Athens** — Enjoy your trip!
7. **We collect** — Return pickup at your accommodation

### Delivery Zones

| Zone | Delivery Fee |
|------|--------------|
| Athens City Center | €20 |
| Piraeus Port | €25 |
| Athens Airport | €50 |
| Store Pickup (free) | €0 |

## Frequently Asked Questions

**Do I need a license to operate an electric wheelchair?**
No. Electric wheelchairs for personal mobility don't require any license in Greece.

**What if it breaks down?**
Call us immediately. We offer same-day replacement anywhere in Athens.

**Can I take it on a cruise ship?**
Yes. We regularly serve cruise passengers at Piraeus Port. We can deliver when your ship docks and collect before departure.

**Is insurance included?**
Basic equipment insurance is included. You're covered for normal use.

## Why Rent From Movability?

**Local expertise** — We're Athens-based with 30+ years of healthcare experience through Koinis Healthcare Group.

**Quality equipment** — Every wheelchair is inspected, sanitized, and fully charged before delivery.

**Responsive support** — Reach us 24/7 via WhatsApp at +30 697 463 3697.

**No hassle** — We deliver to your door and pick up when you're done.

Ready to explore Athens with complete freedom? Browse our electric wheelchair options and book online today.
    `,
  },
  {
    slug: "knee-walker-rental-athens",
    title: "Knee Walker Rental in Athens: The Comfortable Alternative to Crutches",
    excerpt:
      "Recovering from foot or ankle surgery in Athens? Rent a knee walker (knee scooter) from €49 — adjustable, foldable, with free store pickup or delivery across Athens.",
    date: "2026-07-14",
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/equipment-images/articles/knee-walker-athens-guide.webp",
    category: "Equipment Guides",
    recommendedEquipment: ["knee-walker", "rollator-walker"],
    takeaways: [
      "Rest your leg on a padded platform and glide — hands free, far easier than crutches",
      "From €49 per rental period; supports up to 136 kg; adjustable, foldable, sanitized",
      "Free pickup at 3 central Athens stores, or delivery to hotel, port, or airport",
    ],
    body: [],
    content: `
If you're recovering from a foot or ankle injury — surgery, a fracture, a torn Achilles — you already know the problem with crutches: they're exhausting, hard on your hands and shoulders, and risky on uneven ground. A knee walker (also called a knee scooter) solves all of that. You rest your injured leg on a padded platform and glide, keeping your hands free and your energy for better things.

## Who a knee walker is for

Knee walkers are ideal if you need to keep weight completely off one foot or ankle: after foot surgery, with a fractured foot or ankle, during Achilles tendon recovery, or with a below-the-knee injury. You'll need good balance and a healthy other leg — if that's you, most people find a knee walker dramatically easier than crutches within minutes.

If you can safely put *some* weight on the leg, a [rollator walker](/equipment/walking-aids/rollator-walker) may suit you better — but for strict non-weight-bearing recovery, the knee walker is the top choice.

## Why it beats crutches — especially in Athens

Athens is a wonderful city, but it isn't kind to crutches: marble pavements, curbs, and long distances between sights. On a knee walker you move faster, more safely, and without the underarm soreness. The basket carries your water, phone, and shopping — things you simply can't hold while on crutches.

## Our knee walker

Our knee walker rental includes an adjustable padded knee platform (set it to your exact height), reliable hand brakes, a storage basket, and a foldable steel frame that fits in a car boot or taxi. It supports users up to 136 kg. Every unit is fully sanitized between rentals.

[See the knee walker and book online →](/equipment/walking-aids/knee-walker)

## Pricing — per rental period, not per day

Pricing is per rental period, not per day:

- **1–3 days** — €49
- **4–7 days** — €79
- **8–14 days** — €149
- **15–30 days** — €199

Recovery from foot surgery typically takes weeks, so the longer periods work out to very little per day.

## Delivery or free pickup

Collect it free from any of our three Koinis Healthcare stores:

- **Athens Center** — Stadiou 31
- **Kallithea** — Davaki 16
- **Chalandri** — Kolokotroni 22

Or have it delivered:

- **Athens City** — €20
- **Piraeus Cruise Terminal** — €25
- **Athens Airport** — €50

Recovering locally? Store pickup makes this easy. Visiting Athens mid-recovery? We'll deliver to your hotel before you arrive.

## Frequently asked questions

**Is a knee walker better than crutches?**
For most below-knee injuries, yes: less effort, more stability, hands free. You do need one healthy leg and reasonable balance.

**Can I use it on Athens streets?**
Yes — pavements, pedestrian areas, museums, and most archaeological sites with paved paths. Very rough cobblestones require a little care, as with any wheeled device. Planning a big sight? See our [Acropolis accessibility guide](/accessible-athens/acropolis-wheelchair-guide).

**Do I need a prescription?**
No. Anyone can rent one, no paperwork needed.

**Can I book before I arrive in Athens?**
Absolutely — most customers book ahead and we have everything ready on arrival.

**Can I extend my rental if recovery takes longer?**
Yes, subject to availability — just message us on WhatsApp before your rental ends.

Have another question? Check our [full FAQ](/faq) or message us anytime.

## Ready to book?

Don't spend your recovery fighting with crutches. A knee walker keeps you mobile, comfortable, and independent — whether you're healing at home in Athens or determined not to miss your trip.

[Browse equipment](/equipment) | [Contact us](/contact) | WhatsApp: +30 697 463 3697
    `,
  },
];

/* ── Blog posts ─────────────────────────────────────────── */
export const blogPosts: Article[] = [
  {
    slug: "5-tips-wheelchair-travel-greece",
    title: "5 Tips for Traveling with a Wheelchair in Greece",
    excerpt:
      "Five honest, practical tips from our Athens team — rent locally instead of flying with your own chair, plan for the stone and the summer heat, use the metro and taxis, and keep local help one message away.",
    date: "2026-07-15",
    author: "Movability Team",
    image: wheelchairTravelImg,
    category: "Tips",
    takeaways: [
      "Rent locally instead of flying with powered equipment — delivered to your hotel, no airline battery hassle",
      "Athens mixes smooth pedestrian zones with marble and cobblestones — plan your surfaces (see our Acropolis guide)",
      "Metro Line 2 to Akropoli is step-free, and WhatsApp support keeps local help one message away",
    ],
    body: [],
    content: `
Traveling to Greece with a wheelchair, scooter, or rollator takes a little planning — but it's absolutely doable, and the reward is one of the most memorable destinations in the world. After years of helping visitors explore Athens, here are the five tips we share most often.

## 1. Rent your equipment locally instead of flying with your own

Bringing a powered wheelchair or scooter on a plane is one of the biggest sources of stress for travelers who use mobility equipment. Airlines don't always handle powered devices gently, batteries come with extra paperwork and restrictions, and a chair that's damaged in the hold can derail an entire trip.

Renting locally sidesteps all of that. We deliver a wheelchair, scooter, or rollator straight to your Athens hotel, ready to use the moment you arrive — and collect it when you leave. Your own equipment stays safe at home, and you travel light.

If you'd prefer to bring your own, that's completely fine too. But for many people — especially those with heavier powered chairs — renting on arrival is simply less to worry about. [See what we deliver →](/equipment)

## 2. Plan for the surfaces — marble and old stone

Athens is an ancient city, and it shows underfoot. Historic districts like Plaka have marble paving and cobblestones that can be uneven and, when polished smooth by centuries of footsteps, slippery. Around the archaeological sites you'll find paved paths alongside stretches of old stone.

None of this puts the city off-limits — it just rewards a little foresight:

- **Sturdy tyres** handle the terrain far better than a lightweight indoor chair.
- **A companion** to help over the bumpiest stretches makes a real difference.
- **Take the smoother route** when there's a choice; it's usually worth the small detour.

The Acropolis is the perfect example of "more accessible than you'd expect, with a few honest limits." For exactly what to expect — the elevator, the paved routes, and the parts that stay hard to reach — read our [complete Acropolis wheelchair guide](/accessible-athens/acropolis-wheelchair-guide).

## 3. Respect the summer heat

From late spring through early autumn, Athens gets genuinely hot, and much of the city — including the top of the Acropolis — offers little shade. Heat is tiring for everyone, and more so if you're self-propelling a manual chair.

A few simple habits go a long way:

- **Start early.** Mornings are cooler and quieter; the middle of the day is the hardest.
- **Carry water** and refill whenever you can.
- **Bring a hat and sunscreen**, and plan shaded breaks in cafes or air-conditioned museums.
- **Don't over-schedule** — two comfortable stops beat four rushed ones.

## 4. Getting around the city

Athens has a modern metro, and the **Akropoli station on Line 2 is step-free and accessible** — handy, since it drops you right by the Acropolis and its museum. For longer distances across the city, the metro is often the easiest option.

Taxis are the other workhorse. For the Acropolis specifically, ask your driver for the accessible **"green gate" drop-off** near the site — it saves you the steepest part of the approach. A folding wheelchair or foldable scooter makes both taxis and the metro much simpler, since they tuck into a boot or sit beside you with ease.

Wherever you're headed, build in a little extra time. Unhurried is the whole point of a good trip.

## 5. Keep local support one message away

The single biggest difference between a stressful trip and an easy one is knowing there's someone local you can reach. If a delivery time needs to shift, if you're unsure which entrance to use, or if something just isn't working, a quick message usually solves it.

We stay reachable on **WhatsApp at +30 697 463 3697** throughout your rental — before you arrive and while you're here. Ask us anything, from the best accessible route to a last-minute change of plans.

## Bonus: the coast is closer than you think

Athens isn't only ancient sites — the sea is a short ride away, and it's one of the nicest ways to cool off after a morning of sightseeing. Several beaches near the city have **Seatrac** installations: a system that lets you move from the shore into the sea independently, without needing to be lifted. If a beach day sounds good, see our guide to [accessible beaches near Athens](/accessible-athens/accessible-beaches-athens) for where to find them and what to expect.

## The bottom line

Greece is more welcoming than its ancient reputation suggests. Rent locally so you travel light, plan around the stone and the sun, use the metro and taxis to your advantage, and keep us on speed dial. Do that, and Athens opens right up.

Ready to make it easy? [See our mobility equipment and book delivery to your hotel →](/equipment)
`,
  },
  {
    slug: "what-to-pack-accessible-trip-athens",
    title: "What to Pack for an Accessible Trip to Athens",
    excerpt:
      "A genuine, accurate packing checklist for Athens — documents for free Acropolis admission, the right Type C/F power adapters, sun and comfort essentials, and the bulky mobility equipment you can skip entirely.",
    date: "2026-07-15",
    author: "Movability Team",
    image: packingImg,
    category: "Tips",
    takeaways: [
      "Free Acropolis admission for a documented 67%+ disability + one companion — bring your certificate (checked on-site, issued at the ticket desk, not online)",
      "Greece uses Type C/F plugs (230V) — pack adapters for your chargers",
      "Skip bulky equipment — renting on arrival with hotel delivery is easier than transporting your own",
    ],
    body: [],
    content: `
Packing for an accessible trip to Athens is mostly the same as any trip — with a few additions that make the difference between a smooth visit and a frustrating one. Here's what our team recommends, and just as importantly, what you can leave at home.

## Start with your documents

Keep the essentials together and easy to reach:

- **Proof of disability.** If you have a documented disability of **67% or more**, you and one companion enter the Acropolis **free** — whatever your nationality. Bring your official disability certificate or ID, as ticket staff do check it carefully, and pick up these free tickets at the **on-site ticket desk** rather than booking online.
- **Travel insurance details**, including anything that covers mobility equipment or medical needs.
- **A list of your medications** (generic names help) with enough supply for the whole trip, plus a little extra.
- **Your hotel address saved in Greek** on your phone — a real help for taxi drivers.

If you're renting equipment from us, there's no paperwork to pack for it — just your booking confirmation.

## Power and charging

Greece uses the standard European setup: **Type C and Type F plugs, 230V**. Coming from the UK, US, or anywhere with different sockets? Pack the right **travel adapters** — and bring more than one if you charge several devices overnight.

If you use a **powered wheelchair or scooter**, check that its charger is rated for 230V before you fly (most modern chargers handle a range automatically, but confirm). Renting locally sidesteps the question entirely — our equipment comes ready for Greek power. A small **power bank** is worth packing too, to keep your phone going through a long day of sightseeing.

## Comfort items for long days

Sightseeing is more tiring than it sounds, and small comforts pay off:

- **A cushion or seat pad** for long stretches of sitting.
- **Anti-fatigue gloves** if you self-propel a manual wheelchair — Athens' surfaces can be demanding.
- **A light layer** for cooler evenings and strongly air-conditioned interiors.
- **A day bag that clips to your chair or scooter**, so your hands stay free.
- **Wet wipes and hand sanitiser** for when facilities are further apart than you'd like.

## Sun protection

From late spring to early autumn, Athens is hot and often shadeless — the top of the Acropolis especially. Don't underestimate it:

- **A wide-brimmed hat** and **high-SPF sunscreen**.
- **Sunglasses.**
- **A refillable water bottle** — staying hydrated is the best defense against a wilting afternoon.
- **A clip-on umbrella or parasol** for your chair if you want shade you can take with you.

## Footwear and short transfers

Even if you use a wheelchair or scooter most of the time, bring **comfortable, supportive shoes with good grip**. You may transfer in and out of taxis, step over a threshold, or cover a short distance on foot — and Athens' polished marble and old stone can be slippery, especially in the historic centre. Sensible footwear is a small thing that saves a lot of wobble.

## Staying connected

Reliable data makes an accessible trip easier: live maps for step-free routes, quick translation, and a simple way to reach us. A **local SIM or eSIM** is usually cheap and easy to set up on arrival, and it means you can message us on **WhatsApp (+30 697 463 3697)** any time during your rental — to adjust a delivery, check a route, or ask a question. Save that number before you travel.

## What you can leave at home

Here's the part that lightens your luggage most: **you don't need to bring bulky mobility equipment.**

Flying with a wheelchair or scooter means wrestling it through airports, worrying about damage in the hold, and handling battery paperwork for powered devices. Instead, we **[deliver a wheelchair, scooter, or rollator](/equipment) straight to your Athens hotel** — ready when you arrive, collected when you leave. That frees up luggage space and removes one of the biggest travel headaches.

So unless you have a specific reason to bring your own, you can skip:

- The wheelchair or scooter itself
- Its charger and spare batteries
- Repair kits and spare parts

Let us handle the equipment; you handle the holiday.

## Your quick Athens packing checklist

- Disability documentation (free Acropolis admission for you and a companion)
- Medications and a copy of your prescriptions
- Type C/F travel adapters and a power bank
- Hat, high-SPF sunscreen, sunglasses, water bottle
- Cushion, light layer, chair-friendly day bag
- Comfortable footwear for short transfers

For more on getting around once you've landed, see our [five tips for wheelchair travel in Greece](/blog/5-tips-wheelchair-travel-greece); and for the country's most famous site, our [Acropolis wheelchair guide](/accessible-athens/acropolis-wheelchair-guide) covers exactly what to expect — including that free admission.

## Ready to travel light?

Pack for the fun parts and let the equipment be waiting for you. [Browse our mobility equipment and book delivery to your Athens hotel →](/equipment)
`,
  },
  {
    slug: "athens-becoming-more-accessible",
    title: "Why Athens Is Becoming More Accessible Every Year",
    excerpt:
      "An honest look at how Athens keeps getting more accessible — the Acropolis panoramic elevator, a step-free metro stop, Seatrac beaches — alongside a clear-eyed view of what still needs work.",
    date: "2026-07-15",
    author: "Movability Team",
    image: athensAccessibleImg,
    category: "Athens",
    takeaways: [
      "Acropolis panoramic elevator since Dec 2020 — free admission for disabled visitors",
      "Accessible metro plus Seatrac beach installations show real, ongoing progress",
      "Challenges remain — see our Honest Truth guide for the full picture",
    ],
    body: [],
    content: `
Athens has a reputation as a hard city for visitors with mobility needs — ancient streets, steep hills, and infrastructure built long before anyone thought about ramps. Some of that is fair. But the fuller story is that Athens has been steadily getting better, and the direction of travel is genuinely encouraging. Here's an honest look at the progress — and at what still needs work. Both halves matter: the progress is what makes a great trip possible, and the honesty is what makes it go smoothly.

## The Acropolis got a proper elevator

The clearest symbol of change sits on the **north slope of the Acropolis** itself. In **December 2020**, a new **panoramic accessibility elevator** opened, carrying **two wheelchair users plus their companions** to the top. The most iconic site in the country is now genuinely reachable for people who could never manage the ancient ramp and steps.

Admission is **free for disabled visitors and one companion**, and it's worth **calling ahead (+30 210 321 4172)** to confirm the lift is running before you set out. Taxis can use the accessible **"green gate" drop-off** near the site to save you the steepest part of the approach. It isn't flawless — some corners of the archaeological area remain hard to reach over old stone — but being able to stand beside the Parthenon is a real shift. Our [complete Acropolis wheelchair guide](/accessible-athens/acropolis-wheelchair-guide) walks through exactly what to expect.

## A step-free way to get there

Getting to the sites has improved too. The **Akropoli station on Metro Line 2 is step-free and accessible**, putting the Acropolis, its museum, and the surrounding neighbourhoods within reach without a single stair. For visitors who once had to rely entirely on taxis, a step-free metro stop right by the main attraction is a meaningful upgrade — and often the fastest way across town.

## The beaches opened up

Progress hasn't stopped at the monuments. Several beaches near Athens now have **Seatrac** installations — a system that lets a wheelchair user move from the shore into the sea and back **independently**. For anyone who assumed a Greek beach day was off the table, it's a small piece of engineering that quietly changes what a trip can include. Our guide to [accessible beaches near Athens](/accessible-athens/accessible-beaches-athens) covers where to find them.

## Honest about what's left

None of this means Athens is "solved." The historic centre still has marble and cobblestones that are uneven and, polished smooth over centuries, slippery. Not every site, street, or venue is accessible, and information can be patchy — you often only learn what's truly step-free by asking, or by turning up. Older buildings, narrow pavements, and the occasional out-of-service lift are still part of the picture.

We think honesty serves visitors better than hype. If you want the unvarnished version — what works, what doesn't, and how to plan around the gaps — read our [honest guide to wheelchair accessibility in Athens](/accessible-athens/athens-accessibility-honest-guide). The point isn't that Athens is perfect; it's that it keeps improving, and that with a little planning you can have a wonderful trip today.

## What this means for planning a trip

Put together, these changes add up to something simple: a well-planned accessible trip to Athens is far more realistic than it was even a decade ago. In a single visit you can reach the top of the Acropolis by lift, get there step-free on the metro, and spend an afternoon at a Seatrac beach — a combination that would have been hard to imagine not long ago.

The key word is still **planned**. Because accessibility varies from one place to the next, the visitors who have the smoothest time are the ones who sort the essentials in advance: how they'll move around the city, where they'll stay, and how they'll get the mobility equipment they need without hauling it across a continent. Get those right, and the city rewards the effort.

## Where we fit in

Some of the accessibility gap is closed by public investment. The rest gets closed by people on the ground — and that's where we come in. We're part of **Koinis Healthcare Group, a family business serving Greece since 1982**. We deliver mobility equipment to hotels and cruise terminals, share honest local knowledge, and stay reachable while you're here, so the practical side of an accessible trip is simply handled. Whether you're staying in the city centre, docking at Piraeus, or landing at the airport, we can have the right equipment waiting for you.

Every year, a little more of Athens opens up. Our job is to help you enjoy the parts that already have — and there are more of them than you might think.

## Plan your accessible Athens trip

Ready to explore the city on your own terms? [Browse our mobility equipment and book delivery to your hotel →](/equipment)
`,
  },
];
