import {Result} from './../state/multicall/hooks'
import {useMemo} from 'react'
import {BigNumber} from 'ethers'
import {useV1PeripheryContract} from './useContract'
import {useSingleContractMultipleData} from '../state/multicall/hooks'
import {useBlockNumber} from '../state/application/hooks'
import {AdditionalMarketData, FeedType} from './useMarketDetails'
import {formatBigNumber} from '../utils/formatBigNumber'
import {formatFundingRateToAnnual, formatFundingRateToDaily} from '../utils/formatWei'
import {MARKET_NAME_FROM_DESCRIPTION, MARKET_NAME_FROM_ADDRESS} from '../constants/markets'

interface MarketStateDetails {
  marketAddress: string
  bid: BigNumber
  ask: BigNumber
  mid: BigNumber
  volumeBid: BigNumber
  volumeAsk: BigNumber
  oiLong: BigNumber
  oiShort: BigNumber
  capOi: BigNumber
  circuitBreakerLevel: BigNumber
  fundingRate: BigNumber
}

interface ParsedMarketStateDetails extends MarketStateDetails {
  marketName: string
  parsedBid: number
  parsedAsk: number
  parsedMid: number
  parsedOiLong: number
  parsedOiShort: number
  parsedCapOi: number
  parsedFundingRate: number
  parsedAnnualFundingRate: number | string
  parsedDailyFundingRate: number | string
}

interface UseMarketStateResults {
  loading: boolean
  error: boolean
  markets: MarketStateDetails[] | ParsedMarketStateDetails[] | undefined
}

export function useCurrentMarketState(marketsData: AdditionalMarketData[] | undefined, sigFigs: number = 4): UseMarketStateResults {
  const peripheryContract = useV1PeripheryContract()
  const inputs = useMemo(() => (marketsData ? marketsData.map(market => [market.id]) : []), [marketsData])
  const results = useSingleContractMultipleData(peripheryContract, 'marketState', inputs)
  const loading = useMemo(() => results.some(({loading}) => loading), [results])
  const error = useMemo(() => results.some(({error}) => error), [results])

  const markets = useMemo(() => {
    if (!loading && !error && marketsData) {
      return results.map((call, index) => {
        const market: AdditionalMarketData = marketsData[index]
        const decimals = market.decimals
        const uniswapDecimalsDifference = market.decimalsDifference
        const result = call.result as Result
        const marketId = market.id
        const description = market.description

        let marketName = undefined
        let parsedBid: string | number | undefined = undefined
        let parsedAsk: string | number | undefined = undefined
        let parsedMid: string | number | undefined = undefined
        let parsedOiLong: string | number | undefined = undefined
        let parsedOiShort: string | number | undefined = undefined
        let parsedCapOi: string | number | undefined = undefined
        let parsedDailyFundingRate: string | number | undefined = undefined
        let parsedAnnualFundingRate: string | number | undefined = undefined

        if (decimals && market.type === FeedType.CHAINLINK) {
          marketName =
            description && MARKET_NAME_FROM_DESCRIPTION[description] ? MARKET_NAME_FROM_DESCRIPTION[description] : MARKET_NAME_FROM_ADDRESS[marketId]
          parsedBid = decimals && formatBigNumber(result.state_.bid, decimals, sigFigs)
          parsedAsk = decimals && formatBigNumber(result.state_.ask, decimals, sigFigs)
          parsedMid = decimals && formatBigNumber(result.state_.mid, decimals, sigFigs)
          parsedOiLong = decimals && formatBigNumber(result.state_.oiLong, decimals, sigFigs)
          parsedOiShort = decimals && formatBigNumber(result.state_.oiShort, decimals, sigFigs)
          parsedCapOi = decimals && formatBigNumber(result.state_.capOi, decimals, sigFigs)
          parsedDailyFundingRate = decimals && formatFundingRateToDaily(result.state_.fundingRate, 18, 2)
          parsedAnnualFundingRate = decimals && formatFundingRateToAnnual(result.state_.fundingRate, 18, 2)
        } else if (decimals && uniswapDecimalsDifference && market.type === FeedType.UNISWAP) {
          marketName = description
          parsedBid = decimals && formatBigNumber(result.state_.bid, decimals, sigFigs)
          parsedAsk = decimals && formatBigNumber(result.state_.ask, decimals, sigFigs)
          parsedMid = decimals && formatBigNumber(result.state_.mid, decimals, sigFigs)
          parsedOiLong = decimals && formatBigNumber(result.state_.oiLong, uniswapDecimalsDifference + 18, sigFigs)
          parsedOiShort = decimals && formatBigNumber(result.state_.oiShort, uniswapDecimalsDifference + 18, sigFigs)
          parsedCapOi = decimals && formatBigNumber(result.state_.capOi, uniswapDecimalsDifference + 18, sigFigs)
          parsedDailyFundingRate = decimals && formatFundingRateToDaily(result.state_.fundingRate, 18, 2)
          parsedAnnualFundingRate = decimals && formatFundingRateToAnnual(result.state_.fundingRate, 18, 2)
        }

        return {
          ...market,
          marketName,
          bid: result.state_.bid,
          ask: result.state_.ask,
          mid: result.state_.mid,
          volumeBid: result.state_.volumeBid,
          volumeAsk: result.state_.volumeAsk,
          oiLong: result.state_.oiLong,
          oiShort: result.state_.oiShort,
          capOi: result.state_.capOi,
          circuitBreakerLevel: result.state_.circuitBreakerLevel,
          fundingRate: result.state_.fundingRate,
          parsedBid,
          parsedAsk,
          parsedMid,
          parsedOiLong,
          parsedOiShort,
          parsedCapOi,
          parsedDailyFundingRate,
          parsedAnnualFundingRate,
        }
      })
    }
    return undefined
  }, [loading, error, results, marketsData, sigFigs])

  return {
    loading,
    error,
    markets: markets?.map((market, index) => ({...market, marketAddress: inputs[index][0]})),
  }
}
