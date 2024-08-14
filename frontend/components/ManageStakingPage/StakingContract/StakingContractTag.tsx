import { Tag } from 'antd';

import { IncentiveProgramStatus } from '@/enums/IcentiveProgram';

export const StakingContractTag = ({
  status,
}: {
  status: IncentiveProgramStatus;
}) => {
  if (status === IncentiveProgramStatus.New) {
    return <Tag color="blue">New</Tag>;
  } else if (status === IncentiveProgramStatus.Selected) {
    return <Tag>Selected</Tag>;
  } else if (status === IncentiveProgramStatus.Deprecated) {
    return <Tag>Deprecated</Tag>;
  }
  return null;
};
