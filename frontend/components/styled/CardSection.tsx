import { Flex, FlexProps } from 'antd';
import styled from 'styled-components';

type CardSectionProps = FlexProps & {
  border?: boolean;
  padding?: number;
};

/**
 * A styled `Flex` component that represents a section of a card.
 * @param {CardSectionProps} props
 */
export const CardSection = styled(Flex)<CardSectionProps>`
  ${(props) => {
    const { border, padding } = props;

    const borderStyle = border
      ? 'border-bottom: 1px solid #f0f0f0; border-top: 1px solid #f0f0f0;'
      : '';

    const paddingStyle = `padding: ${Number(padding) ? `${padding}` : '24'}px;`;

    return `
      ${borderStyle}
      ${paddingStyle}
    `;
  }}
  border-collapse: collapse;
  margin-left: -24px;
  margin-right: -24px;
`;
