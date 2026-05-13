import type OpenAI from 'openai';

/**
 * Structured Outputs schema: root has exactly `instructions` and `tickets`.
 * Matches the contract described in {@link BRIEF_CONVERSION_SYSTEM_PROMPT}.
 */
export const BRIEF_CONVERSION_RESPONSE_FORMAT = {
  type: 'json_schema',
  json_schema: {
    name: 'brief_conversion',
    strict: true,
    description:
      'Many atomic instruction strings, then many tickets synthesized by grouping instructions (not 1:1, not one mega-ticket).',
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        instructions: {
          type: 'array',
          description:
            'Many short imperative lines: one atomic build/verify step per string; decompose the whole brief.',
          items: {
            type: 'string',
          },
        },
        tickets: {
          type: 'array',
          description:
            'Sprint-sized dev tasks: each ticket summarizes several related instruction lines (cluster by layer/flow). Many tickets for rich briefs. Dependency order.',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              text: {
                type: 'string',
                description:
                  'Must start with Implement|Build|Create|Add|Expose|Integrate|Wire|Persist|Develop|Configure|Extend|Introduce|Establish|Design|Migrate|Refactor|Optimize|Set up|Enable|Support. Concrete dev task only; no advising or clarifying.',
              },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high'],
                description:
                  'high first in lifecycle = foundational; medium = core features; low = secondary or late-phase brief items.',
              },
            },
            required: ['text', 'priority'],
          },
        },
      },
      required: ['instructions', 'tickets'],
    },
  },
} as const satisfies Extract<
  NonNullable<
    OpenAI.Chat.ChatCompletionCreateParamsNonStreaming['response_format']
  >,
  { type: 'json_schema' }
>;
