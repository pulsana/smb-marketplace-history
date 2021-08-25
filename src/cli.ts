import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';

import { checkTransaction } from './transactions';

// SMB Program Account Key
const programAccountKey = new PublicKey(
  'GvQVaDNLV7zAPNx35FqWmgwuxa4B2h5tuuL73heqSf1C'
);

(async function () {
  try {
    const conn = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
    const slotResult = await conn.getSlot();
    const blockTimeResult = await conn.getBlockTime(slotResult);
    const blockTime = new Date(blockTimeResult * 1000);
    console.log(`Current Slot: ${slotResult} @ ${blockTime}`);

    const fetched = await conn.getConfirmedSignaturesForAddress2(
      programAccountKey,
      {
        limit: 10,
      }
    );

    for (const tx of fetched) {
      await checkTransaction(conn, tx);
    }
  } catch (e) {
    console.error('Error Occurred:', e);
  }
})();
