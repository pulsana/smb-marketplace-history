import { Connection } from '@solana/web3.js';

export async function parseSaleTx(
  conn: Connection,
  txHash: string,
  instrs: any
) {
  console.log(txHash);
}
