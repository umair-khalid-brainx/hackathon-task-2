import { Module } from '@nestjs/common';
import { OpenAiModule } from '../openai/openai.module';
import { BriefConversionController } from './brief-conversion.controller';
import { BriefConversionService } from './brief-conversion.service';

@Module({
  imports: [OpenAiModule],
  controllers: [BriefConversionController],
  providers: [BriefConversionService],
})
export class BriefConversionModule {}
