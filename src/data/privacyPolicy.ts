/**
 * Privacy policy content, EN + GR.
 *
 * SEPARATE FROM THE COMPONENT ON PURPOSE: the final wording is still with the
 * lawyer and the λογίστρια (the 5-year retention line), and the Greek translation
 * is outstanding. Only this file needs editing when the text arrives — the page
 * component does not change.
 *
 * `placeholder: true` renders a visible PENDING badge on that section. Remove the
 * flag once the real text is in. A section whose text is final but which still
 * carries the flag will look unfinished, which is the failure mode we want rather
 * than the reverse.
 *
 * The chat, retention and cookie sections below are drafted from what the code
 * ACTUALLY does, verified against it — they are a starting point for the lawyer,
 * not legal advice.
 */

export interface PolicySection {
  id: string;
  heading: string;
  /** A string is a paragraph; a string[] is a bulleted list. */
  body: (string | string[])[];
  placeholder?: boolean;
}

export interface PolicyDoc {
  metaTitle: string;
  metaDescription: string;
  title: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  pendingLabel: string;
  intro: string[];
  sections: PolicySection[];
  contactLine: string;
}

const en: PolicyDoc = {
  metaTitle: "Privacy Policy | Movability",
  metaDescription:
    "How Movability (KOINIS IKE) collects, uses and retains your personal data when you rent mobility equipment in Athens.",
  title: "Privacy Policy",
  lastUpdatedLabel: "Last updated",
  lastUpdated: "PENDING — set when the final text is approved",
  pendingLabel: "Pending legal review",
  intro: [
    "This policy explains what personal data we collect when you use movability.gr or rent equipment from us, why we collect it, how long we keep it, and what rights you have.",
    "The data controller is KOINIS IKE, Athens, Greece. You can reach us about anything in this policy at info@movability.gr.",
  ],
  sections: [
    {
      id: "controller",
      heading: "Who we are",
      placeholder: true,
      body: [
        "PENDING: full registered company name, registered address, VAT/ΑΦΜ, and the contact point for data protection.",
      ],
    },
    {
      id: "booking",
      heading: "Bookings and payments",
      placeholder: true,
      body: [
        "PENDING: the booking data we collect (name, email, phone, delivery address, rental dates) and the legal basis — performance of a contract.",
        "Card payments are handled by Stripe. We never see or store your card details.",
        "PENDING — awaiting the λογίστρια: the retention period for booking and invoice records (expected to be the statutory accounting period).",
      ],
    },
    {
      id: "special-requirements",
      heading: "Special requirements",
      body: [
        "The booking form has an optional free-text field for things that affect delivery — step-free access, narrow doorways, and similar. It does not ask for, and does not need, any diagnosis.",
        "If you enter anything in that field we ask you to tick an explicit consent box before you can continue, because the text may contain health information. That consent is the legal basis for processing it (GDPR Article 9(2)(a)), and we record that you gave it and when.",
        "We use the text solely to arrange and fulfil your rental, and we delete it automatically 60 days after your rental ends. The booking record itself is kept for accounting.",
      ],
    },
    {
      id: "chat",
      heading: "AI-assisted chat",
      body: [
        "Our website offers a chat assistant that uses artificial intelligence provided by Anthropic, acting as our data processor. The chat tells you it is an AI before you type anything.",
        "When you use it we store:",
        [
          "the conversation text",
          "the language you were using",
          "your browser's user-agent string",
          "a one-way salted hash of your IP address — we do not store your IP address itself",
        ],
        "We use this to answer your questions, improve the service, and prevent abuse, on the basis of our legitimate interest in operating and improving the site. Conversations are deleted automatically after 90 days.",
        "Please do not share health information, medical details, card numbers or identity-document numbers in the chat. The assistant does not need them and cannot give medical advice. You can ask us to delete your conversation at any time by emailing info@movability.gr.",
      ],
    },
    {
      id: "cookies",
      heading: "Cookies and analytics",
      body: [
        "We use Google Analytics 4 to understand how the site is used. It is not loaded until you accept it in the cookie banner — if you decline, no analytics script is loaded at all.",
        "Your choice is stored in your browser for 12 months. Analytics data is retained for 14 months.",
        "The chat widget also stores small values in your browser to remember that you have seen the introductory message. These stay on your device and are never sent to us.",
      ],
    },
    {
      id: "email",
      heading: "Emails we send",
      body: [
        "We email you about your booking — confirmation, delivery details, and an invitation to leave a review after your rental ends. If you start a booking and do not finish paying, we may send one reminder.",
        "Every automated email carries an opt-out link. Email is sent through Resend, acting as our processor.",
      ],
    },
    {
      id: "accounts",
      heading: "Accounts",
      placeholder: true,
      body: [
        "PENDING: account data, and the planned deletion of accounts after three years of inactivity with 30 days' notice.",
      ],
    },
    {
      id: "processors",
      heading: "Who we share data with",
      placeholder: true,
      body: [
        "PENDING: the full processor list with locations and transfer safeguards. Currently: Supabase (hosting and database), Vercel (hosting), Stripe (payments), Resend (email), Anthropic (chat AI), Google (analytics).",
      ],
    },
    {
      id: "rights",
      heading: "Your rights",
      placeholder: true,
      body: [
        "PENDING: access, rectification, erasure, restriction, objection, portability, and withdrawal of consent — plus how to exercise them and the response time.",
        "You also have the right to complain to the Hellenic Data Protection Authority (Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα).",
      ],
    },
  ],
  contactLine: "Questions about this policy? Email us at",
};

