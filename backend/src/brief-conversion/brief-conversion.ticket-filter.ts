import type { DeveloperTicket } from './brief-conversion.types';

/** Tickets must read as engineering tasks (opening verb). */
const IMPLEMENTATION_OPENING =
  /^(Implement|Build|Create|Add|Expose|Integrate|Wire|Persist|Develop|Configure|Extend|Introduce|Establish|Design|Migrate|Refactor|Optimize|Set up|Enable|Support)\b/i;

/**
 * Detects ticket text that describes advice, stakeholder comms, or research
 * instead of shippable engineering (these are dropped post-model).
 */
function isNonImplementationTicketText(text: string): boolean {
  const s = text.trim();
  if (!s) {
    return true;
  }

  const forbidden: RegExp[] = [
    /\badvis(e|ory|ing)\b/i,
    /\bclarif(y|ication|ying)\b/i,
    /\bfeasibilit(y|ies)\b/i,
    /\bhow\s+to\s+approach\b/i,
    /\breach\s+out\b/i,
    /\bcontact\s+(the\s+)?(stores?|retailers?|vendors?)\b/i,
    /\bask(\s+the)?\s+(the\s+)?(stores?|retailers?)\b/i,
    /\bapproach\s+to\s+request\b/i,
    /\b(request|get)\s+.*\b(stores?|retailers?)\b.*\b(access|permission|linking)\b/i,
    /\b(open\s+questions?|pending\s+clarification)\b/i,
    /\bstakeholder(s)?\b/i,
    /^recommend\b/i,
    /^evaluate\s+(the\s+)?(options?|approach|feasibility)\b/i,
    /^determine\s+(whether|if|how)\b/i,
    /^investigate\s+(whether|if|how)\b/i,
    /^research\s+(whether|if|how)\b/i,
    /^consider\s+(whether|if)\b/i,
    /\bworkshop\b/i,
    /\bfigure\s+out\b/i,
    /\bdecide\s+(whether|if|how)\b/i,
    /\bget\s+buy-?in\b/i,
    /\bwrite\s+a\s+(memo|email)\s+to\b/i,
  ];

  return forbidden.some((re) => re.test(s));
}

/**
 * Removes tickets that look like PM/consulting work rather than dev tasks.
 */
export function dropNonImplementationTickets(
  tickets: DeveloperTicket[],
): DeveloperTicket[] {
  return tickets.filter((t) => !isNonImplementationTicketText(t.text));
}

/**
 * Drops tickets that do not begin with an allowed implementation verb.
 */
export function dropTicketsMissingImplementationPrefix(
  tickets: DeveloperTicket[],
): DeveloperTicket[] {
  return tickets.filter((t) => IMPLEMENTATION_OPENING.test(t.text.trim()));
}

/**
 * Removes tickets that look like PM/consulting work rather than dev tasks,
 * then removes tickets without a proper implementation opening verb.
 */
export function sanitizeDevTickets(
  tickets: DeveloperTicket[],
): DeveloperTicket[] {
  return dropTicketsMissingImplementationPrefix(
    dropNonImplementationTickets(tickets),
  );
}
