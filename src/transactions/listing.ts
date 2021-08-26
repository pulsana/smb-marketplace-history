import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

import { METAPLEX_TOKEN_PROGRAM_ID } from '../metaplex/constants';

import { getMetadataForMintToken } from '../metadata';
import {
  ListingTransaction,
  SolanaProgram,
  SolanaProgramInstructionType,
  TxType,
} from '../types';

// TODO: unhardcode and pass in
const MARKETPLACE_ADDRESS = 'G6xptnrkj4bxg9H9ZyPzmAnNsGghSxZ7oBCL1KNKJUza';
const FEE_DESTINATION_ADDRESS = 'bDmnDkeV7xqWsEwKQEgZny6vXbHBoCYrjxA4aCr9fHU';

export async function parseListTx(
  conn: Connection,
  txHash: string,
  instrs: any
): Promise<ListingTransaction> {
  const listingTxInfo: ListingTransaction = {
    type: TxType.LISTING,
    hash: txHash,
    data: null,
    nftAddress: null,
    nft: null,
  };

  const initAccountInstruction = instrs.find((ix) => {
    return (
      ix.program === SolanaProgram.SPL_TOKEN &&
      ix.programId.toString() === METAPLEX_TOKEN_PROGRAM_ID &&
      ix.parsed.type === SolanaProgramInstructionType.INITIALIZE_ACCOUNT
    );
  });

  const tokenTransferInstruction = instrs.find((ix) => {
    return (
      ix.program === SolanaProgram.SPL_TOKEN &&
      ix.programId.toString() === METAPLEX_TOKEN_PROGRAM_ID &&
      ix.parsed.type === SolanaProgramInstructionType.TRANSFER
    );
  });

  const marketplaceOwnsNewAccountToHoldTokenInstruction = instrs.find((ix) => {
    return (
      ix.program === SolanaProgram.SPL_TOKEN &&
      ix.programId.toString() === METAPLEX_TOKEN_PROGRAM_ID &&
      ix.parsed.type === SolanaProgramInstructionType.SET_AUTHORITY &&
      ix.parsed.info.newAuthority === MARKETPLACE_ADDRESS
    );
  });

  // const transferDestAccount = tokenTransferInstruction.parsed.info.destination;
  // const tokenAccountForSeller = tokenTransferInstruction.parsed.info.source;
  // const tokenAccountInfo = await conn.getAccountInfo(
  //   new PublicKey(tokenAccountForSeller)
  // );

  const tokenAmountTransferred = tokenTransferInstruction.parsed.info.amount;

  if (Number(tokenAmountTransferred) !== 1) {
    console.error('something does not make sense....');
  }

  const listerAddress =
    marketplaceOwnsNewAccountToHoldTokenInstruction.parsed.info
      .multisigAuthority;
  const authorityForMintToken =
    marketplaceOwnsNewAccountToHoldTokenInstruction.parsed.info.newAuthority;
  if (authorityForMintToken !== MARKETPLACE_ADDRESS) {
    console.error('not right friend....');
  }

  const listingFeeInstruction = instrs.find((ix) => {
    return (
      ix.program === SolanaProgram.SYSTEM &&
      ix.parsed.type === SolanaProgramInstructionType.TRANSFER &&
      ix.parsed.info.destination === FEE_DESTINATION_ADDRESS
    );
  });

  const listingFeeInLamports = listingFeeInstruction?.parsed?.info?.lamports;
  const listingFee = (listingFeeInLamports / LAMPORTS_PER_SOL).toFixed(8);

  const nftMintAddr = initAccountInstruction.parsed.info.mint;
  const nftMetadata = await getMetadataForMintToken(conn, nftMintAddr);

  const listingData = {
    sellerAddress: listerAddress,
    listingFee: listingFeeInLamports,
    listingFeeInSOL: listingFee,
  };

  listingTxInfo.nftAddress = nftMintAddr;
  listingTxInfo.nft = nftMetadata;
  listingTxInfo.data = listingData;

  return listingTxInfo;
}
