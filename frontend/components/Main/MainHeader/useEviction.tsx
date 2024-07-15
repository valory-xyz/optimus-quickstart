// hook to check if the agent is evicted

export const useEviction = () => {
  // scenario 1: agent is evicted and min staking duration is NOT met
  // ie, user CANNOT start the agent

  // scenario 2: agent is evicted and min staking duration is met
  // ie, user CAN start the agent

  // return {
  //   isEvicted: false,
  //   canStartAgent: true,
  //   message: 'Eviction message',
  // };

  // no eviction
  return {
    isEvicted: false,
    canStartAgent: true,
    message: null,
  };
};
