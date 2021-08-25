import { clusterApiUrl, Connection } from '@solana/web3.js';

(async function () {
  const conn = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
  const slotResult = await conn.getSlot();
  const blockTimeResult = await conn.getBlockTime(slotResult);
  const blockTime = new Date(blockTimeResult * 1000);
  console.log(`Current Slot: ${slotResult} @ ${blockTime}`);
})();
