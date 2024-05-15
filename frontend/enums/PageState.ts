export enum PageState {
  Setup,
  Main,
  Settings,
  Receive,
  Send,
}

export const PageHeights: Record<PageState, string> = {
  [PageState.Setup]: '500',
  [PageState.Main]: '730',
  [PageState.Settings]: '300',
  [PageState.Receive]: 'auto',
  [PageState.Send]: 'auto',
};
