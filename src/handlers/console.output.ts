import { format } from 'date-fns';

import {
  DelistingTransaction,
  ListingTransaction,
  SaleTransaction,
  Transaction,
  TxStatus,
  TxType,
} from '../types';

function padPrice(priceTxt) {
  let paddedPrice = priceTxt;
  const paddingNeeded = '00000.00000000'.length - priceTxt.length;

  for (let paddingIdx = 0; paddingIdx < paddingNeeded; paddingIdx++) {
    paddedPrice += ' ';
  }

  return paddedPrice;
}

function padName(name) {
  let paddedName = name;
  const paddingNeeded = 'SMB #0000'.length - name.length;

  for (let paddingIdx = 0; paddingIdx < paddingNeeded; paddingIdx++) {
    paddedName += ' ';
  }

  return paddedName;
}

function getStatusEmoji(txStatus: TxStatus) {
  return txStatus === TxStatus.FAILURE ? '❗️' : '✅';
}

export function logToConsole(tx: Transaction) {
  if (tx.type === TxType.DELISTING) {
    let message = `[${getStatusEmoji(tx.status)}] ${tx.type} → ${padName(
      (<DelistingTransaction>tx).data.nft.name
    )} → ${format(tx.blockTime, 'yyyy-MM-dd HH:mm:ss')} → ${padPrice('')} :${
      tx.hash
    }`;
    console.log(`\t${message}`);
  }

  if (tx.type === TxType.LISTING) {
    let message = `[${getStatusEmoji(tx.status)}] ${tx.type}   → ${padName(
      (<ListingTransaction>tx).data.nft.name
    )} → ${format(tx.blockTime, 'yyyy-MM-dd HH:mm:ss')} → ${padPrice(
      (<ListingTransaction>tx).data.listingPriceInSOL
    )} :${tx.hash}`;
    console.log(`\t${message}`);
  }

  if (tx.type === TxType.SALE) {
    let message = `[${getStatusEmoji(tx.status)}] ${tx.type}      → ${padName(
      (<SaleTransaction>tx).data.nft.name
    )} → ${format(tx.blockTime, 'yyyy-MM-dd HH:mm:ss')} → ${padPrice(
      (<SaleTransaction>tx).data.saleAmountInSOL
    )} :${tx.hash}`;
    console.log(`\t${message}`);
  }
}
