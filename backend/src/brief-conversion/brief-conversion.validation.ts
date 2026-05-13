/**
 * Minimum number of Jira-style tickets expected for a given instruction count.
 * Prevents a single mega-ticket when the model produced a rich instruction breakdown.
 */
export function minimumTicketsForInstructionCount(
  instructionCount: number,
): number {
  if (instructionCount < 10) {
    return 0;
  }
  return Math.max(5, Math.ceil(instructionCount / 2.4));
}
