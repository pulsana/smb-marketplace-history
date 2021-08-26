import got from 'got';
import { Connection, PublicKey } from '@solana/web3.js';

import { decodeMetadata } from './metaplex/metadata';

import { MetaplexMetadata, NFTMetadata, SMBAttributes } from './types';
import { getMetadataAddressForMint } from './utils';

export async function getNFTMetadataFromArweave(
  arweaveUri
): Promise<SMBAttributes> {
  const nftInfoResponse = await got(arweaveUri);
  return JSON.parse(nftInfoResponse.body);
}

export async function getMetadataForMintToken(
  conn: Connection,
  addr: string
): Promise<NFTMetadata> {
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

  const nftMetadata = await getNFTMetadataFromArweave(
    metaplexMetadata.metadataUri
  );

  return { ...metaplexMetadata, attrs: nftMetadata };
}
