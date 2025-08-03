/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Client from '@triton-one/yellowstone-grpc';
import { config } from '../botConfig';
import { subscribeTransactions } from './utils/subscribeConfig';

type Operation = {
  receipt_token_mint: string;
  receipt_token_name: string;
  target_token_mint: string;
  target_token_name: string;
  receipt_amount: number;
  target_amount: number;
  receipt_volume: number;
  target_volume: number;
  exchange_rate: number;
  dex: string;
  slot: number;
  created_at: number;
  pool_id: string;
  operation_type: string;
};

type OrderbookItem = {
  BUY: Operation[];
  SELL: Operation[];
  SUMMARY: Operation[];
};

const ORDERBOOK_INIT = config.watchPools.reduce((acc, el) => {
  acc[el.poolId] = {
    BUY: [],
    SELL: [],
    SUMMARY: [],
  };
  return acc;
}, {});

class OrderBook {
  priceUpdatMint: string | null = null;
  orderBook: Record<string, OrderbookItem> = structuredClone(ORDERBOOK_INIT);

  async subscribe() {
    const client = new Client(
      'https://solana-yellowstone-grpc.publicnode.com:443',
      'dc29813f67cb77cc9c6...b3f3f8215c57b3a80f8',
      {
        'grpc.max_receive_message_length': 64 * 1024 * 1024,
      },
    );

    const stream = await client.subscribe();

    const subscriber = subscribeTransactions(
      config.watchPools.map((el) => el.poolId),
    );

    stream.on('data', (data: any) => {
      this.priceUpdatMint = null;
      const meta = data?.transaction?.transaction?.meta;
      const preTokenBalances = meta?.preTokenBalances || [];
      const postTokenBalances = meta?.postTokenBalances || [];

      const preBalances = new Map();
      const postBalances = new Map();

      // Заполняем preBalances
      preTokenBalances.forEach((balance: any, idx, array) => {
        const targetPool = config.watchPools.find(
          (item) => item.poolId === balance.owner,
        );

        const receiptMint = targetPool?.token1.mint;
        const targetMint = targetPool?.token2.mint;

        const targetMintData = array.find(
          (balance) => balance.mint === targetMint,
        );

        const receiptMintData =
          balance.mint === receiptMint ? balance : undefined;

        if (
          targetPool?.poolId &&
          targetMintData &&
          receiptMintData &&
          targetMintData.uiTokenAmount?.uiAmount > 0 &&
          receiptMintData?.uiTokenAmount?.uiAmount > 0
        ) {
          const key = `${receiptMintData.accountIndex}_${receiptMintData.mint}`;
          preBalances.set(key, {
            targetMint: targetMintData.mint,
            targetTokenName: targetPool?.token1,
            receiptMint: receiptMintData.mint,
            receiptTokenName: targetPool?.token2,
            poolId: targetPool.poolId,
            accountIndex: receiptMintData.accountIndex,
            targetAmount: targetMintData.uiTokenAmount?.uiAmount,
            receiptAmount: receiptMintData.uiTokenAmount?.uiAmount || 0,
            owner: receiptMintData.owner,
            slot: data.slot,
          });
        }
      });

      // Заполняем postBalances
      postTokenBalances.forEach((balance: any, idx, array) => {
        const targetPool = config.watchPools.find(
          (item) => item.poolId === balance.owner,
        );

        const receiptMint = targetPool?.token1.mint;
        const targetMint = targetPool?.token2.mint;

        const targetMintData = array.find(
          (balance) => balance.mint === targetMint,
        );

        const receiptMintData =
          balance.mint === receiptMint ? balance : undefined;

        if (
          targetPool?.poolId &&
          targetMintData &&
          receiptMintData &&
          targetMintData.uiTokenAmount?.uiAmount > 0 &&
          receiptMintData?.uiTokenAmount?.uiAmount > 0
        ) {
          const key = `${receiptMintData.accountIndex}_${receiptMintData.mint}`;
          postBalances.set(key, {
            targetMint: targetMintData.mint,
            targetTokenName: targetPool?.token1,
            receiptMint: receiptMintData.mint,
            receiptTokenName: targetPool?.token2,
            poolId: targetPool.poolId,
            accountIndex: receiptMintData.accountIndex,
            targetAmount: targetMintData.uiTokenAmount?.uiAmount,
            receiptAmount: receiptMintData.uiTokenAmount?.uiAmount || 0,
            owner: receiptMintData.owner,
            slot: data.slot,
          });
        }
      });

      // Обрабатываем изменения
      // console.log(preBalances, 'target piil');
      for (const [key, preBalance] of preBalances) {
        const postBalance = postBalances.get(key);

        // console.log(postBalance, 'diff');
        if (postBalance) {
          const amountDiff =
            postBalance.receiptAmount - preBalance.receiptAmount;
          const absDiff = Math.abs(amountDiff);

          if (absDiff >= config.skipDifferenceDuration) {
            // const tokenConfig = config.watchBy.find(
            //   (item) => item.mint === postBalance.mint,
            // );
            const targetPool = config.watchPools.find(
              (item) =>
                item.token1.mint === postBalance.targetMint ||
                item.token2.mint === postBalance.targetMint,
            );

            if (!targetPool) continue;

            // Находим соответствующий WSOL баланс для этого аккаунта
            // const wsolKey = `${postBalance.accountIndex}_${config.targetSwap}`;
            // const preWsolBalance = preBalances.get(wsolKey);
            // const postWsolBalance = postBalances.get(wsolKey);

            // if (!preWsolBalance || !postWsolBalance) continue;

            const wsolDiff = postBalance.targetAmount - preBalance.targetAmount;

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

            const pricingDiffs = preTokenBalances.map(
              (balance: any, idx, array) => {
                const postBalances = postTokenBalances.find(
                  (el: any) =>
                    el.accountIndex === balance.accountIndex &&
                    el.mint === balance.mint,
                );

                return {
                  mint: balance.mint,
                  diff:
                    postBalances.uiTokenAmount.uiAmount -
                    balance.uiTokenAmount.uiAmount,
                };
              },
            );

            // console.log(pricingDiffs, 'meta');

            // console.log(
            //   `Current price: 1 ${targetPool.token1.name}/${targetPool.token2.name} = ${price} WSOL (${postBalance.mint})`,
            // );

            // console.log(price, 'price');
            // Покупка: Покупаем token2  за token1
            const order: Operation = {
              receipt_token_mint: postBalance.targetMint,
              target_token_mint: postBalance.receiptMint,
              target_token_name: postBalance.targetTokenName,
              receipt_token_name: postBalance.receiptTokenName,
              target_amount: postBalance.targetAmount - preBalance.targetAmount,
              receipt_amount:
                postBalance.receiptAmount - preBalance.receiptAmount,
              target_volume: postBalance.targetAmount,
              receipt_volume: postBalance.receiptAmount,
              exchange_rate: price || 0,
              dex: targetPool.dex,
              slot: postBalance.slot,
              created_at: Date.now(),
              pool_id: targetPool.poolId,
              operation_type: amountDiff > 0 ? 'BUY' : 'SELL',
            };

            if (amountDiff > 0) {
              // console.log(this.orderBook);
              this.priceUpdatMint = postBalance.mint;
              this.orderBook[postBalance.poolId].BUY.push(order);
              // console.log(this.orderBook);
            } else {
              // console.log(this.orderBook);
              this.priceUpdatMint = postBalance.mint;
              this.orderBook[postBalance.poolId].SELL.push(order);

              // console.log(this.orderBook);
            }
            this.orderBook[postBalance.poolId].SUMMARY.push(order);

            // ... остальная логика добавления в orderBook
          }
        }
      }

      // if (this.priceUpdatMint && this.orderBook[this.priceUpdatMint]) {
      //   const name = config.watchBy.find(
      //     (el) => el.mint === this.priceUpdatMint,
      //   )?.name;

      //   console.log(`=== Order Book for pair ${name}/WSOL ===`);
      //   console.log('BUY:', (this.orderBook[this.priceUpdatMint] as any).BUY);
      //   console.log('SELL:', (this.orderBook[this.priceUpdatMint] as any).SELL);
      //   console.log(
      //     'SPREAD:',
      //     (this.orderBook[this.priceUpdatMint] as any).SPREAD,
      //   );
      //   console.log('===============================');
      // }
    });

    stream.write(subscriber, (err: any) => {
      if (err) console.error('Subscription error:', err);
    });
  }

  packageSend() {
    const orderBook = structuredClone(this.orderBook);
    this.orderBook = structuredClone(ORDERBOOK_INIT);
    return orderBook;
  }
}

export { OrderBook };

// main(config.poolPublicKeyStr);
