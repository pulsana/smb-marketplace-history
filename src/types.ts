export enum SolanaProgram {
  SPL_TOKEN = 'spl-token',
  SYSTEM = 'system',
}

export enum SolanaProgramInstructionType {
  TRANSFER = 'transfer',
}

export enum TxStatus {
  FAILURE = 'FAILURE',
  SUCCESS = 'SUCCESS',
}

export enum TxType {
  DELISTING = 'DELISTING',
  LISTING = 'LISTING',
  SALE = 'SALE',
  UNKNOWN = 'UNKNOWN',
}

export interface Tx {
  hash: string;
  type: TxType;
  status: TxStatus;
  blockTime: Date;
}
