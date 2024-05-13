import { Card } from 'antd';
import styled from 'styled-components';

type CardFlexProps = {
  gap?: number;
};
export const CardFlex = styled(Card)<CardFlexProps>`
  .ant-card-body {
    ${(props) => {
      const { gap } = props;

      const gapStyle = gap ? `gap: ${gap}px;` : '';

      return `${gapStyle}`;
    }}
    display: flex;
    flex-direction: column;
  }
`;
