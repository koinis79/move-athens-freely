"""Parses one claude-chat SSE response from stdin. Used by scripts/test-chat.sh.

Lives as its own file on purpose: piping into `python3 - <<'HEREDOC'` makes Python
read its PROGRAM from stdin, which silently discards the piped response — the whole
suite reported "[no text returned]" while the function was answering correctly.
"""
import sys, json

raw = sys.stdin.read()
status = ""
if "__HTTP_STATUS__" in raw:
    raw, status = raw.rsplit("__HTTP_STATUS__", 1)
    status = status.strip()

if status and status != "200":
    print(f"\033[31m   [HTTP {status}] {raw.strip()[:300]}\033[0m")
    if status == "429":
        print("   ^ the function's own per-IP limit: 8 conversations/hour.")
        print("     Each case opens a new session, so a full suite trips it.")
    sys.exit(0)

text, usage = [], None
for line in raw.splitlines():
    line = line.strip()
    if not line.startswith("data:"):
        continue
    try:
        d = json.loads(line[5:])
    except Exception:
        continue
    if "text" in d:
        text.append(d["text"])
    if "usage" in d:
        usage = d["usage"]
    if d.get("error"):
        print(f"\033[31m[ERROR event: {d['error']}]\033[0m")

print("".join(text) or "[no text returned]")
if usage:
    print(f"\n   [usage] in={usage.get('input_tokens')} "
          f"cache_read={usage.get('cache_read_input_tokens')} "
          f"cache_write={usage.get('cache_creation_input_tokens')} "
          f"out={usage.get('output_tokens')}")
