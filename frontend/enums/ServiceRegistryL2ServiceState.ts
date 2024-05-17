// Reflects the state of a service in the ServiceRegistryL2 contract (i.e. https://gnosisscan.io/address/0xa45E64d13A30a51b91ae0eb182e88a40e9b18eD8)
export enum ServiceRegistryL2ServiceState {
  NonExistent, // ?
  PreRegistration, // don't include security deposit value or bond value
  ActiveRegistration, // include security deposit value, not bond value
  FinishedRegistration, // include security deposit value and bond value
  Deployed, // ?
  TerminatedBonded, // ?
}
