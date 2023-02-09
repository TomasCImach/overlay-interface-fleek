import {TransactionType} from './../transactions/actions'
import {useState, useEffect} from 'react'
import {TransactionResponse} from '@ethersproject/providers'
import {CurrencyAmount, Token} from '@uniswap/sdk-core'
import {useActiveWeb3React} from '../../hooks/web3'
import JSBI from 'jsbi'
import {useSingleCallResult} from '../multicall/hooks'
import {isAddress} from '../../utils/web3'
import {useContract} from '../../hooks/useContract'
import {calculateGasMargin} from '../../utils/calculateGasMargin'
import {useTransactionAdder} from '../transactions/hooks'
import {MERKLE_DISTRIBUTOR_ADDRESS} from './../../constants/addresses'
import MERKLE_DISTRIBUTOR_ABI from '../../constants/abis/MerkleDistributor.json'
import {BigNumberish} from 'ethers'
import MOCK_CLAIM_DATA from './data.json'

function useMerkleDistributorContract() {
  return useContract(MERKLE_DISTRIBUTOR_ADDRESS, MERKLE_DISTRIBUTOR_ABI, true)
}

interface UserClaimData {
  address: string
  proof: string[]
  amount: BigNumberish
  index: number
}

let FETCH_CLAIM_FILE_PROMISE: any
export function fetchClaimFile() {
  return (
    FETCH_CLAIM_FILE_PROMISE ??
    (FETCH_CLAIM_FILE_PROMISE = fetch('data.json')
      .then(response => {
        console.log(response)
        return response.json()
      })
      .catch(error => {
        console.error('Failed to get claim file', error)
        FETCH_CLAIM_FILE_PROMISE = null
      }))
  )
}

const FETCH_CLAIM_PROMISES: {[key: string]: UserClaimData} = {}
export function fetchClaim(account: string): any {
  const formattedAddress = isAddress(account)
  if (!formattedAddress) return Promise.reject(new Error('Invalid address'))

  return (
    FETCH_CLAIM_PROMISES[account] ??
    (FETCH_CLAIM_PROMISES[account] = fetchClaimFile()
      .then((claimData: any) => {
        const keys = Object.keys(claimData)
        const filtered = keys.filter(address => address === formattedAddress)

        if (filtered.length > 0) {
          return claimData[formattedAddress]
        }
        throw new Error(`Claim for ${formattedAddress} was not found after searching all mappings`)
      })
      .catch((error: any) => {
        console.debug('Claim fetch failed', error)
        throw error
      }))
  )
}

export function useUserClaimData(account: string | null | undefined): UserClaimData | null {
  const {chainId} = useActiveWeb3React()

  const [claimInfo, setClaimInfo] = useState<{[account: string]: UserClaimData | null}>({})

  useEffect(() => {
    if (!account || chainId !== 1) return

    fetchClaim(account)
      .then((accountClaimInfo: any) => {
        setClaimInfo(claimInfo => {
          return {
            ...claimInfo,
            [account]: accountClaimInfo,
          }
        })
      })
      .catch(() => {
        setClaimInfo(claimInfo => {
          return {
            ...claimInfo,
            [account]: null,
          }
        })
      })
  }, [account, chainId])

  return account ? claimInfo[account] : null
}

export function useUserHasAvailableClaim(account: string | null | undefined): boolean {
  const userClaimData = useUserClaimData(account)
  const distributorContract = useMerkleDistributorContract()
  const isClaimedResult = useSingleCallResult(distributorContract, 'isClaimed', [
    userClaimData?.index,
  ])
  // user is in blob and contract marks as unclaimed
  return Boolean(userClaimData && !isClaimedResult.loading && isClaimedResult.result?.[0] === false)
}

export function useClaimCallback() {}
