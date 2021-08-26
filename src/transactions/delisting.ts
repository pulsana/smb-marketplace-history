import { Connection, PublicKey } from '@solana/web3.js';
import { AccountLayout } from '@solana/spl-token';

import { METAPLEX_TOKEN_PROGRAM_ID } from '../metaplex/constants';

import { getMetadataForMintToken } from '../metadata';
import {
  DelistingTransaction,
  SolanaProgram,
  SolanaProgramInstructionType,
  TxType,
} from '../types';

export async function parseDelistTx(
  conn: Connection,
  txHash: string,
  instrs: any
): Promise<DelistingTransaction> {
  const delistingTxInfo: DelistingTransaction = {
    type: TxType.LISTING,
    hash: txHash,
    data: null,
    nftAddress: null,
    nft: null,
  };

  const tokenTransferInstruction = instrs.find((ix) => {
    return (
      ix.program === SolanaProgram.SPL_TOKEN &&
      ix.programId.toString() === METAPLEX_TOKEN_PROGRAM_ID &&
      ix.parsed.type === SolanaProgramInstructionType.TRANSFER
    );
  });

  const tokenAccountForSeller =
    tokenTransferInstruction.parsed.info.destination;
  const tokenAmountTransferred = tokenTransferInstruction.parsed.info.amount;

  if (Number(tokenAmountTransferred) !== 1) {
    console.error('something does not make sense....');
  }

  const tokenAccountInfo = await conn.getAccountInfo(
    new PublicKey(tokenAccountForSeller)
  );
  const tokenMint = AccountLayout.decode(tokenAccountInfo.data);
  const listerAddress = tokenMint.owner;

  const nftMintAddr = tokenMint.mint;
  const nftMetadata = await getMetadataForMintToken(conn, nftMintAddr);

  const delistingData = {
    sellerAddress: listerAddress,
  };

  delistingTxInfo.nftAddress = nftMintAddr;
  delistingTxInfo.nft = nftMetadata;
  delistingTxInfo.data = delistingData;

  return delistingTxInfo;
}
