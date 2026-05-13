import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export type OpenAiPromptOptions = {
  /** Optional system instructions (tone, output format, constraints). */
  systemPrompt?: string;
  temperature?: number;
  maxCompletionTokens?: number;
  /**
   * When set (e.g. `json_schema` for structured outputs), used as `response_format`
   * for {@link completePromptJson}. Defaults to `{ type: 'json_object' }`.
   */
  jsonResponseFormat?: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming['response_format'];
};

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const model = this.configService.get<string>('OPENAI_MODEL');

    if (!apiKey?.trim()) {
      throw new Error('OPENAI_API_KEY must be set and non-empty');
    }
    if (!model?.trim()) {
      throw new Error('OPENAI_MODEL must be set and non-empty');
    }

    this.client = new OpenAI({ apiKey });
    this.model = model.trim();
  }

  /**
   * Runs a single user prompt (and optional system message) against `OPENAI_MODEL`.
   * Returns the assistant message text, or an empty string if the API returns no content.
   */
  async completePrompt(
    userPrompt: string,
    options: OpenAiPromptOptions = {},
  ): Promise<string> {
    const trimmed = userPrompt?.trim();
    if (!trimmed) {
      throw new Error('userPrompt must be a non-empty string');
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (options.systemPrompt?.trim()) {
      messages.push({ role: 'system', content: options.systemPrompt.trim() });
    }
    messages.push({ role: 'user', content: trimmed });

    const body: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
      model: this.model,
      messages,
      ...(options.temperature != null && { temperature: options.temperature }),
      ...(options.maxCompletionTokens != null && {
        max_completion_tokens: options.maxCompletionTokens,
      }),
    };

    this.logger.debug(`Calling OpenAI chat.completions (model=${this.model})`);

    const response = await this.client.chat.completions.create(body);
    return this.extractTextContent(response.choices[0]?.message?.content);
  }

  /**
   * Same as {@link completePrompt} but requires the model to return a single JSON object
   * (`response_format: json_object`). The system prompt should describe the expected JSON shape.
   */
  async completePromptJson<T = unknown>(
    userPrompt: string,
    options: OpenAiPromptOptions = {},
  ): Promise<T> {
    const trimmed = userPrompt?.trim();
    if (!trimmed) {
      throw new Error('userPrompt must be a non-empty string');
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (options.systemPrompt?.trim()) {
      messages.push({ role: 'system', content: options.systemPrompt.trim() });
    }
    messages.push({ role: 'user', content: trimmed });

    const body: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
      model: this.model,
      messages,
      response_format: options.jsonResponseFormat ?? { type: 'json_object' },
      ...(options.temperature != null && { temperature: options.temperature }),
      ...(options.maxCompletionTokens != null && {
        max_completion_tokens: options.maxCompletionTokens,
      }),
    };

    this.logger.debug(
      `Calling OpenAI chat.completions JSON (model=${this.model})`,
    );

    const response = await this.client.chat.completions.create(body);
    const text = this.extractTextContent(
      response.choices[0]?.message?.content,
    ).trim();
    if (!text) {
      throw new Error('OpenAI returned empty content');
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error('OpenAI response was not valid JSON');
    }
  }

  private extractTextContent(
    content: OpenAI.Chat.ChatCompletionMessage['content'],
  ): string {
    if (content == null) {
      return '';
    }
    if (typeof content === 'string') {
      return content;
    }
    const parts = content as OpenAI.Chat.ChatCompletionContentPart[];
    return parts
      .filter(
        (part): part is OpenAI.Chat.ChatCompletionContentPartText =>
          part.type === 'text',
      )
      .map((part) => part.text)
      .join('');
  }
}
