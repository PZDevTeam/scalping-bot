/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Client from '@triton-one/yellowstone-grpc';
import { config } from '../../botConfig';
import { subscribeTransactions } from './utils/subscribeConfig';

type Operation = {
  token_mint: string;
  token_name: string;
  amount: number;
  usd_price: number;
  total_value: number;
  operation: 'BUY' | 'SELL';
  pool_id: string;
  dex: string;
  slot: number;
  created_at: number;
  price_in_wsol: number;
};

type OrderbookItem = {
  BUY: Operation[];
  SELL: Operation[];
};

class OrderBook {
  priceUpdatMint: string | null = null;
  orderBook: Record<string, OrderbookItem> = config.watchBy.reduce(
    (acc, el) => {
      acc[el.mint] = {
        BUY: [],
        SELL: [],
      };
      return acc;
    },
    {},
  );

  async subscribe() {
    const client = new Client(
      'https://solana-yellowstone-grpc.publicnode.com:443',
      'dc29813f67cb77cc9c6...b3f3f8215c57b3a80f8',
      {
        'grpc.max_receive_message_length': 64 * 1024 * 1024,
      },
    );

    const stream = await client.subscribe();

    const subscriber = subscribeTransactions([config.poolPublicKeyStr]);

    stream.on('data', (data: any) => {
      this.priceUpdatMint = null;
      const meta = data?.transaction?.transaction?.meta;
      const preTokenBalances = meta?.preTokenBalances || [];
      const postTokenBalances = meta?.postTokenBalances || [];

      const preBalances = new Map();
      const postBalances = new Map();

      // Заполняем preBalances
      preTokenBalances.forEach((balance: any, idx, array) => {
        const isInTarget = config.watchBy.some(
          (item) => item.mint === balance.mint,
        );

        const isSwapWsol = array.find(
          (balance) => balance.mint === config.targetSwap,
        );

        if (
          isInTarget &&
          isSwapWsol &&
          isSwapWsol.uiTokenAmount?.uiAmount > 0
        ) {
          const key = `${balance.accountIndex}_${balance.mint}`;
          preBalances.set(key, {
            accountIndex: balance.accountIndex,
            mint: balance.mint,
            sol_amount: isSwapWsol.uiTokenAmount?.uiAmount,
            amount: balance.uiTokenAmount?.uiAmount || 0,
            owner: balance.owner,
            slot: data.slot, // Добавляем slot из транзакции
          });
        }
      });

      // Заполняем postBalances
      postTokenBalances.forEach((balance: any, index, array) => {
        const isInTarget = config.watchBy.some(
          (item) => item.mint === balance.mint,
        );

        const isSwapWsol = array.find(
          (balance) => balance.mint === config.targetSwap,
        );

        if (
          isInTarget &&
          isSwapWsol &&
          isSwapWsol.uiTokenAmount?.uiAmount > 0
        ) {
          const key = `${balance.accountIndex}_${balance.mint}`;
          postBalances.set(key, {
            accountIndex: balance.accountIndex,
            mint: balance.mint,
            sol_amount: isSwapWsol.uiTokenAmount?.uiAmount,
            amount: balance.uiTokenAmount?.uiAmount || 0,
            owner: balance.owner,
            slot: data.slot, // Добавляем slot из транзакции
          });
        }
      });

      // Обрабатываем изменения
      for (const [key, preBalance] of preBalances) {
        const postBalance = postBalances.get(key);

        if (postBalance) {
          const amountDiff = postBalance.amount - preBalance.amount;
          const absDiff = Math.abs(amountDiff);

          if (absDiff >= config.skipDifferenceDuration) {
            const tokenConfig = config.watchBy.find(
              (item) => item.mint === postBalance.mint,
            );
            if (!tokenConfig) continue;

            // Находим соответствующий WSOL баланс для этого аккаунта
            // const wsolKey = `${postBalance.accountIndex}_${config.targetSwap}`;
            // const preWsolBalance = preBalances.get(wsolKey);
            // const postWsolBalance = postBalances.get(wsolKey);

            // if (!preWsolBalance || !postWsolBalance) continue;

            const wsolDiff = postBalance.sol_amount - preBalance.sol_amount;

            // Рассчитываем курс
            let price;
            if (amountDiff > 0 && wsolDiff < 0) {
              // Покупаем токен за WSOL (токен увеличился, WSOL уменьшился)
              price = Math.abs(wsolDiff) / amountDiff; // Сколько WSOL за 1 токен
            } else if (amountDiff < 0 && wsolDiff > 0) {
              // Продаем токен за WSOL (токен уменьшился, WSOL увеличился)
              price = wsolDiff / Math.abs(amountDiff); // Сколько WSOL за 1 токен
            } else {
              // Непонятная операция, пропускаем
              continue;
            }

            console.log(
              `Current price: 1 ${tokenConfig.name} = ${price} WSOL (${postBalance.mint})`,
            );

            const order: Operation = {
              token_mint: postBalance.mint,
              token_name: tokenConfig.name || 'unknown',
              amount: amountDiff,
              usd_price: tokenConfig.price || 0,
              total_value: (tokenConfig.price || 0) * absDiff,
              operation: amountDiff > 0 ? 'BUY' : 'SELL',
              pool_id: config.poolPublicKeyStr,
              dex: 'Radium',
              slot: postBalance.slot,
              created_at: Date.now(),
              price_in_wsol: price, // Добавляем расчетный курс
            };

            if (amountDiff > 0) {
              this.priceUpdatMint = postBalance.mint;
              this.orderBook[postBalance.mint].BUY.push(order);
            } else {
              this.priceUpdatMint = postBalance.mint;
              this.orderBook[postBalance.mint].SELL.push(order);
            }

            // ... остальная логика добавления в orderBook
          }
        }
      }

      if (this.priceUpdatMint && this.orderBook[this.priceUpdatMint]) {
        const name = config.watchBy.find(
          (el) => el.mint === this.priceUpdatMint,
        )?.name;

        console.log(`=== Order Book for pair ${name}/WSOL ===`);
        console.log('BUY:', (this.orderBook[this.priceUpdatMint] as any).BUY);
        console.log('SELL:', (this.orderBook[this.priceUpdatMint] as any).SELL);
        console.log(
          'SPREAD:',
          (this.orderBook[this.priceUpdatMint] as any).SPREAD,
        );
        console.log('===============================');
      }
    });

    stream.write(subscriber, (err: any) => {
      if (err) console.error('Subscription error:', err);
    });
  }
}

export { OrderBook };

// main(config.poolPublicKeyStr);
