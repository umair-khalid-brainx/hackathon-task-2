import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BriefConversionModule } from './brief-conversion/brief-conversion.module';
import { OpenAiModule } from './openai/openai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    OpenAiModule,
    BriefConversionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
