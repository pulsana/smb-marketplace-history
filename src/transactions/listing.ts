import { Connection } from '@solana/web3.js';

export async function parseListTx(
  conn: Connection,
  txHash: string,
  instrs: any
) {
  console.log(txHash);
}
