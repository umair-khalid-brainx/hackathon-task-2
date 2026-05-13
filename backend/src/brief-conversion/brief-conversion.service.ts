import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { OpenAiService } from '../openai/openai.service';
import { BRIEF_CONVERSION_SYSTEM_PROMPT } from './brief-conversion.prompt';
import { parseBriefConversionResult } from './brief-conversion.result';
import { BRIEF_CONVERSION_RESPONSE_FORMAT } from './brief-conversion.schema';
import type { BriefConversionResult } from './brief-conversion.types';

@Injectable()
export class BriefConversionService {
  private readonly logger = new Logger(BriefConversionService.name);

  constructor(private readonly openAi: OpenAiService) {}

  /**
   * Converts unstructured brief text into instruction strings and lifecycle-ordered tickets.
   */
  async convert(briefText: string): Promise<BriefConversionResult> {
    const userPayload = [
      '## Client brief (verbatim)',
      briefText.trim(),
      '',
      'Decompose the brief into many atomic "instructions" lines first. Then build many "tickets" by clustering those lines into Jira-sized dev tasks—not one ticket for the whole list, not one ticket per line. No clarification or feasibility tickets. Assume all decisions are final. JSON only.',
    ].join('\n');

    let raw: unknown;
    try {
      raw = await this.openAi.completePromptJson<unknown>(userPayload, {
        systemPrompt: BRIEF_CONVERSION_SYSTEM_PROMPT,
        jsonResponseFormat: BRIEF_CONVERSION_RESPONSE_FORMAT,
        temperature: 0.2,
        maxCompletionTokens: 16384,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`OpenAI brief conversion failed: ${message}`);
      throw new BadGatewayException(
        'Could not complete brief conversion. Verify OPENAI_API_KEY, OPENAI_MODEL, and try again.',
      );
    }

    try {
      return parseBriefConversionResult(raw);
    } catch (err) {
      if (err instanceof BadGatewayException) {
        throw err;
      }
      this.logger.error('Failed to parse brief conversion JSON', err);
      throw new InternalServerErrorException(
        'Unexpected error normalizing AI output',
      );
    }
  }
}
