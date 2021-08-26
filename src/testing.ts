import { ConfirmedSignatureInfo, Connection } from '@solana/web3.js';

import { checkTransaction, parseTransactionDataByType } from './transactions';
import { NotificationHandler } from './types';

const DELISTING_TX_HASH =
  '5mbEeH1KSPm2wXxr9akqKA5dPcDnSa1KZ8h9dgryqsNqv5TBZHHeNku4mAZxdp4ihrmqPm2Z4ywax2qRnuVJr5pZ';
const LISTING_TX_HASH =
  '41kFiYVk5pDsBCW2Lz4H12tAhRefmrCsXSoFqHxsDwzRSnKssRaWXnd8kKv4v9Rbvkfwvo4GYwjxCNKVkxYpvc2H';
const SALE_TX_HASH =
  '3iu2WRAEXaA5p2bZ1duz9H6ZNe7uJQMgYbHGU9hDaRG6KB6NDVsrvyvoJcvuLr35NAWbfYB6xwW4yCwVQCYPo5hw';

export async function mimicThreeSeparateTransactionFinds(
  conn: Connection,
  notificationHandlers: NotificationHandler[]
) {
  const mimicSigResult: ConfirmedSignatureInfo[] = [
    {
      signature: DELISTING_TX_HASH,
      blockTime: 1629944114,
      slot: 0,
      err: null,
      memo: null,
    },
    {
      signature: LISTING_TX_HASH,
      blockTime: 1629944114,
      slot: 0,
      err: null,
      memo: null,
    },
    {
      signature: SALE_TX_HASH,
      blockTime: 1629944114,
      slot: 0,
      err: null,
      memo: null,
    },
  ];

  if (!notificationHandlers) {
    console.warn('❗️ >>> No Notification Handlers Defined');
  }

  for (const tx of mimicSigResult) {
    const transaction = await checkTransaction(conn, tx);

    for (const notifHandler of notificationHandlers) {
      notifHandler(transaction);
    }
  }
}
