import { SubscribeRequest } from '@triton-one/yellowstone-grpc';

function subscribeTransactions(poolAddress: string[]): SubscribeRequest {
  return {
    accounts: {
      // client: {
      //     account: [poolPublicKeyStr], // добавьте сюда адрес пула
      //     owner: ['CJKrW95iMGECdjWtdDnWDAx2cBH7pFE9VywnULfwMapf'],
      //     filters: [],
      //     nonemptyTxnSignature: false,
      // },
    },
    // остальные параметры можно оставить по умолчанию или настроить по необходимости
    slots: {},
    transactions: {
      client: {
        accountInclude: poolAddress,
        accountExclude: [],
        accountRequired: [],
      },
    },
    transactionsStatus: {},
    entry: {},
    blocks: {},
    blocksMeta: {},
    accountsDataSlice: [],
  };
}

export { subscribeTransactions };
