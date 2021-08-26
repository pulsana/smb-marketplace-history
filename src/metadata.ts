import { Connection, PublicKey } from '@solana/web3.js';

import { getMetadataAddressForMint } from './utils';

export async function getMetadataForMintToken(conn: Connection, addr: string) {
  const metadata = {};

  const nftPDA = await getMetadataAddressForMint({
    mintTokenPublicKey: new PublicKey(addr),
  });

  const mintinfo = await conn.getAccountInfo(nftPDA);

  console.log(`Public Key: ${nftPDA.toString()}`);
  console.log(`Mint Info: ${JSON.stringify(mintinfo, null, 2)}`);

  console.log(metadata);
}
