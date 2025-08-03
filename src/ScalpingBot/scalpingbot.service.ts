import { Injectable, OnModuleInit } from '@nestjs/common';
import { OrderBook } from './main';
// import { PrismaService } from 'src/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

const scalpingBotService = new OrderBook();

@Injectable()
class ScalpingBotService implements OnModuleInit {
  candle: number[] = [];
  constructor(private readonly prisma: PrismaService) {}
  async onModuleInit() {
    await scalpingBotService.subscribe();
    // Запуск бота при старте приложения
    // startScalpingBot(config.poolPublicKeyStr);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async saveBatch() {
    const pkg = scalpingBotService.packageSend();

    // const summary = pkg['3ucNos4NbumPLZNWztqGHNFFgkHeRMBQAVemeeomsUxv'].SUMMARY;

    console.log(pkg);

    const flatArrayPools = Object.keys(pkg)
      .map((key) => pkg[key].SUMMARY)
      .flat() as any[];

    if (flatArrayPools.length > 0) {
      await this.prisma.operation.createMany({
        data: flatArrayPools,
      });
    }
    // const last = summary[summary.length - 1];

    // if (last) {
    //   this.candle.push(last.exchange_rate);

    // }

    // console.log(scalpingBotService.orderBook);
  }
}

export { ScalpingBotService };
