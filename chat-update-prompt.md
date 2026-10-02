# Chat update: fix the bot's dates and day counting, add suggested questions

Branch: feat/site-chatbot. Read this whole file before starting.

## Why this exists

A live test of the deployed claude-chat (commit 97c011a) failed:

- "Foldable travel scooter from 5 to 8 October, how much?" was answered as
  4 days at the second-tier price. Checkout counts it as 3 days (first tier).
- The product link it produced ended ?start=2025-10-05&end=2025-10-08.
  The year is wrong because the model has no idea what today's date is.
  The date prefill rejects a past date silently, so the customer gets an
  empty date picker.
- The reply showed its own arithmetic and corrected itself mid-sentence.

## Part A: function and system prompt (needs a manual redeploy by me)

A1. Find how BookingPanel computes numDays and which tier it picks
(end minus start, or inclusive). Use THAT rule, not an assumption.
Report in one line what the code does, with the file and line.

A2. Inject today's date. Compute it per request in the Europe/Athens
time zone and add it as a THIRD block in the top-level system array,
for example "Today is Friday 2 October 2026 (Athens time)". Put it
AFTER both existing cache breakpoints and give it no cache_control, so
the cached prefix is untouched. Never put user text into any system
block. After the change, the second identical request must still show
cache_read_input_tokens above zero. Verify and report both numbers.

A3. Add to the system prompt, in the prices section:
"Rental days are counted exactly the way our checkout counts them
(use the rule from A1: for example, if checkout is end date minus
start date, then 5 to 8 October is 3 days). Choose the tier from that
count (1-3, 4-7, 8-14, 15-30 days) and state the count in one short
phrase, for example '5-8 October counts as 3 days'. Work the numbers
out silently. Never show arithmetic, never list the days one by one,
and never correct yourself inside a reply. The exact total appears on
the product page once the dates are chosen."

A4. Add: "If a date has no year, use the next upcoming occurrence of
that date, based on today's date. Write dates in links in ISO format
(YYYY-MM-DD). If the end date is the same as or before the start date,
or a date could be read two ways (for example 03/04), ask the customer
to confirm instead of guessing."

A5. Add: "When a customer gives dates: if the equipment is not clear,
ask one question to find out which. Then give the price tier for those
dates, link the product page with the dates appended
(?start=YYYY-MM-DD&end=YYYY-MM-DD, as already specified), and offer
the WhatsApp handoff with the equipment and dates in the prefilled
text. Never confirm availability. Keep the whole reply to at most four
short sentences plus the links."

A6. Add: "For rentals longer than 30 days, say we quote those
individually and hand the customer to WhatsApp."

A7. Regenerate the function file, push, and give me the pinned-commit
raw URL.

## Part B: chat panel (preview)

B1. When the conversation is empty, show a greeting and seven
suggestion buttons, in English or Greek by the active site language,
in this order:

1. What do you rent? / Τι εξοπλισμό νοικιάζετε;
2. I want to book from … to … / Θέλω να κάνω κράτηση από … έως …  (special, see B2)
3. How much is a wheelchair for a week? / Πόσο κοστίζει ένα αμαξίδιο για μία εβδομάδα;
4. Can you deliver to my hotel? What does it cost? / Μπορείτε να παραδώσετε στο ξενοδοχείο μου; Πόσο κοστίζει;
5. I hurt my ankle on holiday. What can I get today? / Τραυματίστηκα στον αστράγαλο στις διακοπές. Τι μπορώ να πάρω σήμερα;
6. Is the Acropolis wheelchair accessible? / Είναι προσβάσιμη η Ακρόπολη με αναπηρικό αμαξίδιο;
7. How does the security deposit work? / Πώς λειτουργεί η εγγύηση;

Greeting (EN): "Hi! I can answer questions about our equipment, prices, delivery and getting around Athens. Try one of these:"
Greeting (GR): "Γεια σας! Μπορώ να απαντήσω σε ερωτήσεις για τον εξοπλισμό, τις τιμές, την παράδοση και τη μετακίνηση στην Αθήνα. Δοκιμάστε μία από αυτές:"

B2. The booking button does NOT send a message. It fills the text
input with "I want to book from " (GR: "Θέλω να κάνω κράτηση από "),
focuses the input and puts the cursor at the end. All other buttons
send their text as the visitor's first message, exactly as if typed.
After the first message the suggestions are hidden for that
conversation.

B3. Static UI text, never sent to the model, never logged, never
counted against the turn cap: the greeting, and a line under the input:
"For medical questions, please ask your doctor." / "Για ιατρικά
ζητήματα, παρακαλούμε ρωτήστε τον γιατρό σας."

B4. Accessibility and layout: real button elements in a labelled
group, at least 44px tall, reachable by keyboard in order, visible
focus ring. Opening the panel must not move focus onto a suggestion.
At 320x568 the text input must stay visible with the suggestions
showing; if it does not, show only the first four on small screens.
Suggestions wrap and never overflow.

B5. Instrument chat_suggestion_click with the button's index (not its
text) through the existing trackEvent helper.

B6. If the launcher is not yet larger than before, make it larger:
phone pill 52px tall (label 16px semi-bold, icon 22px), WhatsApp icon
button 52x52, desktop pill 56px tall (label 17px). Then redo the
geometry: the teaser bubble must clear the taller row by at least 12px
(count the 2px dark-mode ring), both sticky bars (article CTA, product
booking bar) must clear the row's bottom edge, and at 320px the row
with the "Ask us" and "Ρωτήστε" labels must fit. Report each number.

## Part C: tests before pushing

Send each of these to the function (build the request the way the
widget does, language "en" unless stated) and paste me the FULL replies.
Do not change the prompt beyond Part A while doing this.

- "Foldable travel scooter from 5 to 8 October, how much?"
  Expected: 3 days, first tier, link ending ?start=2026-10-05&end=2026-10-08
- "Foldable travel scooter from 5 to 12 October, how much?"
  Expected: 7 days, second tier, correct year in the link
- "Foldable travel scooter from 5 to 8 October" (no question)
  Expected: same, no self-correction, at most four short sentences
- "01.10 to 05.10" (European format): must confirm, or state the count
- "Do you have the knee walker?": plain product URL, no date parameters
- "I want to book from 10 October to 14 October": asks which equipment
- "I want it for 45 days": says we quote that individually, WhatsApp
- the six other suggestions in English, then the Greek versions with language "gr"

Also report: the second identical request shows cache_read_input_tokens
above zero after A2.

## Part D: finish

Push to the branch. Give me the new preview URL and the pinned-commit
raw URL for the function. Add a work-log line and a note in the docs
about the day-counting rule and the injected date.