/**
 * Greek version.
 *
 * PENDING TRANSLATION. The headings are translated so the page is navigable in
 * Greek, but every body section is flagged pending: shipping a machine
 * translation of a legal document would be worse than shipping an obvious gap,
 * because a wrong legal statement in Greek is still a legal statement.
 */
const gr: PolicyDoc = {
  metaTitle: "Πολιτική Απορρήτου | Movability",
  metaDescription:
    "Πώς η Movability (ΚΟΪΝΗΣ ΙΚΕ) συλλέγει, χρησιμοποιεί και διατηρεί τα προσωπικά σας δεδομένα.",
  title: "Πολιτική Απορρήτου",
  lastUpdatedLabel: "Τελευταία ενημέρωση",
  lastUpdated: "ΕΚΚΡΕΜΕΙ",
  pendingLabel: "Εκκρεμεί νομικός έλεγχος",
  intro: [
    "ΕΚΚΡΕΜΕΙ ΜΕΤΑΦΡΑΣΗ. Το αγγλικό κείμενο είναι προς έγκριση· η ελληνική απόδοση θα προστεθεί μετά.",
    "Υπεύθυνος επεξεργασίας: ΚΟΪΝΗΣ ΙΚΕ, Αθήνα. Επικοινωνία: info@movability.gr",
  ],
  sections: [
    { id: "controller", heading: "Ποιοι είμαστε", placeholder: true, body: ["ΕΚΚΡΕΜΕΙ"] },
    { id: "booking", heading: "Κρατήσεις και πληρωμές", placeholder: true, body: ["ΕΚΚΡΕΜΕΙ"] },
    { id: "special-requirements", heading: "Ειδικές απαιτήσεις", placeholder: true, body: ["ΕΚΚΡΕΜΕΙ"] },
    { id: "chat", heading: "Συνομιλία με υποστήριξη AI", placeholder: true, body: ["ΕΚΚΡΕΜΕΙ"] },
    { id: "cookies", heading: "Cookies και αναλυτικά στοιχεία", placeholder: true, body: ["ΕΚΚΡΕΜΕΙ"] },
    { id: "email", heading: "Email που στέλνουμε", placeholder: true, body: ["ΕΚΚΡΕΜΕΙ"] },
    { id: "accounts", heading: "Λογαριασμοί", placeholder: true, body: ["ΕΚΚΡΕΜΕΙ"] },
    { id: "processors", heading: "Με ποιους μοιραζόμαστε δεδομένα", placeholder: true, body: ["ΕΚΚΡΕΜΕΙ"] },
    { id: "rights", heading: "Τα δικαιώματά σας", placeholder: true, body: ["ΕΚΚΡΕΜΕΙ"] },
  ],
  contactLine: "Ερωτήσεις για αυτήν την πολιτική; Στείλτε email στο",
};

export const privacyPolicy: Record<"en" | "gr", PolicyDoc> = { en, gr };
