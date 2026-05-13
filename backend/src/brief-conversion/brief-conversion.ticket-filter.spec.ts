import { sanitizeDevTickets } from './brief-conversion.ticket-filter';
import type { DeveloperTicket } from './brief-conversion.types';

describe('sanitizeDevTickets', () => {
  it('removes advise-on-store tickets', () => {
    const tickets: DeveloperTicket[] = [
      {
        text: 'Advise on approach to request store account linking for importing previous purchase lists.',
        priority: 'high',
      },
      {
        text: 'Implement OAuth-based retailer account linking and token storage for order history import.',
        priority: 'high',
      },
    ];
    const out = sanitizeDevTickets(tickets);
    expect(out).toHaveLength(1);
    expect(out[0].text).toContain('Implement OAuth');
  });

  it('removes tickets without an implementation opening verb', () => {
    const tickets: DeveloperTicket[] = [
      {
        text: 'Purchase history should support barcode scan.',
        priority: 'medium',
      },
      {
        text: 'Build purchase history screen with barcode scan flow.',
        priority: 'medium',
      },
    ];
    const out = sanitizeDevTickets(tickets);
    expect(out).toHaveLength(1);
    expect(out[0].text.startsWith('Build')).toBe(true);
  });
});
