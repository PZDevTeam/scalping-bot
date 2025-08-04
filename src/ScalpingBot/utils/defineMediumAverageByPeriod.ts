/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { PrismaClient } from '@prisma/client';
import { OrderbookItem } from '../main';

async function defineMediumAverageByPeriod(
  prisma: PrismaClient,
  timeframe: number = 50,
  pkg: Record<string, OrderbookItem>,
  candle: number = 1,
) {
  const flatArrayPools = await Promise.all(
    Object.keys(pkg)
      .map((key) => pkg[key].SUMMARY)
      .flat()
      .map(async (pool) => {
        const last50CandleCloses = await prisma.$queryRaw`
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
            LIMIT ${timeframe}
`;

        const moving_average =
          (last50CandleCloses as any[]).reduce(
            (acc: number, el: { exchange_rate: number }) =>
              acc + el.exchange_rate,
            0,
          ) / ((last50CandleCloses as any[]).length || 1);

        console.log(last50CandleCloses, 'closes');

        return {
          ...pool,
          candle: candle,
          selected_timeframe: '10s',
          moving_average,
          moving_average_timeframe: timeframe,
        };
      }),
  );

  if (flatArrayPools.length > 0) {
    await prisma.operation.createMany({
      data: flatArrayPools,
    });
  }
}

export default defineMediumAverageByPeriod;
