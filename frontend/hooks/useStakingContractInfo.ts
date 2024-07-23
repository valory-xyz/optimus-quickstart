import { ServicesContext } from "@/context/ServicesProvider";
import { StakingContractInfoContext } from "@/context/StakingContractInfoProvider";
import { AutonolasService } from "@/service/Autonolas";
import { StakingContractInfo } from "@/types/Autonolas";
import _ from "lodash";
import { useContext } from "react";

export const useStakingContractInfo = () => {
  const { stakingContractInfo } = useContext(StakingContractInfoContext);
  const { services } = useContext(ServicesContext);

  if (!services) return {};
  if (!stakingContractInfo) return {};

  const { serviceStakingState, serviceStakingStartTime, availableRewards, serviceIds, maxNumServices, minimumStakingDuration } = stakingContractInfo;


  const isRewardsAvailable = availableRewards > 0;
  const hasEnoughServiceSlots = serviceIds.length < maxNumServices;
  const hasEnoughRewardsAndSlots =
        isRewardsAvailable && hasEnoughServiceSlots;

  const isAgentEvicted = serviceStakingState === 2;

      if (!serviceId) return;

      const info = await AutonolasService.getStakingContractInfo(serviceId);
      if (!info) return;

      const  = info;

      

      /**
       * For example: minStakingDuration = 3 days
       *
       * - Service starts staking 1st June 00:01
       * - Service stops being active on 1st June 02:01 (after 2 hours)
       * - Contract will evict the service at 3rd June 02:02
       * - Now, cannot unstake the service until 4th June 00:01, because it hasn’t met the minStakingDuration of 3 days.
       * - IMPORTANT: Between 3rd June 02:02 and 4th June 00:01 the service is EVICTED and without the possibility of unstake and re-stake
       * - That is, user should not be able to run/start your agent if this condition is met.
       *
       */
      const isServiceStakedForMinimumDuration =
        Math.round(Date.now() / 1000) - serviceStakingStartTime >=
        minimumStakingDuration;

      /**
       * user can start the agent iff,
       * - rewards are available
       * - service has enough slots
       * - if agent is evicted, then service should be staked for minimum duration
       */
      const isEligibleForStaking =
        hasEnoughRewardsAndSlots &&
        (isAgentEvicted ? isServiceStakedForMinimumDuration : true);

      setIsRewardsAvailable(isRewardsAvailable);
      setHasEnoughServiceSlots(hasEnoughServiceSlots);
      setIsEligibleForStaking(isEligibleForStaking);
      setIsAgentEvicted(isAgentEvicted);
    } catch (error) {
      console.error('Failed to fetch staking contract info', error);
    }
  }, [serviceId]);
};
