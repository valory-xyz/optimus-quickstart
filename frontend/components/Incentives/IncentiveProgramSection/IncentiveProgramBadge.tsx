import { Tag } from 'antd';

import { IncentiveProgramStatus } from '@/enums/IcentiveProgram';

export const IncentiveProgramTag = ({
  programStatus,
}: {
  programStatus: IncentiveProgramStatus;
}) => {
  if (programStatus === IncentiveProgramStatus.New) {
    return <Tag color="blue">New</Tag>;
  } else if (programStatus === IncentiveProgramStatus.Selected) {
    return <Tag>Selected</Tag>;
  } else if (programStatus === IncentiveProgramStatus.Deprecated) {
    return <Tag>Deprecated</Tag>;
  }
  return null;
};
