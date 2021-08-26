import {
  Connection,
  ConfirmedSignatureInfo,
  ParsedConfirmedTransaction,
} from '@solana/web3.js';

import { parseDelistTx } from './transactions/delisting';
import { parseListTx } from './transactions/listing';
import { parseSaleTx } from './transactions/sale';

import {
  METAPLEX_SPL_TOKEN_PROGRAM_KEY,
  SYSTEM_PROGRAM_KEY,
} from './constants';
import {
  DelistingTransactionData,
  ListingTransactionData,
  SaleTransactionData,
  Transaction,
  TransactionData,
  TxStatus,
  TxType,
} from './types';
import { groupMetaInstructionsByProgram, mergeInstructions } from './utils';

export async function checkTransaction(
  conn: Connection,
  confSignature: ConfirmedSignatureInfo
) {
  const blockTime = confSignature.blockTime;
  const txHash = confSignature.signature;

  let txType = null;
  let transaction: Transaction = {
    hash: txHash,
    slot: confSignature.slot,
    type: null,
    blockTime: new Date(blockTime * 1000),
    status: null,
    data: null,
  };

  try {
    const ptx = await conn.getParsedConfirmedTransaction(txHash);
    const programs = groupMetaInstructionsByProgram(ptx.meta);

    txType = determineTransactionType(programs);
    const status = ptx.meta.err ? TxStatus.FAILURE : TxStatus.SUCCESS;
    if (status === TxStatus.FAILURE) {
      // TODO: should we skip rest of work??
    }

    const transactionData = await parseTransactionDataByType({
      conn,
      ptx,
      txType,
    });

    transaction.type = txType;
    transaction.status = status;
    transaction.data = transactionData;
  } catch (e) {
    console.log('\t❗️❗️❗️ ERROR');
    console.log(`\t\tTx Hash: ${txHash}`);
    console.log(`\t\tTx Type: ${txType}`);
    console.log(`\t\tErr Message: ${e}`);
  }
  return transaction;
}

export async function parseTransactionDataByType({
  conn,
  ptx,
  txType,
}: {
  conn: Connection;
  ptx: ParsedConfirmedTransaction;
  txType: TxType;
}): Promise<TransactionData> {
  const txHash = ptx.transaction.signatures[0];

  const instrs = mergeInstructions(
    ptx.transaction.message.instructions,
    ptx.meta.innerInstructions
  );

  let transactionData: TransactionData = null;

  if (txType === TxType.DELISTING) {
    transactionData = <DelistingTransactionData>(
      await parseDelistTx(conn, txHash, instrs)
    );
  }

  if (txType === TxType.LISTING) {
    transactionData = <ListingTransactionData>(
      await parseListTx(conn, txHash, instrs)
    );
  }

  if (txType === TxType.SALE) {
    transactionData = <SaleTransactionData>(
      await parseSaleTx(conn, txHash, instrs)
    );
  }

  return transactionData;
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
