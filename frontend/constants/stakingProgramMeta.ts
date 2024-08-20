import { StakingProgram } from '@/enums/StakingProgram';

export const STAKING_PROGRAM_META: Record<
  StakingProgram,
  {
    name: string;
  }
> = {
  [StakingProgram.Alpha]: {
    name: 'Pearl Alpha',
  },
  [StakingProgram.Beta]: {
    name: 'Pearl Beta',
  },
};
