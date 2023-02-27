import {useMemo, useEffect} from 'react'
import styled from 'styled-components/macro'
import {NavLink, useHistory} from 'react-router-dom'
import {TableBody, TableContainer, TableHead, Paper} from '@material-ui/core'
import {Trans} from '@lingui/macro'
import {TEXT} from '../../theme/theme'
import {useTotalMarketsData} from '../../state/markets/hooks'
import {
  formatFundingRateToDaily,
  formatFundingRateToAnnual,
  formatBigNumberUsingDecimalsToString,
} from '../../utils/formatWei'
import {PageContainer} from '../../components/Container/Container'
import {ProgressBar, DoubleProgressBar} from '../../components/ProgressBar/ProgressBar'
import {FlexColumn, FlexRow} from '../../components/Container/Container'
import {
  StyledTable,
  StyledHeaderCell,
  StyledTableCellThin,
  StyledTableRow,
  StyledTableHeaderRow,
} from '../../components/Table/Table'
import Loader from '../../components/Loaders/Loaders'
import {useMarketNames} from '../../hooks/useMarketName'
import {useMarketMidPrices} from '../../hooks/useMarketPrices'
import {useFundingRates} from '../../hooks/useFundingRates'
import {useMarketOis} from '../../hooks/useMarketOis'
import {useMarketCapOis} from '../../hooks/useMarketCapOi'
import {useMarketBaseAmounts} from '../../hooks/useMarketBaseAmount'
import {useMarketQuoteAmounts} from '../../hooks/useMarketQuoteAmounts'
import {useMarketStateFromAddresses} from '../../hooks/useMarketState'
import {isAddress} from '../../utils/web3'
import {BigNumberish, BigNumber} from 'ethers'
import {Result} from '../../state/multicall/hooks'
import {MARKET_NAME} from '../../constants/markets'
import {InfoTip} from '../../components/InfoTip/InfoTip'

const activeClassName = 'INACTIVE'

export const StyledNavLink = styled(NavLink).attrs({activeClassName})`
  color: ${({theme}) => theme.text1};
  font-weight: 500;
  text-decoration: none;

  :hover {
    font-weight: 700;
  }
  :focus {
    font-weight: 700;
  }
`

type MarketRowProps = {
  marketId: string | undefined
  description: string | Result
  decimals: number | Result
  baseToken: string | Result
  quoteToken: string | Result
  quoteAmount: number
  midPrice: BigNumber | undefined
  oiLong: number | undefined
  oiShort: number | undefined
  capOi: number | undefined | null
  fundingRate: BigNumber | undefined
  index: any
}

