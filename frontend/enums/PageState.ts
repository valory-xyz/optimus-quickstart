export enum PageState {
  Setup,
  Main,
  Settings,
  Receive,
  Send,
}

export const PageHeights: Record<PageState, number | null> = {
  [PageState.Setup]: 500,
  [PageState.Main]: 730,
  [PageState.Settings]: 300,
  [PageState.Receive]: null,
  [PageState.Send]: null,
};
