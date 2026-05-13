import { minimumTicketsForInstructionCount } from './brief-conversion.validation';

describe('minimumTicketsForInstructionCount', () => {
  it('returns 0 when instruction list is short (no ratio enforcement)', () => {
    expect(minimumTicketsForInstructionCount(9)).toBe(0);
  });

  it('requires several tickets for long breakdowns', () => {
    expect(minimumTicketsForInstructionCount(12)).toBe(5);
    expect(minimumTicketsForInstructionCount(15)).toBe(7);
    expect(minimumTicketsForInstructionCount(18)).toBe(8);
  });
});