type ReturnedValue = {}
const MarketRow = ({
  marketId,
  description,
  decimals,
  baseToken,
  quoteToken,
  quoteAmount,
  midPrice,
  oiLong,
  oiShort,
  capOi,
  fundingRate,
  index,
}: MarketRowProps) => {
  const history = useHistory()

  function redirectToMarket(marketId: string) {
    history.push(`/markets/${marketId}`)
  }

  const marketName = useMemo(() => {
    if (description) {
      let string = String(description)
      return MARKET_NAME[string]
    }
    if (baseToken === 'loading' && quoteToken === 'loading')
      return <Loader stroke="white" size="12px" />
    return `${baseToken}/${quoteToken}`
  }, [description, baseToken, quoteToken])

  const LOADING_STATE = 'loading'

  const oiPercentageOfTotal = useMemo(() => {
    if (oiLong === undefined || oiShort === undefined || capOi === undefined || capOi === null) {
      return {
        long: undefined,
        short: undefined,
      }
    }

    const longPercentage = (oiLong / capOi) * 100
    const shortPercentage = (oiShort / capOi) * 100

    return {
      long: longPercentage.toFixed(2),
      short: shortPercentage.toFixed(2),
    }
  }, [oiLong, oiShort, capOi])

  const marketAttributes = useMemo(() => {
    if (decimals && fundingRate) {
      let parsedDecimal = Number(decimals)
      return {
        marketId,
        baseToken,
        quoteToken: <Loader stroke="white" size="12px" />,
        midPrice: formatBigNumberUsingDecimalsToString(midPrice, parsedDecimal, 2),
        dailyFundingRate: formatFundingRateToDaily(fundingRate, 18, 2),
        annualFundingRate: formatFundingRateToAnnual(fundingRate, 18, 2),
      }
    } else if (baseToken === LOADING_STATE || quoteToken === LOADING_STATE || !quoteAmount) {
      return {
        marketId,
        baseToken: <Loader stroke="white" size="12px" />,
        quoteToken: <Loader stroke="white" size="12px" />,
        midPrice: <Loader stroke="white" size="12px" />,
        dailyFundingRate: <Loader stroke="white" size="12px" />,
        annualFundingRate: <Loader stroke="white" size="12px" />,
      }
    } else {
      return {
        marketId,
        baseToken,
        quoteToken,
        midPrice: formatBigNumberUsingDecimalsToString(midPrice, quoteAmount, 4),
        dailyFundingRate: formatFundingRateToDaily(fundingRate, 18, 2),
        annualFundingRate: formatFundingRateToAnnual(fundingRate, 18, 2),
      }
    }
  }, [marketId, baseToken, quoteToken, midPrice, decimals, quoteAmount, fundingRate])

  // const marketAttributes = useMemo(
  //   () => ({
  //     marketId,
  //     baseToken: baseToken === LOADING_STATE ? <Loader stroke="white" size="12px" /> : baseToken,
  //     quoteToken: quoteToken === LOADING_STATE ? <Loader stroke="white" size="12px" /> : quoteToken,
  //     midPrice:
  //       midPrice && quoteAmount ? (
  //         formatBigNumberUsingDecimalsToString(midPrice, quoteAmount, 4)
  //       ) : (
  //         <Loader stroke="white" size="12px" />
  //       ),
  //     dailyFundingRate: fundingRate ? (
  //       formatFundingRateToDaily(fundingRate, 18, 2)
  //     ) : (
  //       <Loader stroke="white" size="12px" />
  //     ),
  //     annualFundingRate: fundingRate ? (
  //       formatFundingRateToAnnual(fundingRate, 18, 2)
  //     ) : (
  //       <Loader stroke="white" size="12px" />
  //     ),
  //   }),
  //   [marketId, baseToken, quoteToken, quoteAmount, midPrice, fundingRate],
  // )

  return (
    <StyledTableRow
      onClick={() => redirectToMarket(marketId ?? '')}
      hover={true}
      key={index.toString()}
    >
      <StyledTableCellThin component="th" scope="row">
        {marketName}
      </StyledTableCellThin>
      <StyledTableCellThin align="left">{marketAttributes.midPrice}</StyledTableCellThin>
      <StyledTableCellThin align="left">
        <FlexRow>
          <TEXT.SmallBody mr="auto">{oiPercentageOfTotal.short}%</TEXT.SmallBody>
          <TEXT.SmallBody>{oiPercentageOfTotal.long}%</TEXT.SmallBody>
        </FlexRow>
        <DoubleProgressBar leftBarValue={oiShort} rightBarValue={oiLong} maxValue={capOi} />
      </StyledTableCellThin>
      <StyledTableCellThin align="right">
        {marketAttributes.dailyFundingRate}% ({marketAttributes.annualFundingRate}%)
      </StyledTableCellThin>
    </StyledTableRow>
  )
}

