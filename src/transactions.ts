import { Connection, ConfirmedSignatureInfo } from '@solana/web3.js';

import {
  METAPLEX_SPL_TOKEN_PROGRAM_KEY,
  SYSTEM_PROGRAM_KEY,
} from './constants';
import { Tx, TxStatus, TxType } from './types';
import { groupMetaInstructionsByProgram } from './utils';

// ***** TEST TRANSACTION HASHES
// DELISTING :: 5mbEeH1KSPm2wXxr9akqKA5dPcDnSa1KZ8h9dgryqsNqv5TBZHHeNku4mAZxdp4ihrmqPm2Z4ywax2qRnuVJr5pZ
// LISTING   :: 41kFiYVk5pDsBCW2Lz4H12tAhRefmrCsXSoFqHxsDwzRSnKssRaWXnd8kKv4v9Rbvkfwvo4GYwjxCNKVkxYpvc2H
// SALE      :: 3iu2WRAEXaA5p2bZ1duz9H6ZNe7uJQMgYbHGU9hDaRG6KB6NDVsrvyvoJcvuLr35NAWbfYB6xwW4yCwVQCYPo5hw
export async function checkTransaction(
  conn: Connection,
  confSignature: ConfirmedSignatureInfo
) {
  const txHash = confSignature.signature;
  let txType = null;

  try {
    const tx = await conn.getParsedConfirmedTransaction(txHash);
    const programs = groupMetaInstructionsByProgram(tx.meta);

    txType = determineTransactionType(programs);

    const blockTime = confSignature.blockTime;
    const txObj: Tx = {
      hash: txHash,
      type: txType,
      status: tx.meta.err ? TxStatus.FAILURE : TxStatus.SUCCESS,
      blockTime: new Date(blockTime * 1000),
    };

    console.log(txObj);
  } catch (e) {
    console.log('\t❗️❗️❗️ ERROR');
    console.log(`\t\tTx Hash: ${txHash}`);
    console.log(`\t\tTx Type: ${txType}`);
    console.log(`\t\tErr Message: ${e}`);
  }
}

export function determineTransactionType(programsWithInstructions) {
  const hasSysProgramInstructions =
    programsWithInstructions[SYSTEM_PROGRAM_KEY];
  /*
      delisting: no transfer of funds in instructions;
        - this will be hardcoded;
        - it has no system program; feels sketchy to check this way but hey!
    */
  if (!hasSysProgramInstructions) {
    return TxType.DELISTING;
  }

  const hasMetaplexSPLTokenProgramInstructions =
    programsWithInstructions[METAPLEX_SPL_TOKEN_PROGRAM_KEY];

  if (!hasSysProgramInstructions || !hasMetaplexSPLTokenProgramInstructions) {
    return TxType.UNKNOWN;
  }

  /*
      listing:
        - uses system program; sends fee to bDmnDkeV7xqWsEwKQEgZny6vXbHBoCYrjxA4aCr9fHU (type: transfer)
          -- there is only one instruction
        - uses spl-token-program with one instruction, set-authority
    */
  const sysProgramInstructions = programsWithInstructions[SYSTEM_PROGRAM_KEY];
  const metaplexSPLTokenProgramInstructions =
    programsWithInstructions[METAPLEX_SPL_TOKEN_PROGRAM_KEY];

  // TODO: this is super hacky for now; not sure if we can look for one instr in both programs and assume listing......
  // FUTURE: check that token is exchanging to marketplace; fee is paid (if there is a fee; won't be in future possibly)
  if (
    sysProgramInstructions.length === 1 &&
    metaplexSPLTokenProgramInstructions.length === 1
  ) {
    return TxType.LISTING;
  }

  // TODO: this feels gross as well;
  // FUTURE: check that token is going from MP; fee is paid to fee contract; buyer addr etc.
  if (
    sysProgramInstructions.filter((spi) => spi.type === 'transfer').length > 2
  ) {
    return TxType.SALE;
  }

  return TxType.UNKNOWN;
}
