import React from 'react';
import styled from 'styled-components';
import { RouteComponentProps } from 'react-router';
import { Row } from "../../../components/Row/Row";
import { Card } from '../../../components/Card/Card';
import { TOKEN_LABELS } from '../../../constants/tokens';
import { BuildPosition } from './BuildPosition';
import { InfoTip } from '../../../components/InfoTip/InfoTip';
import { Breadcrumbs } from '../../../components/Breadcrumbs/Breadcrumbs';
import { TEXT } from '../../../theme/theme';
import { Accordion } from '../../../components/Accordion/Accordion';
import { Device } from '../../../components/Device/Device';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 900px;
  margin: 0 auto 32px;
  padding: 16px;
  position: static;
  border-top: 2px solid #12B4FF;
  z-index: 0;

  ${({ theme }) => theme.mediaWidth.minMedium`
    padding: 16px 0;
    position: relative;
  `};
`;

const MarketHeader = ({
  marketName,
  marketPrice
}:{
  marketName: string
  marketPrice: number | string
}) => {
  return (
    <Card width={'auto'} textAlign={'center'} flexDirection={'column'} color={'white'}>
      <TEXT.MediumHeader fontWeight={700}>
        { marketName }
      </TEXT.MediumHeader>
      <TEXT.MediumHeader>
        ${ marketPrice }
      </TEXT.MediumHeader>
    </Card>
  )
}



export function Market(
  { match: {params: { marketId }}
}: RouteComponentProps<{ marketId: string }>
) {
  let marketName = TOKEN_LABELS[Number(marketId)];

  return (
    <>
      <Container>
        <MarketHeader marketName={marketName} marketPrice={2241.25} />
        <BuildPosition />
      </Container>
    </>
  )
};
