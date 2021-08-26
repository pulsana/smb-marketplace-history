export interface MetaplexMetadata {
  name: string;
  metadataUri: string;
  symbol: string;
}

export interface SMBAttributes {
  description: string;
  external_url?: string;
  image: string;
  name: string;
  properties: any;
  seller_fee_basis_points: number;
  symbol: string;
}
export interface NFTMetadata extends MetaplexMetadata {
  attrs: SMBAttributes;
}

export interface Transaction {
  hash: string;
  type: TxType;
  slot: number;
  status: TxStatus;
  blockTime: Date;
  data: TransactionData;
}

export interface TransactionData {
  nftAddress: string;
  nft: NFTMetadata;
}

export interface DelistingTransactionData extends TransactionData {
  sellerAddress: string;
}
export interface DelistingTransaction extends Transaction {
  data: DelistingTransactionData;
}

export interface ListingTransactionData extends TransactionData {
  sellerAddress: string;
  listingPrice: string;
  listingPriceInSOL: string;
  listingFee: string;
  listingFeeInSOL: string;
}
export interface ListingTransaction extends Transaction {
  data: ListingTransactionData;
}

export interface SaleTransactionData extends TransactionData {
  buyerAddress: string;
  sellerAddress: string;
  saleAmount: string;
  saleAmountInSOL: string;
  feeAmount: string;
  feeAmountInSOL: string;
}
export interface SaleTransaction extends Transaction {
  data: SaleTransactionData;
}

export type NotificationHandler = (tx: Transaction) => void;

export enum SolanaProgram {
  SPL_TOKEN = 'spl-token',
  SYSTEM = 'system',
}

export enum SolanaProgramInstructionType {
  ALLOCATE = 'allocate',
  INITIALIZE_ACCOUNT = 'initializeAccount',
  SET_AUTHORITY = 'setAuthority',
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
