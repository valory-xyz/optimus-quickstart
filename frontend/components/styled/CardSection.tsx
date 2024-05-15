import { Flex, FlexProps } from 'antd';
import styled from 'styled-components';

import { COLOR } from '@/constants';

type CardSectionProps = FlexProps & {
  borderTop?: boolean;
  borderBottom?: boolean;
  padding?: number;
};

/**
 * A styled `Flex` component that represents a section of a card.
 * @param {CardSectionProps} props
 */
export const CardSection = styled(Flex)<CardSectionProps>`
  ${(props) => {
    const { padding, borderBottom, borderTop } = props;

    const paddingStyle = `padding: ${Number(padding) ? `${padding}` : '24'}px;`;
    const borderTopStyle = borderTop
      ? `border-top: 1px solid ${COLOR.BORDER_GRAY};`
      : '';
    const borderBottomStyle = borderBottom
      ? `border-bottom: 1px solid ${COLOR.BORDER_GRAY};`
      : '';

    return `
      ${paddingStyle}
      ${borderTopStyle}
      ${borderBottomStyle}
    `;
  }}
  border-collapse: collapse;
  margin-left: -24px;
  margin-right: -24px;

  &:nth-child(1) {
    margin-top: -24px;
  }

  &:nth-last-child(1) {
    margin-bottom: -24px;
  }
`;
