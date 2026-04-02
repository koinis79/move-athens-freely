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
}

/* ── Accessible Athens guides ───────────────────────────── */
export const guides: Article[] = [
  {
    slug: "athens-accessibility-honest-guide",
    title: "The Honest Truth About Wheelchair Accessibility in Athens",
    excerpt:
      "Athens has made progress, but challenges remain. Here's what to actually expect \u2014 the good, the bad, and how to navigate it all.",
    date: "2026-04-02",
    image: athensAccessibleImg,
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

We deliver wheelchairs, scooters, and rollators directly to your hotel. Free delivery in the city center.

[Browse Equipment \u2192](/equipment) | [Contact Us \u2192](/contact)
`,
  },
  {
    slug: "acropolis",
    title: "Is the Acropolis Wheelchair Accessible?",
    excerpt:
      "Everything you need to know about visiting the Acropolis with a wheelchair or mobility aid — ramps, elevators, and what to expect.",
    date: "2026-01-15",
    image: acropolisImg,
    category: "Attractions",
    takeaways: [
      "Use the elevator at the North Slope entrance — it's free and fits wheelchairs and scooters",
      "Arrive before 10am to avoid crowds on the accessible concrete pathways",
      "The original marble surfaces are uneven — stick to the modern paved routes",
    ],
    body: [],
    content: `
## Getting There: The Accessible Entrance

Forget the main tourist entrance with its steep, marble steps. Head to the **North Slope entrance** near the Acropolis Museum instead.

- **Dedicated pathway**: A smooth, paved route leads directly to the elevator
- **Glass elevator**: Free to use, fits standard wheelchairs and most mobility scooters
- **Operating hours**: Same as the site — opens 8am in summer, 8:30am in winter

## Navigating the Top

Once you're up, the Greek Ministry of Culture has installed **wide concrete pathways** that loop around the major monuments.

### What's Accessible

- **The Parthenon**: Full loop around the exterior on paved paths
- **The Erechtheion**: Accessible viewing area with the famous Caryatid porch
- **The Propylaea**: Partial access to the monumental gateway

### What to Avoid

- **Original marble surfaces**: Extremely uneven and slippery — do not leave the concrete paths
- **The south slope**: Steeper grades, better suited for walking visitors

## Recommended Equipment

Standard small-wheeled manual wheelchairs will struggle here. We recommend:

1. **4-Wheel Mobility Scooter**: Best stability over gaps in the ancient paving
2. **Heavy-duty wheelchair**: Larger wheels handle the terrain better
3. **Power-assist attachment**: If using a manual chair, a front-wheel motor helps with inclines

## Practical Tips

- **Tickets**: Free entry for visitors with disabilities + one companion
- **Restrooms**: Accessible facilities near the elevator entrance
- **Water**: Bring your own — the cafe at the top has steps
- **Best time**: Early morning or late afternoon for cooler temperatures and fewer crowds
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
    slug: "airport-transfer",
    title: "Getting from Athens Airport with Mobility Equipment",
    excerpt:
      "How to arrange an accessible transfer from Athens International Airport to your hotel — options, costs, and tips.",
    date: "2026-03-05",
    image: airportTransferImg,
    category: "Transport",
    takeaways: [
      "Athens Airport is fully accessible — request assistance at check-in or via your airline 48h ahead",
      "The metro to the city center is step-free but takes 40 minutes and has no restroom",
      "Pre-book an accessible van for the most comfortable, direct transfer to your hotel",
    ],
    body: [],
    content: `
## Athens International Airport (ATH)

Eleftherios Venizelos Airport is **modern and fully accessible**, built in 2001.

### At the Airport

- **Assistance**: Request PRM (Persons with Reduced Mobility) service through your airline at least 48 hours before travel
- **Wheelchairs**: Available at arrivals — staff will meet you at the aircraft door
- **Accessible restrooms**: Throughout all terminals
- **Elevators**: Connect all levels of the terminal

## Transfer Options to Athens

### Option 1: Pre-Booked Accessible Van (Recommended)

The most comfortable option, especially after a long flight:

- **Price**: €50-70 to city center hotels
- **Providers**: Welcome Pickups, Movability partner transfers
- **Benefits**: Door-to-door, space for equipment, fixed price, driver meets you at arrivals

### Option 2: Metro (Line 3)

Direct train to Syntagma Square in the city center:

- **Price**: €9 one-way
- **Duration**: 40 minutes
- **Accessibility**: Elevators at all stations, level boarding, wheelchair spaces
- **Downside**: No restroom on train, crowded with luggage at peak times

### Option 3: Bus X95

Express bus to Syntagma Square:

- **Price**: €6 one-way
- **Duration**: 60-90 minutes depending on traffic
- **Accessibility**: Low-floor buses with ramp, but luggage space is limited
- **Runs**: 24 hours

## Arriving with Your Own Equipment

If you're bringing your own wheelchair or scooter:

- **Battery rules**: Lithium batteries must be under 300Wh (check airline policy)
- **Gate-check**: Request gate-check so your chair arrives at the aircraft door
- **Damage claims**: Inspect equipment immediately and report any damage before leaving the airport

## Tips

- **Book assistance early**: Airlines require 48-hour notice for PRM services
- **Charge batteries**: Top up before you fly — you'll need mobility at arrival
- **Have hotel address ready**: Written in Greek helps taxi/van drivers
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
    image: "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/mobility-scooter-acropolis-athens.png",
    category: "Attractions",
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

We deliver wheelchairs and mobility scooters directly to your Athens hotel. Free delivery in the city center.

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
];

/* ── Blog posts ─────────────────────────────────────────── */
export const blogPosts: Article[] = [
  {
    slug: "5-tips-wheelchair-travel-greece",
    title: "5 Tips for Traveling with a Wheelchair in Greece",
    excerpt:
      "Practical advice from our team on making your Greek holiday smoother, more comfortable, and more enjoyable.",
    date: "2026-02-05",
    author: "Movability Team",
    image: wheelchairTravelImg,
    category: "Tips",
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
    author: "Movability Team",
    image: packingImg,
    category: "Tips",
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
    author: "Movability Team",
    image: athensAccessibleImg,
    category: "Athens",
    body: [
      "Athens has historically been a challenging city for visitors with mobility needs. Steep hills, ancient cobblestone streets, and older infrastructure created real barriers. But over the past decade, the city has made remarkable progress.",
      "The installation of an elevator at the Acropolis was a landmark moment — literally and figuratively. For the first time, wheelchair users could independently access one of the world's most important archaeological sites. The adjacent Acropolis Museum was built from the ground up with universal design principles.",
      "The Athens metro, completed for the 2004 Olympics, set a new standard. Every station has elevators, tactile guidance, and audio announcements. The coastal tram is similarly modern and accessible. Newer bus fleets feature low floors and boarding ramps.",
      "Looking ahead, the city continues to invest. Pedestrian zones are being expanded and repaved with smooth surfaces. New hotels are required to meet accessibility standards. And organizations like ours are filling the gaps by providing equipment, local guides, and honest accessibility information.",
    ],
  },
];
