import { Connection, ParsedConfirmedTransaction } from '@solana/web3.js';

export async function parseDelistTx(conn: Connection, txHash: string) {
  console.log(txHash);
}
