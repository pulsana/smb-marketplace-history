import { Connection } from '@solana/web3.js';

import { parseTransactionByType } from './transactions';
import { TxType } from './types';

const DELISTING_TX_HASH =
  '5mbEeH1KSPm2wXxr9akqKA5dPcDnSa1KZ8h9dgryqsNqv5TBZHHeNku4mAZxdp4ihrmqPm2Z4ywax2qRnuVJr5pZ';
const LISTING_TX_HASH =
  '41kFiYVk5pDsBCW2Lz4H12tAhRefmrCsXSoFqHxsDwzRSnKssRaWXnd8kKv4v9Rbvkfwvo4GYwjxCNKVkxYpvc2H';
const SALE_TX_HASH =
  '3iu2WRAEXaA5p2bZ1duz9H6ZNe7uJQMgYbHGU9hDaRG6KB6NDVsrvyvoJcvuLr35NAWbfYB6xwW4yCwVQCYPo5hw';

export async function testIndividualTransaction(
  conn: Connection,
  txType: TxType
) {
  let txHash;

  switch (txType) {
    case TxType.DELISTING:
      txHash = DELISTING_TX_HASH;
      break;
    case TxType.LISTING:
      txHash = LISTING_TX_HASH;
      break;
    case TxType.SALE:
      txHash = SALE_TX_HASH;
      break;
  }

  const tx = await conn.getParsedConfirmedTransaction(txHash);
  await parseTransactionByType({ conn, ptx: tx, txType });
}
