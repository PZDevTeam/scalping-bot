import { Injectable, OnModuleInit } from '@nestjs/common';
import { OrderBook } from './main';
// import { PrismaService } from 'src/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

const scalpingBotService = new OrderBook();

@Injectable()
class ScalpingBotService implements OnModuleInit {
  candle: number[] = [];
  // constructor(private readonly prisma: PrismaService) {}
  constructor() {
    // this.candle
  }
  async onModuleInit() {
    await scalpingBotService.subscribe();
    // Запуск бота при старте приложения
    // startScalpingBot(config.poolPublicKeyStr);
  }

  @Cron(CronExpression.EVERY_10_HOURS)
  saveBatch() {
    console.log('in batch');
    // const pkg = scalpingBotService.packageSend();

    // const summary = pkg['3ucNos4NbumPLZNWztqGHNFFgkHeRMBQAVemeeomsUxv'].SUMMARY;

    // const last = summary[summary.length - 1];

    // if (last) {
    //   this.candle.push(last.exchange_rate);

    // }

    // console.log(scalpingBotService.orderBook);
  }
}

export { ScalpingBotService };
