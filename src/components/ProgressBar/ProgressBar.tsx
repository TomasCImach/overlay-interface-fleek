import {useState, useEffect} from 'react'
import {FlexRow, FlexColumn} from '../Container/Container'
import styled from 'styled-components'

const Container = styled.div<{width: string; margin?: string}>`
  margin: ${({margin}) => (margin ? margin : 'auto')};
  width: ${({width}) => width};
  text-align: center;
`

const ProgressBackground = styled.div<{reverse: boolean; split: boolean}>`
  border-radius: ${({split}) => (split ? '0 30px 30px 0' : '30px')};
  border-left: ${({split}) => (split ? '0px' : 'auto')};
  background: #5FD0AB;
  transform: ${({reverse}) => (reverse ? 'rotate(-180deg)' : '')};
`
// box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.25), 0 1px rgba(255, 255, 255, 0.08);

const Bar = styled.div<{width?: number; color: string; split: boolean}>`
  position: relative;
  height: 6px;
  border-radius: 30px 0px 0px 30px;
  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05));
  transition: 1s ease-out;
  transition-property: width, background-color;
  width: ${({width}) => `${width}%`};
  background-color: ${({color}) => color};
  animation: progressAnimation 1s;
`

const Triangle = styled.div`
  position: absolute;
  top: 6px;
  right: -6px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid white;
`;
// border-left: ${({split}) => (split ? '0.5px solid #6D6D6D' : 'auto')};

type ProgressBarProps = {
  value: number | undefined | null
  max: number | undefined | null
  color: string
  width?: string
  margin?: string | undefined
  reverse?: boolean
  split?: boolean
}

export const ProgressBar = ({value, max, color, margin, width = 'auto', reverse = false, split = false}: ProgressBarProps) => {
  const [progressValue, setProgressValue] = useState(0)
  const currentPercentage = max && value ? (value / max) * 100 : 0

  useEffect(() => {
    if (progressValue !== currentPercentage) {
      setProgressValue(currentPercentage)
    }
  }, [currentPercentage, progressValue])

  return (
    <Container width={width} margin={margin}>
      <ProgressBackground reverse={reverse} split={split}>
        <Bar width={progressValue} color={color} split={split}>
          <Triangle />
        </Bar>

      </ProgressBackground>
    </Container>
  )
}

type DoubleProgressBarProps = {
  leftBarValue: number | undefined | null
  rightBarValue: number | undefined | null
  maxValue: number | undefined | null
}

export const DoubleProgressBar = ({leftBarValue, rightBarValue, maxValue}: DoubleProgressBarProps) => {
  const PROGRESS_BAR_INPUT = {
    width: '50%',
    margin: '0',
    redColor: '#FF648A',
    greenColor: '#5FD0AB',
  }
  return (
    <FlexColumn>
      <FlexRow flexWrap={'wrap'}>
        <ProgressBar
          reverse={true}
          split={true}
          max={maxValue}
          value={leftBarValue}
          width={PROGRESS_BAR_INPUT.width}
          margin={PROGRESS_BAR_INPUT.margin}
          color={PROGRESS_BAR_INPUT.redColor}
        />
        <ProgressBar
          reverse={false}
          split={true}
          max={maxValue}
          value={rightBarValue}
          width={PROGRESS_BAR_INPUT.width}
          margin={PROGRESS_BAR_INPUT.margin}
          color={PROGRESS_BAR_INPUT.greenColor}
        />
      </FlexRow>
    </FlexColumn>
  )
}
