import { Connection, PublicKey } from '@solana/web3.js';

import { decodeMetadata } from './metaplex/metadata';

import { MetaplexMetadata } from './types';
import { getMetadataAddressForMint } from './utils';

export async function getMetadataForMintToken(conn: Connection, addr: string) {
  const metaplexMetadata: MetaplexMetadata = {
    name: null,
    metadataUri: null,
    symbol: null,
  };

  const nftPDA = await getMetadataAddressForMint({
    mintTokenPublicKey: new PublicKey(addr),
  });

  const mintinfo = await conn.getAccountInfo(nftPDA);
  const metadata = decodeMetadata(mintinfo.data);

  metaplexMetadata.name = metadata.data.name;
  metaplexMetadata.metadataUri = metadata.data.uri;
  metaplexMetadata.symbol = metadata.data.symbol;

  console.log(metaplexMetadata);
}
