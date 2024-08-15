import { Tag } from 'antd';

import { StakingProgramStatus } from '@/enums/StakingProgramStatus';

export const StakingContractTag = ({
  status,
}: {
  status: StakingProgramStatus;
}) => {
  if (status === StakingProgramStatus.New) {
    return <Tag color="blue">New</Tag>;
  } else if (status === StakingProgramStatus.Selected) {
    return <Tag>Selected</Tag>;
  }
  return null;
};
