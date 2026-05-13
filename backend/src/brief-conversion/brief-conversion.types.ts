export type TicketPriority = 'low' | 'medium' | 'high';

export type DeveloperTicket = {
  text: string;
  priority: TicketPriority;
};

/**
 * API response: developer instruction lines and lifecycle-ordered tickets (no DB persistence).
 */
export type BriefConversionResult = {
  instructions: string[];
  tickets: DeveloperTicket[];
};
