const config = {
  // poolPublicKeyStr: 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK',
  watchPools: [
    {
      poolId: '3ucNos4NbumPLZNWztqGHNFFgkHeRMBQAVemeeomsUxv',
      dex: 'Radium',
      token1: {
        name: 'USDC',
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      },
      token2: {
        name: 'WSOL',
        mint: 'So11111111111111111111111111111111111111112',
      },
    },
    {
      poolId: '5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6',
      dex: 'Meteora',
      token1: {
        name: 'USDC',
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      },
      token2: {
        name: 'WSOL',
        mint: 'So11111111111111111111111111111111111111112',
      },
    },
  ],
  mockDepositAmount: 100,
  skipDifferenceDuration: 2,
  targetSwap: 'So11111111111111111111111111111111111111112',
  openPositionPercent: 5,
  takeProfit: 2,
  stopLoss: 0.5,
};

export { config };

// Bonk - DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263
// dogwifhat - EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm
// Render - rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof
// Jupiter - JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN
// Jito Staked SOL (JITOSOL) - J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn
//
