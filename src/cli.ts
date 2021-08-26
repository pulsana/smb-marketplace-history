import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';

import { logToConsole } from './handlers/console.output';

import { runRealtimeService } from './services/realtime';
import { mimicThreeSeparateTransactionFinds } from './testing';

// SMB Program Account Key
const programAccountKey = new PublicKey(
  'GvQVaDNLV7zAPNx35FqWmgwuxa4B2h5tuuL73heqSf1C'
);

const notificationHandlers = [logToConsole];
const INTERVAL_CHECK__IN_MS = 10000;

(async function () {
  try {
    const conn = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
    const slotResult = await conn.getSlot();
    const blockTimeResult = await conn.getBlockTime(slotResult);
    const blockTime = new Date(blockTimeResult * 1000);
    console.log(`Current Slot: ${slotResult} @ ${blockTime}`);

    if (process.env.TESTING) {
      await mimicThreeSeparateTransactionFinds(conn, notificationHandlers);

      return;
    }

    if (process.env.REALTIME) {
      runRealtimeService(conn, programAccountKey, notificationHandlers, INTERVAL_CHECK__IN_MS);
    }
  } catch (e) {
    console.error('Error Occurred:', e);
  }
})();
