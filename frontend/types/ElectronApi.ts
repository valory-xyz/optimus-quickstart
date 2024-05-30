export type ElectronStore = {
  appVersion?: string;
  releaseType?: string;
  isInitialFunded?: boolean;
  firstStakingRewardAchieved?: boolean;
  firstRewardNotificationShown?: boolean;
};

export type ElectronTrayIconStatus = 'low-gas' | 'running' | 'paused';
