#!/usr/bin/env bash
#
# Part C test suite for the claude-chat edge function.
#
# RUN THIS AFTER REDEPLOYING claude-chat — edge functions do not deploy from git
# (docs §2 lesson 12), so until the new index.ts is pasted into the dashboard this
# script exercises the OLD prompt and the date tests will fail by design.
#
#   bash scripts/test-chat.sh            # English suite + cache check
#   bash scripts/test-chat.sh gr         # Greek suite
#
# Each case prints the full reply, then the usage line. What to look for is
# printed above each reply as "expect: ...".
#
# Costs a few cents per full run (Sonnet 5, ~8K cached input per call).

set -uo pipefail

FN_URL="https://lmgpuqgwkiapgpdsxvmb.supabase.co/functions/v1/claude-chat"
# Publishable key — the same one the browser ships. Safe to have here.
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZ3B1cWd3a2lhcGdwZHN4dm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNjc1NzksImV4cCI6MjA4Nzk0MzU3OX0.WTs1-rimMSZtPoedl7qgxiWXGOJm8-yMaUEKfU7XuCI"

LANG_CODE="${1:-en}"

ask() {              # ask "<expectation>" "<message>" [session_id]
  local expect="$1" msg="$2" sess="${3:-$(python3 -c 'import uuid;print(uuid.uuid4())')}"
  printf '\n\033[1m── %s\033[0m\n' "$msg"
  printf '   expect: %s\n\n' "$expect"
  local body
  body=$(python3 - "$sess" "$LANG_CODE" "$msg" <<'PY'
import json, sys
sess, lang, msg = sys.argv[1], sys.argv[2], sys.argv[3]
print(json.dumps({"session_id": sess, "language": lang,
                  "messages": [{"role": "user", "content": msg}]}))
PY
)
  curl -s -X POST "$FN_URL" \
    -H "Content-Type: application/json" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
    --max-time 90 -d "$body" \
  | python3 - <<'PY'
import sys, json
text, usage = [], None
for line in sys.stdin:
    line = line.strip()
    if not line.startswith("data:"): continue
    try: d = json.loads(line[5:])
    except Exception: continue
    if "text" in d: text.append(d["text"])
    if "usage" in d: usage = d["usage"]
    if d.get("error"): print(f"[ERROR event: {d['error']}]")
print("".join(text) or "[no text returned]")
if usage:
    print(f"\n   [usage] in={usage.get('input_tokens')} "
          f"cache_read={usage.get('cache_read_input_tokens')} "
          f"cache_write={usage.get('cache_creation_input_tokens')} "
          f"out={usage.get('output_tokens')}")
PY
}

echo "════════════════════════════════════════════════════════"
echo " Part C — claude-chat suite   (language: $LANG_CODE)"
echo " Day counting is EXCLUSIVE: end − start. 5→8 Oct = 3 days."
echo "════════════════════════════════════════════════════════"

if [ "$LANG_CODE" = "en" ]; then
  ask "3 days, FIRST tier, link ending ?start=2026-10-05&end=2026-10-08" \
      "Foldable travel scooter from 5 to 8 October, how much?"
  ask "7 days, SECOND tier, correct year in the link" \
      "Foldable travel scooter from 5 to 12 October, how much?"
  ask "same as the first; no self-correction, <=4 short sentences" \
      "Foldable travel scooter from 5 to 8 October"
  ask "asks to confirm the ambiguous format, OR states the count explicitly" \
      "01.10 to 05.10"
  ask "plain product URL, NO date parameters" \
      "Do you have the knee walker?"
  ask "asks WHICH equipment (one question)" \
      "I want to book from 10 October to 14 October"
  ask "quoted individually + WhatsApp handoff; no tier price" \
      "I want it for 45 days"
  # The six non-booking suggestions, as the panel sends them.
  ask "lists only the 9 real products; no crutches or ramps" "What do you rent?"
  ask "a wheelchair at the 4-7 day tier" "How much is a wheelchair for a week?"
  ask "zone fee from live data, stated once (not 'each way')" \
      "Can you deliver to my hotel? What does it cost?"
  ask "kind, fast, knee walker / wheelchair; no diagnosis; WhatsApp" \
      "I hurt my ankle on holiday. What can I get today?"
  ask "links the Acropolis guide; does NOT state the entrance or lift location" \
      "Is the Acropolis wheelchair accessible?"
  ask "deposit vs 30% down payment kept separate" "How does the security deposit work?"
else
  ask "3 ημέρες, πρώτη κλίμακα, σωστή χρονιά στο link" \
      "Πτυσσόμενο scooter ταξιδίου από 5 έως 8 Οκτωβρίου, πόσο κοστίζει;"
  ask "απαντά στα ελληνικά, μόνο τα 9 πραγματικά προϊόντα" "Τι εξοπλισμό νοικιάζετε;"
  ask "αμαξίδιο, κλίμακα 4-7 ημερών" "Πόσο κοστίζει ένα αμαξίδιο για μία εβδομάδα;"
  ask "τέλος ζώνης μία φορά, όχι 'ανά κατεύθυνση'" \
      "Μπορείτε να παραδώσετε στο ξενοδοχείο μου; Πόσο κοστίζει;"
  ask "ευγενικό, γρήγορο, χωρίς διάγνωση, WhatsApp" \
      "Τραυματίστηκα στον αστράγαλο στις διακοπές. Τι μπορώ να πάρω σήμερα;"
  ask "συνδέει τον οδηγό· ΔΕΝ αναφέρει πού είναι η είσοδος/ανελκυστήρας" \
      "Είναι προσβάσιμη η Ακρόπολη με αναπηρικό αμαξίδιο;"
  ask "εγγύηση και προκαταβολή 30% ξεχωριστά" "Πώς λειτουργεί η εγγύηση;"
fi

# A2 — the cached prefix must survive the added date block.
echo
echo "════════════════════════════════════════════════════════"
echo " A2 cache check — two IDENTICAL requests back to back."
echo " Expect: 1st writes the cache, 2nd reads it (cache_read > 0)."
echo " A zero on the second run means the date block is invalidating"
echo " the prefix — it must sit after the last breakpoint with no"
echo " cache_control of its own."
echo "════════════════════════════════════════════════════════"
ask "cache WRITE on this first call" "What do you rent?"
ask "cache READ > 0 on this second, identical call" "What do you rent?"
