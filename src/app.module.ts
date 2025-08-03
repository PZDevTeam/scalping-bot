import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ScalpingBotService } from './ScalpingBot/scalpingbot.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [ScalpingBotService],
  exports: [],
})
export class AppModule {}
