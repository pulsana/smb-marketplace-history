import {
  ParsedInstruction,
  PartiallyDecodedInstruction,
  ParsedInnerInstruction,
  ParsedConfirmedTransactionMeta,
  PublicKey,
} from '@solana/web3.js';

import { METAPLEX_METADATA_PROGRAM_ADDRESS } from './metaplex/constants';
import { METADATA_PREFIX } from './metaplex/types';
import { findProgramAddressPublicKey } from './metaplex/utils';

export function buildProgramKey(ix: any) {
  return `${ix.program}--${ix.programId.toString()}`;
}

export async function getMetadataAddressForMint({
  metadataContractPK = new PublicKey(METAPLEX_METADATA_PROGRAM_ADDRESS),
  mintTokenPublicKey,
}: {
  metadataContractPK?: PublicKey;
  mintTokenPublicKey: PublicKey;
}): Promise<PublicKey> {
  const publicKeyForMint = await findProgramAddressPublicKey(
    [
      Buffer.from(METADATA_PREFIX),
      metadataContractPK.toBuffer(),
      mintTokenPublicKey.toBuffer(),
    ],
    metadataContractPK
  );

  return publicKeyForMint;
}

// TODO: figure out how to use types with PartiallyDecodedInstruction
export function mergeInstructions(msgInstructions, innerInstructions) {
  const instructions = [...msgInstructions];

  for (const innerInstrSet of innerInstructions) {
    instructions.splice(innerInstrSet.index, 0, ...innerInstrSet.instructions);
  }

  return instructions;
}

export function groupMetaInstructionsByProgram(
  txMeta: ParsedConfirmedTransactionMeta
) {
  const programs = {};

  txMeta.innerInstructions.forEach(async (parsed: ParsedInnerInstruction) => {
    parsed.instructions.forEach(
      async (ix: ParsedInstruction | PartiallyDecodedInstruction) => {
        const programKey = buildProgramKey(ix);
        if (!programs[programKey]) {
          programs[programKey] = [];
        }

        // solana web3 parses the instructions and returns them; sometimes
        // partialdecodedinstructions are returned.
        // TODO: research
        programs[programKey].push((<ParsedInstruction>ix).parsed);
      }
    );
  });

  return programs;
}
