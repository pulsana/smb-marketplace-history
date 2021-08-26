import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

import { METAPLEX_TOKEN_PROGRAM_ID } from '../metaplex/constants';

import { getMetadataForMintToken } from '../metadata';
import {
  SaleTransactionData,
  SolanaProgram,
  SolanaProgramInstructionType,
} from '../types';

const MARKETPLACE_ADDRESS = 'G6xptnrkj4bxg9H9ZyPzmAnNsGghSxZ7oBCL1KNKJUza';
const FEE_DESTINATION_ADDRESS = 'bDmnDkeV7xqWsEwKQEgZny6vXbHBoCYrjxA4aCr9fHU';

export async function parseSaleTx(
  conn: Connection,
  txHash: string,
  instrs: any
): Promise<SaleTransactionData> {
  const transferForFee = instrs.find((ix) => {
    return (
      ix.program === SolanaProgram.SYSTEM &&
      ix.parsed.type === SolanaProgramInstructionType.TRANSFER &&
      ix.parsed.info.destination === FEE_DESTINATION_ADDRESS
    );
  });

  if (!transferForFee) {
    // panic!
  }

  const allocateTransferInstruction = instrs.find((ix) => {
    return (
      ix.program === SolanaProgram.SYSTEM &&
      ix.parsed.type === SolanaProgramInstructionType.ALLOCATE
    );
  });

  // TODO: this needs a refactor;
  // FUTURE: right now, it is looking where a transfer destination is allocated for space to ignore that amount

  const newAccountForStorageAddress =
    allocateTransferInstruction.parsed.info.account;
  const transferForSale = instrs.find((ix) => {
    return (
      ix.program === SolanaProgram.SYSTEM &&
      ix.parsed.type === SolanaProgramInstructionType.TRANSFER &&
      ix.parsed.info.destination !== newAccountForStorageAddress &&
      ix.parsed.info.destination !== FEE_DESTINATION_ADDRESS
    );
  });

  const saleAmount = transferForSale.parsed.info.lamports;
  const saleAmountInSOL = (saleAmount / LAMPORTS_PER_SOL).toFixed(8);
  const feeAmount = transferForFee.parsed.info.lamports;
  const feeAmountInSOL = (feeAmount / LAMPORTS_PER_SOL).toFixed(8);

  const initAccountInstruction = instrs.find((ix) => {
    return (
      ix.program === SolanaProgram.SPL_TOKEN &&
      ix.programId.toString() === METAPLEX_TOKEN_PROGRAM_ID &&
      ix.parsed.type === SolanaProgramInstructionType.INITIALIZE_ACCOUNT
    );
  });

  const nftMintAddr = initAccountInstruction.parsed.info.mint;
  const nftMetadata = await getMetadataForMintToken(conn, nftMintAddr);

  const saleData = {
    buyerAddress: transferForSale.parsed.info.source,
    sellerAddress: transferForSale.parsed.info.destination,
    saleAmount: saleAmount,
    saleAmountInSOL: saleAmountInSOL,
    feeAmount: feeAmount,
    feeAmountInSOL: feeAmountInSOL,
    nftAddress: nftMintAddr,
    nft: nftMetadata,
  };

  return saleData;
}
