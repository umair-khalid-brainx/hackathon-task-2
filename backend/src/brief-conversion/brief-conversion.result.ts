import { BadGatewayException } from '@nestjs/common';
import { sanitizeDevTickets } from './brief-conversion.ticket-filter';
import type {
  BriefConversionResult,
  DeveloperTicket,
  TicketPriority,
} from './brief-conversion.types';
import { minimumTicketsForInstructionCount } from './brief-conversion.validation';

const PRIORITIES = new Set<TicketPriority>(['low', 'medium', 'high']);

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function normalizePriority(v: unknown): TicketPriority | null {
  if (typeof v !== 'string') {
    return null;
  }
  const p = v.trim().toLowerCase();
  return PRIORITIES.has(p as TicketPriority) ? (p as TicketPriority) : null;
}

function asInstructions(v: unknown): string[] {
  if (!Array.isArray(v)) {
    return [];
  }
  return v
    .filter((x): x is string => typeof x === 'string')
    .map((s) => s.trim())
    .filter(Boolean);
}

function asTickets(v: unknown): DeveloperTicket[] {
  if (!Array.isArray(v)) {
    return [];
  }
  const out: DeveloperTicket[] = [];
  for (const item of v) {
    if (!isRecord(item)) {
      continue;
    }
    const text = typeof item.text === 'string' ? item.text.trim() : '';
    const priority = normalizePriority(item.priority);
    if (!text || !priority) {
      throw new BadGatewayException(
        'Each ticket must be an object with non-empty "text" and priority one of: low, medium, high',
      );
    }
    out.push({ text, priority });
  }
  return out;
}

/**
 * Validates AI JSON into {@link BriefConversionResult}.
 */
export function parseBriefConversionResult(
  raw: unknown,
): BriefConversionResult {
  if (!isRecord(raw)) {
    throw new BadGatewayException('AI response was not a JSON object');
  }

  const keySet = new Set(Object.keys(raw));
  if (
    keySet.size !== 2 ||
    !keySet.has('instructions') ||
    !keySet.has('tickets')
  ) {
    throw new BadGatewayException(
      'AI response root must contain exactly the keys "instructions" and "tickets"',
    );
  }

  if (!Array.isArray(raw.instructions) || !Array.isArray(raw.tickets)) {
    throw new BadGatewayException(
      'AI response fields "instructions" and "tickets" must be JSON arrays',
    );
  }

  const instructions = asInstructions(raw.instructions);
  const tickets = sanitizeDevTickets(asTickets(raw.tickets));

  if (instructions.length === 0 && tickets.length === 0) {
    throw new BadGatewayException(
      'AI response contained no usable instructions or tickets for this brief',
    );
  }

  if (instructions.length >= 6 && tickets.length === 0) {
    throw new BadGatewayException(
      'No implementation-only developer tickets were produced. Please run conversion again.',
    );
  }

  const minTickets = minimumTicketsForInstructionCount(instructions.length);
  if (minTickets > 0 && tickets.length < minTickets) {
    throw new BadGatewayException(
      `Expected at least ${minTickets} distinct Jira-style tickets for ${instructions.length} instruction lines (cluster instructions into multiple tickets; not one mega-ticket). Please run conversion again.`,
    );
  }

  return { instructions, tickets };
}
