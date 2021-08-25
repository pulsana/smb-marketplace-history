import {
  ParsedInstruction,
  PartiallyDecodedInstruction,
  ParsedInnerInstruction,
  ParsedConfirmedTransactionMeta,
} from '@solana/web3.js';

export function buildProgramKey(ix: any) {
  return `${ix.program}--${ix.programId.toString()}`;
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
