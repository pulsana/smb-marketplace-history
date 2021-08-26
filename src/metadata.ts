import { Connection, PublicKey } from '@solana/web3.js';

import { decodeMetadata } from './metaplex/metadata';

import { NFTMetadata } from './types';
import { getMetadataAddressForMint } from './utils';

export async function getMetadataForMintToken(conn: Connection, addr: string) {
  const nftMetadata: NFTMetadata = {
    name: null,
    metadataUri: null,
    symbol: null,
  };

  const nftPDA = await getMetadataAddressForMint({
    mintTokenPublicKey: new PublicKey(addr),
  });

  const mintinfo = await conn.getAccountInfo(nftPDA);
  const metadata = decodeMetadata(mintinfo.data);

  nftMetadata.name = metadata.data.name;
  nftMetadata.metadataUri = metadata.data.uri;
  nftMetadata.symbol = metadata.data.symbol;

  console.log(nftMetadata);
}
