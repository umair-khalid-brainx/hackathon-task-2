import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { BriefConversionService } from './brief-conversion.service';
import { ConvertBriefDto } from './dto/convert-brief.dto';
import type { BriefConversionResult } from './brief-conversion.types';

@Controller('api/briefs')
export class BriefConversionController {
  constructor(private readonly briefConversion: BriefConversionService) {}

  /**
   * POST body: { "text": "<plain text brief>" }
   */
  @Post('convert')
  @HttpCode(200)
  async convert(@Body() dto: ConvertBriefDto): Promise<BriefConversionResult> {
    return this.briefConversion.convert(dto.text);
  }
}
