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
- **Providers**: Welcome Pickups, Moveability partner transfers
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
    author: "Moveability Team",
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
    author: "Moveability Team",
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
