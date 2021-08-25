/* NOTE: this is a partial rewrite from metaplex js code

         https://github.com/metaplex-foundation/metaplex/tree/master/js/packages/common
*/

import { PublicKey } from '@solana/web3.js';
import { EDITION, METADATA_PREFIX, StringPublicKey } from './types';

const findProgramAddressPublicKey = async (
  seeds,
  programId
): Promise<PublicKey> => {
  const result = await PublicKey.findProgramAddress(seeds, programId);
  return result[0];
};

// metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
export async function getProgramAddressForPublicKey({
  metadataContractPK = new PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
  ),
  tokenMintPK,
}: {
  metadataContractPK?: PublicKey;
  tokenMintPK: PublicKey | StringPublicKey;
}): Promise<StringPublicKey> {
  const tokenMintPublicKey = (tokenMintPK as StringPublicKey)
    ? new PublicKey(tokenMintPK)
    : <PublicKey>tokenMintPK;

  const publicKeyForMint = await findProgramAddressPublicKey(
    [
      Buffer.from(METADATA_PREFIX),
      metadataContractPK.toBuffer(),
      tokenMintPublicKey.toBuffer(),
      Buffer.from(EDITION),
    ],
    metadataContractPK
  );

  return publicKeyForMint.toString();
}