const Markets = () => {
  const {markets, isLoading, refetch} = useTotalMarketsData()

  console.log('markets: ', markets)
  // force refetch when page refreshes
  useEffect(() => {
    refetch()
  }, [isLoading, refetch])

  const calldata = useMemo(
    () => ({
      marketAddresses: !markets ? [] : markets.map((market: any) => [market.id]),
      feedAddresses: !markets ? [] : markets.map((market: any) => market.feedAddress),
      marketIds: !markets ? [] : markets.map((market: any) => market.id),
    }),
    [markets],
  )
  const {baseTokens, quoteTokens, decimals, descriptions} = useMarketNames(calldata.feedAddresses)
  const baseAmounts = useMarketBaseAmounts(calldata.feedAddresses)
  const quoteAmounts = useMarketQuoteAmounts(calldata.feedAddresses)

  const tokenPairDecimals = useMemo(
    () => ({
      baseTokens:
        baseAmounts.length === 0 ? null : baseAmounts.map((tokenDecimals: any) => tokenDecimals),
      quoteTokens:
        quoteAmounts.length === 0 ? null : quoteAmounts.map((tokenDecimals: any) => tokenDecimals),
    }),
    [baseAmounts, quoteAmounts],
  )

  const ois = useMarketOis(
    calldata.marketAddresses,
    tokenPairDecimals.baseTokens,
    tokenPairDecimals.quoteTokens,
    decimals,
  )
  const capOis = useMarketCapOis(
    calldata.marketAddresses,
    tokenPairDecimals.baseTokens,
    tokenPairDecimals.quoteTokens,
    decimals,
  )

  const {loading, error, markets: marketStates} = useMarketStateFromAddresses(calldata.marketIds)

  const INFO_TIP_DESCRIPTIONS = {
    openInterest: (
      <>
        <div>Open Interest (OI) refers to </div>
        <div>the total available outstanding</div>
        <div>positions that have not been settled,</div>
        <div>per market, denoted in OVL.</div>
        <br />
        <div>% = current total percent filled of</div>
        <div>Open Interest Cap.</div>
      </>
    ),
    fundingRate: (
      <>
        <div>Funding Rate per Market</div>
        <br />
        <div>Left value shows funding</div>
        <div>rate every 24 hours. Value</div>
        <div>in paranthesis shows funding</div>
        <div>rate annualized.</div>
        <br />
        <div>Funding rate + when:</div>
        <div>Long OI {'>'} Short OI</div>
        <br />
        <div>Funding rate - when:</div>
        <div>Long OI {'<'} Short OI</div>
      </>
    ),
  }

  return (
    <PageContainer>
      <TableContainer component={Paper}>
        <StyledTable>
          <TableHead>
            <StyledTableHeaderRow>
              <StyledHeaderCell>
                <Trans> Market </Trans>
              </StyledHeaderCell>
              <StyledHeaderCell>
                <Trans> Price </Trans>
              </StyledHeaderCell>
              <StyledHeaderCell>
                <Trans> OI: Short | Long </Trans>
                <InfoTip
                  children={INFO_TIP_DESCRIPTIONS.openInterest}
                  tipFor="Market Open Interest"
                />
              </StyledHeaderCell>
              <StyledHeaderCell align="right">
                <Trans> Funding Rate </Trans>
                <InfoTip
                  children={INFO_TIP_DESCRIPTIONS.fundingRate}
                  tipFor="Market Funding Rate"
                />
              </StyledHeaderCell>
            </StyledTableHeaderRow>
          </TableHead>
          <TableBody>
            {markets?.map((market: any, index: any) => (
              <MarketRow
                marketId={marketStates?.[index]?.marketAddress}
                decimals={decimals[index]}
                description={descriptions[index]}
                baseToken={baseTokens[index]}
                quoteToken={quoteTokens[index]}
                quoteAmount={quoteAmounts[index]}
                midPrice={marketStates?.[index]?.mid}
                oiLong={ois[index]?.oiLong}
                oiShort={ois[index]?.oiShort}
                capOi={capOis[index]}
                fundingRate={marketStates?.[index]?.fundingRate}
                index={index}
              />
            ))}
          </TableBody>
        </StyledTable>
      </TableContainer>
    </PageContainer>
  )
}

export default Markets
