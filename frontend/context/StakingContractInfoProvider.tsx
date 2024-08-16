import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useInterval } from 'usehooks-ts';

import { FIVE_SECONDS_INTERVAL } from '@/constants/intervals';
import { StakingProgram } from '@/enums/StakingProgram';
import { AutonolasService } from '@/service/Autonolas';
import { StakingContractInfo } from '@/types/Autonolas';

import { ServicesContext } from './ServicesProvider';
import { StakingProgramContext } from './StakingProgramContext';

type StakingContractInfoContextProps = {
  updateStakingContractInfo: () => Promise<void>;
  stakingContractInfo?: StakingContractInfo;
};

export const StakingContractInfoContext =
  createContext<StakingContractInfoContextProps>({
    updateStakingContractInfo: async () => {},
    stakingContractInfo: undefined,
  });

export const StakingContractInfoProvider = ({
  children,
}: PropsWithChildren) => {
  const { services } = useContext(ServicesContext);
  const { currentStakingProgram } = useContext(StakingProgramContext);

  const [stakingContractInfoRecord, setStakingContractInfoRecord] =
    useState<Record<StakingProgram, StakingContractInfo>>();

  const serviceId = useMemo(() => services?.[0]?.chain_data?.token, [services]);

  const [currentStakingContractInfo, setStakingContractInfo] =
    useState<StakingContractInfo>();

  // CURRENT staking contract info should be updated on interval
  const updateCurrentStakingContractInfo = useCallback(async () => {
    if (!serviceId) return;

    if (!currentStakingProgram) return;
    const info =
      await AutonolasService.getStakingContractInfoByServiceIdStakingProgram(
        serviceId,
        currentStakingProgram,
      );
    if (!info) return;

    setStakingContractInfo(info);
  }, [currentStakingProgram, serviceId]);

  useInterval(updateCurrentStakingContractInfo, FIVE_SECONDS_INTERVAL);

  return (
    <StakingContractInfoContext.Provider
      value={{
        updateStakingContractInfo: updateCurrentStakingContractInfo,
        stakingContractInfo: currentStakingContractInfo,
      }}
    >
      {children}
    </StakingContractInfoContext.Provider>
  );
};
