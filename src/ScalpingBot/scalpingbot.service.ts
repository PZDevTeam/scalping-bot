import { Injectable, OnModuleInit } from '@nestjs/common';
import { OrderBook } from './main';
// import { PrismaService } from 'src/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import defineMediumAverageByPeriod from './utils/defineMediumAverageByPeriod';

const scalpingBotService = new OrderBook();

@Injectable()
class ScalpingBotService implements OnModuleInit {
  candle: number = 1;
  constructor(private readonly prisma: PrismaService) {}
  async onModuleInit() {
    await scalpingBotService.subscribe();
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async saveBatch() {
    const pkg = scalpingBotService.packageSend();

    const summary = Object.values(pkg)
      .map((item) => item.SUMMARY)
      .flat();

    if (summary.length > 0) {
      const resultedAverage = await Promise.all([
        defineMediumAverageByPeriod(this.prisma, 50, pkg, this.candle),
        defineMediumAverageByPeriod(this.prisma, 200, pkg, this.candle),
      ]);

      this.candle++;
      console.log(resultedAverage);
    }
  }
}

export { ScalpingBotService };
