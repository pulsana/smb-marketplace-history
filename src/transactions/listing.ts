import { Connection, ParsedConfirmedTransaction } from '@solana/web3.js';

export async function parseListTx(conn: Connection, txHash: string) {
  console.log(txHash);
}
