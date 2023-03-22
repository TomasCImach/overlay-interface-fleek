import {
  addTransaction,
  clearAllTransactions,
  finalizeTransaction,
  checkedTransaction,
  SerializableTransactionReceipt,
  TransactionInfo,
} from './actions'

import {createReducer} from '@reduxjs/toolkit'

const now = () => new Date().getTime()

export interface TransactionDetails {
  hash: string
  receipt?: SerializableTransactionReceipt
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
  info: TransactionInfo
}

export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: TransactionDetails
  }
}

export const initialState: TransactionState = {}

export default createReducer(initialState, builder =>
  builder
    .addCase(addTransaction, (transactions, {payload: {chainId, from, hash, info}}) => {
      if (transactions[chainId]?.[hash]) {
        throw Error('Attempted to add existing transaction.')
      }
      const txs = transactions[chainId] ?? {}
      txs[hash] = {
        hash,
        from,
        addedTime: now(),
        info,
      }
      transactions[chainId] = txs
    })
    .addCase(clearAllTransactions, (transactions, {payload: {chainId}}) => {
      if (!transactions[chainId]) return
      transactions[chainId] = {}
    })
    .addCase(checkedTransaction, (transactions, {payload: {chainId, hash, blockNumber}}) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber
      } else {
        tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber)
      }
    })
    .addCase(finalizeTransaction, (transactions, {payload: {hash, chainId, receipt}}) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      tx.receipt = receipt
      tx.confirmedTime = now()
    }),
)
