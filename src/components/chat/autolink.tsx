import type { ReactNode } from "react";

/**
 * Turns model output into React nodes with clickable links — WITHOUT ever
 * rendering model text as markup.
 *
 * This is the trust boundary. Everything here arrives from an LLM, which means
 * it is influenced by whatever a visitor typed, so it is treated as hostile
 * text: we never pass it to dangerouslySetInnerHTML, never render a markdown
 * parser over it, and never build an href we did not validate ourselves.
 *
 * Rules:
 *  - `[text](url)` markdown is STRIPPED to the bare URL. The prompt tells the
 *    model not to emit it; this is the enforcement, because a prompt rule is a
 *    request and this is a guarantee.
 *  - Only `https://` becomes a link. `http://`, `javascript:`, `data:`,
 *    `mailto:` and protocol-relative `//evil` stay inert text.
 *  - Links open in a new tab with rel="noopener noreferrer" so the opened page
 *    cannot reach back through window.opener.
 */

/** Collapse markdown links to their URL: [Book here](https://x) -> https://x */
export function stripMarkdownLinks(text: string): string {
  return text
    // [label](url) and ![label](url)
    .replace(/!?\[([^\]\n]*)\]\(\s*(\S+?)\s*\)/g, (_m, _label, url) => url)
    // <https://x> autolink brackets
    .replace(/<(https:\/\/[^\s>]+)>/g, "$1");
}

// Matched separately from rendering so the pattern is auditable in one place.
// Trailing ) . , ; : ! ? and closing quotes are excluded so sentence
// punctuation does not end up inside the href.
const HTTPS_URL = /https:\/\/[^\s<>"'`]+[^\s<>"'`.,;:!?)\]}]/g;

/** Only absolute https URLs are linkable. Anything else renders as plain text. */
function isSafeHref(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Render assistant text with safe links. Returns an array of strings and
 * anchors — never HTML — so React escapes every text node for us.
 */
export function autolink(raw: string): ReactNode[] {
  const text = stripMarkdownLinks(raw);
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const match of text.matchAll(HTTPS_URL)) {
    const url = match[0];
    const start = match.index ?? 0;

    if (start > last) out.push(text.slice(last, start));

    if (isSafeHref(url)) {
      out.push(
        <a
          key={`lnk-${key++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all underline underline-offset-2 text-primary hover:no-underline"
        >
          {url}
        </a>,
      );
    } else {
      out.push(url);
    }
    last = start + url.length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out.length ? out : [text];
}
