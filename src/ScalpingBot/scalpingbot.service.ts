import { Injectable, OnModuleInit } from '@nestjs/common';
import { OrderBook } from './main';
// import { PrismaService } from 'src/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

const scalpingBotService = new OrderBook();

@Injectable()
class ScalpingBotService implements OnModuleInit {
  candle: number = 1;
  constructor(private readonly prisma: PrismaService) {}
  async onModuleInit() {
    await scalpingBotService.subscribe();
    // Запуск бота при старте приложения
    // startScalpingBot(config.poolPublicKeyStr);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async saveBatch() {
    const pkg = scalpingBotService.packageSend();

    const flatArrayPools = await Promise.all(
      Object.keys(pkg)
        .map((key) => pkg[key].SUMMARY)
        .flat()
        .map(async (pool) => {
          const last50CandleCloses = await this.prisma.$queryRaw`
    WITH ranked_operations AS (
      SELECT 
        *,
        ROW_NUMBER() OVER (
        PARTITION BY pool_id, candle 
        ORDER BY created_at DESC
      ) AS rn
      FROM 
      operation
      WHERE 
      pool_id = ${pool.pool_id}
  )
            SELECT * FROM ranked_operations
            WHERE rn = 1  -- Берем только последнюю запись в каждой свече
            ORDER BY candle DESC
            LIMIT 50
`;

          const moving_average =
            (last50CandleCloses as any[]).reduce(
              (acc: number, el: { exchange_rate: number }) =>
                acc + el.exchange_rate,
              0,
            ) / (last50CandleCloses as any[]).length;

          console.log(moving_average, 'closes');

          return {
            ...pool,
            candle: this.candle,
            selected_timeframe: '10s',
            moving_average,
          };
        }),
    );

    if (flatArrayPools.length > 0) {
      await this.prisma.operation.createMany({
        data: flatArrayPools,
      });
      this.candle += 1;
    }
  }
}

export { ScalpingBotService };
