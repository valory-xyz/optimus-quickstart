export type ElectronStore = {
  environmentName?: string;
  isInitialFunded?: boolean;
  firstStakingRewardAchieved?: boolean;
  firstRewardNotificationShown?: boolean;
};

export type ElectronTrayIconStatus = 'low-gas' | 'running' | 'paused';
