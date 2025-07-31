import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScalpingBotService } from './ScalpingBot/scalpingbot.service';
// import { PrismaService } from './prisma.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, ScalpingBotService],
  exports: [],
})
export class AppModule {}
