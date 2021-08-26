import { Connection, PublicKey } from '@solana/web3.js';
import PQueue from 'p-queue';

import { checkTransaction } from '../transactions';
import { NotificationHandler } from '../types';

// TODO: load this from somewhere in case program/server fails
let mostRecentTxHash = null;
const options = {
  limit: 1,
};

const txParseQueue = new PQueue({ concurrency: 1 });

async function intervalRun(
  conn: Connection,
  programAccountKey: PublicKey,
  notificationHandlers: NotificationHandler[]
) {
  try {
    if (mostRecentTxHash) {
      // !!!! if volume goes crazy, this will be an area of slowness
      Object.assign(options, {
        until: mostRecentTxHash,
        limit: 1000, // TODO: make this configurable
      });
    }

    const fetched = await conn.getConfirmedSignaturesForAddress2(
      programAccountKey,
      options
    );

    const txs = Array.from(fetched);

    console.log(`Searching... [${mostRecentTxHash}] : ${txs.length}`);

    for (const tx of fetched) {
      txParseQueue.add(async () => {
        const transaction = await checkTransaction(conn, tx);

        for (const notifHandler of notificationHandlers) {
          notifHandler(transaction);
        }
      });
    }

    const mostRecentTx = <any>txs?.shift();
    if (
      mostRecentTx &&
      (!mostRecentTxHash || mostRecentTx.signature !== mostRecentTxHash)
    ) {
      mostRecentTxHash = mostRecentTx.signature;
    }
  } catch (e) {
    console.error('Error Occurred:', e);
  }
}

export async function runRealtimeService(
  conn: Connection,
  programAccountKey: PublicKey,
  notificationHandlers: NotificationHandler[],
  intervalCheckInMS: number
) {
  if (!notificationHandlers) {
    console.warn('❗️ >>> No Notification Handlers Defined');
  }

  // run immediately
  intervalRun(conn, programAccountKey, notificationHandlers);

  setInterval(
    () => intervalRun(conn, programAccountKey, notificationHandlers),
    intervalCheckInMS
  );
}
