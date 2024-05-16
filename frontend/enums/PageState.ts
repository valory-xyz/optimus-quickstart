export enum PageState {
  Setup,
  Main,
  Settings,
  Receive,
  Send,
}

export const PageHeights: Record<PageState, number> = {
  [PageState.Setup]: 415,
  [PageState.Main]: 730,
  [PageState.Settings]: 215,
  [PageState.Receive]: 415,
  [PageState.Send]: 415,
};
